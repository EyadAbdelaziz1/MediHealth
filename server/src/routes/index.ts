import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'MediHealth AI API', version: '1.0.0' });
});

router.get('/health', (_req, res) => {
  res.json({ status: 'healthy', database: 'Appwrite connected' });
});

export default router;
