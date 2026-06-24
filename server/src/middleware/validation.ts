import type { Request, Response, NextFunction } from 'express';

export const validateAuthRequest = (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as Record<string, unknown>;
  const { email, password, fullName } = body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required',
      field: !email ? 'email' : 'password',
    });
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format', field: 'email' });
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters',
      field: 'password',
    });
  }

  if (fullName !== undefined && typeof fullName !== 'string') {
    return res.status(400).json({ error: 'Full name must be a string', field: 'fullName' });
  }

  if (typeof fullName === 'string' && fullName.trim().length < 2) {
    return res.status(400).json({
      error: 'Full name must be at least 2 characters',
      field: 'fullName',
    });
  }

  next();
};

export const validateMedicationRequest = (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as Record<string, unknown>;
  const { name } = body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      error: 'Medication name is required and must be at least 2 characters',
      field: 'name',
    });
  }

  if (name.length > 200) {
    return res.status(400).json({
      error: 'Medication name must be less than 200 characters',
      field: 'name',
    });
  }

  next();
};

export const validateAnalysisRequest = (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as Record<string, unknown>;
  const { medications, language } = body;

  if (!medications || !Array.isArray(medications) || medications.length === 0) {
    return res.status(400).json({
      error: 'At least one medication is required',
      field: 'medications',
    });
  }

  if (medications.length > 20) {
    return res.status(400).json({
      error: 'Maximum 20 medications allowed per analysis',
      field: 'medications',
    });
  }

  for (const med of medications) {
    if (typeof med !== 'string' || med.trim().length < 2) {
      return res.status(400).json({
        error: 'Each medication name must be at least 2 characters',
        field: 'medications',
      });
    }
  }

  if (language && !['ar', 'en'].includes(language as string)) {
    return res.status(400).json({
      error: 'Language must be either "ar" or "en"',
      field: 'language',
    });
  }

  next();
};
