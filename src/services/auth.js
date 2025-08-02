import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

import { UserCollection } from '../models/userModel.js';
import { SessionCollection } from '../models/sessionModel.js';
import {
  FIFTEEN_MINUTES,
  ONE_DAY,
  SMTP,
  TEMPLATES_DIR,
} from '../constants/index.js';
import { getEnvVariable } from '../utils/getEnvVariable.js';
import { sendEmail } from '../utils/sendMail.js';

export const registerUserService = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });
  if (user) {
    throw createHttpError(409, 'Email in use!');
  }

  const encryptedPass = await bcrypt.hash(payload.password, 10);
  return await UserCollection.create({ ...payload, password: encryptedPass });
};

export const loginUserService = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });

  if (!user) {
    throw createHttpError(401, 'User not found!');
  }

  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await SessionCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + 30 * ONE_DAY),
  });
};

export const refreshUserSessionService = async ({
  sessionId,
  refreshToken,
}) => {
  const session = await SessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired ');
  }

  await SessionCollection.deleteOne({ _id: sessionId, refreshToken });

  const newAccessToken = randomBytes(30).toString('base64');
  const newRefreshToken = randomBytes(30).toString('base64');

  return await SessionCollection.create({
    userId: session.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + 30 * ONE_DAY),
  });
};

export const logoutUserService = async (sessionId) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};

export const requestResetTokenService = async (email) => {
  const user = await UserCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVariable('JWT_SECRET'),
    {
      expiresIn: '5m',
    },
  );

  const requestPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.hbs',
  );

  const requestPasswordTemplateSource = await fs.readFile(
    requestPasswordTemplatePath,
    'utf-8',
  );

  const template = handlebars.compile(requestPasswordTemplateSource);

  const html = template({
    name: user.name,
    link: `${getEnvVariable('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: `"Contacts App" <${getEnvVariable(SMTP.SMTP_FROM)}>`,
    to: email,
    subject: 'Reset your password',
    html,
  });
};

export const resetPasswordService = async (token, password) => {
  try {
    const decodedData = jwt.verify(token, getEnvVariable('JWT_SECRET'));
    const user = await UserCollection.findById(decodedData.sub);

    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    const encryptedPass = await bcrypt.hash(password, 10);
    await UserCollection.findByIdAndUpdate(user._id, {
      password: encryptedPass,
    });

    await SessionCollection.deleteOne({ userId: user._id });
  } catch (error) {
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError'
    ) {
      throw createHttpError(401, 'Token is expired or invalid.');
    }
    throw error;
  }
};
