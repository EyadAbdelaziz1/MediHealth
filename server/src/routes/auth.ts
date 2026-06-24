import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../services/appwriteDb.service';

const router = Router();

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '30d' });
};

router.post('/register', async (req: any, res: any) => {
  try {
    const { email, password, fullName, preferredLanguage } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const profile = await db.createUserProfile({
      userId: crypto.randomUUID(),
      email: email as string,
      fullName: fullName as string,
      preferredLanguage: (preferredLanguage as string) || 'ar',
    });

    const token = generateToken((profile as any).$id);

    res.status(201).json({
      user: {
        id: (profile as any).$id,
        email: (profile as any).email,
        fullName: (profile as any).fullName,
        preferredLanguage: (profile as any).preferredLanguage,
      },
      token,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    if (error.message?.includes('already exists') || error.code === 409) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const profiles = await db.listUserProfiles(email as string);
    const profile = profiles.find((p: any) => p.email === email);

    if (!profile) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken((profile as any).$id);

    res.json({
      user: {
        id: (profile as any).$id,
        email: (profile as any).email,
        fullName: (profile as any).fullName,
        preferredLanguage: (profile as any).preferredLanguage,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

router.get('/me', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const profile = await db.getUserProfile(decoded.userId);

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: (profile as any).$id,
        email: (profile as any).email,
        fullName: (profile as any).fullName,
        preferredLanguage: (profile as any).preferredLanguage,
      },
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

router.post('/forgot-password', async (req: any, res: any) => {
  try {
    const { email } = req.body;
    const profiles = await db.listUserProfiles(email as string);
    const profile = profiles.find((p: any) => p.email === email);

    if (profile) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await db.upsertPasswordReset((profile as any).$id, code, expiresAt);
      console.log(`Password reset code for ${email}: ${code}`);
    }

    res.json({ message: 'If an account with this email exists, a reset code has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request.' });
  }
});

router.post('/reset-password', async (req: any, res: any) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!code || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Valid code and new password (8+ chars) are required' });
    }

    const profiles = await db.listUserProfiles(email as string);
    const profile = profiles.find((p: any) => p.email === email);
    if (!profile) return res.status(400).json({ error: 'Invalid request' });

    const reset = await db.getPasswordReset((profile as any).$id);
    if (!reset || reset.code !== code) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    if (new Date() > new Date((reset as any).expiresAt)) {
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.markPasswordResetUsed((profile as any).$id);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

export default router;
