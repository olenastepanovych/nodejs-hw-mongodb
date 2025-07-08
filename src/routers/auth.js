import express from 'express';
import {
  registerUserController,
  loginUserController,
  refreshSessionController,
  logoutUserController,
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerSchema, loginSchema } from '../validation/auth.js';
import { sendResetEmailController } from '../controllers/auth.js';
import { emailSchema } from '../schemas/authSchemas.js';
import { resetPasswordController } from '../controllers/auth.js';
import { resetPasswordSchema } from '../schemas/authSchemas.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), registerUserController);
router.post('/login', validateBody(loginSchema), loginUserController);
router.post('/refresh', refreshSessionController);
router.post('/logout', logoutUserController);
router.post(
  '/send-reset-email',
  validateBody(emailSchema),
  sendResetEmailController,
);
router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  resetPasswordController,
);

export default router;
