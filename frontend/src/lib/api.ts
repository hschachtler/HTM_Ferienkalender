import type { Employee, AbsenceType, Absence } from '../types';

const BASE = '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const api = {
  // Employees
  getEmployees: () =>
    apiFetch<Employee[]>('/employees'),

  // Absence types
  getAbsenceTypes: () =>
    apiFetch<AbsenceType[]>('/absence-types'),

  // Absences
  getTeamAbsences: (from: string, to: string) =>
    apiFetch<Absence[]>(`/absences?from=${from}&to=${to}`),

  getEmployeeAbsences: (employeeId: number, from?: string, to?: string) => {
    const params = new URLSearchParams({ employeeId: String(employeeId) });
    if (from) params.set('from', from);
    if (to)   params.set('to', to);
    return apiFetch<Absence[]>(`/absences?${params}`);
  },

  createAbsence: (data: Omit<Absence, 'Id'>) =>
    apiFetch<Absence>('/absences', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAbsence: (id: number, changes: Partial<Omit<Absence, 'Id'>>) =>
    apiFetch<void>(`/absences/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    }),

  deleteAbsence: (id: number) =>
    apiFetch<void>(`/absences/${id}`, { method: 'DELETE' }),
};
