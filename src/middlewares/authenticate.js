import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return next(createHttpError(401, 'No access token'));

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    const session = await SessionsCollection.findOne({ accessToken: token });
    if (!session || new Date() > session.accessTokenValidUntil)
      throw createHttpError(401, 'Access token expired');

    const user = await UsersCollection.findById(session.userId);
    if (!user) throw createHttpError(401, 'User not found');

    req.user = user;
    next();
  } catch {
    next(createHttpError(401, 'Access token expired'));
  }
};
