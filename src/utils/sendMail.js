import nodemailer from 'nodemailer';
import { getEnvVariable } from './getEnvVariable.js';
import { SMTP } from '../constants/index.js';
import createHttpError from 'http-errors';

const transporter = nodemailer.createTransport({
  host: getEnvVariable(SMTP.SMTP_HOST),
  port: Number(getEnvVariable(SMTP.SMTP_PORT)),
  auth: {
    user: getEnvVariable(SMTP.SMTP_USER),
    pass: getEnvVariable(SMTP.SMTP_PASSWORD),
  },
});

export const sendEmail = async (options) => {
  try {
    await transporter.sendMail(options);
  } catch (error) {
    console.error(error);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
