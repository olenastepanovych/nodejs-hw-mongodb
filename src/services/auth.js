import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';

dotenv.config();

const ACCESS_EXPIRES = 15 * 60;
const REFRESH_EXPIRES = 30 * 24 * 60 * 60;

export const registerUserService = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) return null;

  return User.create({ name, email, password });
};

export const loginUserService = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createHttpError(401, 'Invalid email or password');
  }

  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
  const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });

  await Session.deleteMany({ userId: user._id });
  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + ACCESS_EXPIRES * 1000),
    refreshTokenValidUntil: new Date(Date.now() + REFRESH_EXPIRES * 1000),
  });

  return { accessToken, refreshToken };
};

export const refreshSessionService = async (refreshToken) => {
  const oldSession = await Session.findOne({ refreshToken });
  if (!oldSession) throw createHttpError(401, 'Invalid refresh token');

  const accessToken = jwt.sign(
    { userId: oldSession.userId },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES },
  );
  const newRefreshToken = jwt.sign(
    { userId: oldSession.userId },
    process.env.JWT_SECRET,
    { expiresIn: REFRESH_EXPIRES },
  );

  await Session.deleteMany({ userId: oldSession.userId });
  await Session.create({
    userId: oldSession.userId,
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(Date.now() + ACCESS_EXPIRES * 1000),
    refreshTokenValidUntil: new Date(Date.now() + REFRESH_EXPIRES * 1000),
  });

  return { accessToken, refreshToken: newRefreshToken };
};

export const logoutUserService = async (refreshToken) => {
  await Session.deleteOne({ refreshToken });
};
