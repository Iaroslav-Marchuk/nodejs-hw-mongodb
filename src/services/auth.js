import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';

import { UserCollection } from '../models/userModel.js';
import { SessionCollection } from '../models/sessionModel.js';
import { randomBytes } from 'crypto';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';

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
