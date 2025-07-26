import createHttpError from 'http-errors';
import { SessionCollection } from '../models/sessionModel.js';
import { UserCollection } from '../models/userModel.js';

export const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    next(createHttpError(401, 'Please provide Authorization header'));
    return;
  }
  const [bearer, token] = authorization.split(' ', 2);

  if (bearer !== 'Bearer' || !token) {
    throw createHttpError(401, 'Auth header should be of type Bearer');
  }

  const session = await SessionCollection.findOne({ accessToken: token });

  if (!session) {
    next(createHttpError(401, 'Session not found'));
    return;
  }

  const isAccessTokenExpired =
    new Date() > new Date(session.accessTokenValidUntil);

  if (isAccessTokenExpired) {
    next(createHttpError(401, 'Access token expired!'));
  }

  const user = await UserCollection.findById(session.userId);

  if (!user) {
    next(createHttpError(401, 'User not found'));
    return;
  }

  req.user = user;

  next();
};
