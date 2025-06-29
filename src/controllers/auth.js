import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../services/auth.js';

export const registerController = async (req, res) => {
  const user = await registerUser(req.body);
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

export const loginController = async (req, res) => {
  const { accessToken, refreshToken } = await loginUser(req.body);
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
  });
  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
};

export const refreshController = async (req, res) => {
  const oldToken = req.cookies.refreshToken;
  const { accessToken, refreshToken } = await refreshSession(oldToken);
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
  });
  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
};

export const logoutController = async (req, res) => {
  await logoutUser(req.cookies.refreshToken);
  res.clearCookie('refreshToken');
  res.status(204).send();
};
