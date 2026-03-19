import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { employeesRouter }   from './routes/employees';
import { absencesRouter }    from './routes/absences';
import { absenceTypesRouter } from './routes/absenceTypes';
import { getAbacusClient }   from './abacusClient';

const app  = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/employees',     employeesRouter);
app.use('/api/absences',      absencesRouter);
app.use('/api/absence-types', absenceTypesRouter);

// GET /api/health
app.get('/api/health', async (_req, res) => {
  const abacusOk = await getAbacusClient().ping();
  res.json({
    status: 'ok',
    abacus: abacusOk ? 'connected' : 'unreachable',
    timestamp: new Date().toISOString(),
  });
});

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Ferienkalender Backend läuft auf http://localhost:${PORT}`);
  console.log(`   Abacus Server: ${process.env.ABACUS_SERVER_URL ?? '(nicht konfiguriert)'}`);
  console.log(`   Mandant:       ${process.env.ABACUS_MANDANT    ?? '(nicht konfiguriert)'}`);
});

export default app;
