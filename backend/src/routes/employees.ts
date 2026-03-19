import { Router, Request, Response } from 'express';
import { getAbacusClient } from '../abacusClient';

export const employeesRouter = Router();

// GET /api/employees
employeesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const client = getAbacusClient();
    const employees = await client.getEmployees();
    res.json(employees);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: 'Abacus error', detail: msg });
  }
});

// GET /api/employees/:id
employeesRouter.get('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return void res.status(400).json({ error: 'Invalid id' });
  try {
    const employee = await getAbacusClient().getEmployee(id);
    res.json(employee);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: 'Abacus error', detail: msg });
  }
});
