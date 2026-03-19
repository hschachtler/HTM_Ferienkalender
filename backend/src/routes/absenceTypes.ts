import { Router, Request, Response } from 'express';
import { getAbacusClient } from '../abacusClient';

export const absenceTypesRouter = Router();

// GET /api/absence-types
absenceTypesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const types = await getAbacusClient().getAbsenceTypes();
    res.json(types);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: 'Abacus error', detail: msg });
  }
});
