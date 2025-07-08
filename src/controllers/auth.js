import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import {
  registerUserService,
  loginUserService,
  refreshSessionService,
  logoutUserService,
} from '../services/auth.js';

import { sendResetPasswordEmail } from '../services/emailService.js';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';

export const resetPasswordController = async (req, res) => {
  const { token, password } = req.body;

  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email });

    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await Session.deleteMany({ userId: user._id });
    await user.save();

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      throw createHttpError(401, 'Token is expired or invalid.');
    }
    throw err;
  }
};

export const sendResetEmailController = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const payload = { email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' });

  try {
    await sendResetPasswordEmail(email, token);
  } catch (err) {
    console.error('Email sending error:', err);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const registerUserController = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await registerUserService({
    name,
    email,
    password: hashedPassword,
  });

  if (!user) throw createHttpError(409, 'Email in use');

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: { id: user._id, name: user.name, email: user.email },
  });
};

export const loginUserController = async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken } = await loginUserService(email, password);

  res.cookie('accessToken', accessToken, { httpOnly: true });
  res.cookie('refreshToken', refreshToken, { httpOnly: true });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
};

export const refreshSessionController = async (req, res) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;
  const { accessToken, refreshToken } = await refreshSessionService(
    refreshTokenFromCookie,
  );

  res.cookie('refreshToken', refreshToken, { httpOnly: true });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
};

export const logoutUserController = async (req, res) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;
  await logoutUserService(refreshTokenFromCookie);

  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');

  res.status(204).send();
};
