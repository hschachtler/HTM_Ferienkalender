import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getAbacusClient } from '../abacusClient';

export const absencesRouter = Router();

const AbsenceSchema = z.object({
  EmployeeId:    z.number().int().positive(),
  AbsenceTypeId: z.number().int().positive(),
  StartDate:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  EndDate:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  Note:          z.string().optional(),
});

// GET /api/absences?from=2026-01-01&to=2026-12-31&employeeId=123
absencesRouter.get('/', async (req: Request, res: Response) => {
  const { from, to, employeeId } = req.query;
  try {
    const client = getAbacusClient();
    let absences;
    if (employeeId) {
      absences = await client.getAbsencesForEmployee(
        parseInt(String(employeeId), 10),
        from ? String(from) : undefined,
        to   ? String(to)   : undefined
      );
    } else if (from && to) {
      absences = await client.getTeamAbsences(String(from), String(to));
    } else {
      // Default: current year
      const year = new Date().getFullYear();
      absences = await client.getTeamAbsences(`${year}-01-01`, `${year}-12-31`);
    }
    res.json(absences);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: 'Abacus error', detail: msg });
  }
});

// POST /api/absences
absencesRouter.post('/', async (req: Request, res: Response) => {
  const parsed = AbsenceSchema.safeParse(req.body);
  if (!parsed.success) {
    return void res.status(400).json({ error: 'Validation failed', detail: parsed.error.issues });
  }
  if (parsed.data.StartDate > parsed.data.EndDate) {
    return void res.status(400).json({ error: 'StartDate must be before or equal to EndDate' });
  }
  try {
    const absence = await getAbacusClient().createAbsence(parsed.data);
    res.status(201).json(absence);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: 'Abacus error', detail: msg });
  }
});

// PATCH /api/absences/:id
absencesRouter.patch('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return void res.status(400).json({ error: 'Invalid id' });

  const parsed = AbsenceSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return void res.status(400).json({ error: 'Validation failed', detail: parsed.error.issues });
  }
  try {
    await getAbacusClient().updateAbsence(id, parsed.data);
    res.status(204).send();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: 'Abacus error', detail: msg });
  }
});

// DELETE /api/absences/:id
absencesRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return void res.status(400).json({ error: 'Invalid id' });
  try {
    await getAbacusClient().deleteAbsence(id);
    res.status(204).send();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: 'Abacus error', detail: msg });
  }
});
