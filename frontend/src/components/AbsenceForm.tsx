import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Absence, Employee, AbsenceType } from '../types';
import { toISODate } from '../lib/calendar';

interface Props {
  initial?: Partial<Absence>;
  employees: Employee[];
  absenceTypes: AbsenceType[];
  onSave: (data: Omit<Absence, 'Id'>) => void;
  onClose: () => void;
  loading?: boolean;
}

export function AbsenceForm({ initial, employees, absenceTypes, onSave, onClose, loading }: Props) {
  const today = toISODate(new Date());
  const [form, setForm] = useState({
    EmployeeId:    initial?.EmployeeId    ?? (employees[0]?.Id ?? 0),
    AbsenceTypeId: initial?.AbsenceTypeId ?? (absenceTypes[0]?.Id ?? 0),
    StartDate:     initial?.StartDate     ?? today,
    EndDate:       initial?.EndDate       ?? today,
    Note:          initial?.Note          ?? '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (form.StartDate > form.EndDate) {
      setError('Enddatum muss nach dem Startdatum liegen.');
    } else {
      setError('');
    }
  }, [form.StartDate, form.EndDate]);

  function set(key: string, value: string | number) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (error) return;
    onSave({
      EmployeeId:    Number(form.EmployeeId),
      AbsenceTypeId: Number(form.AbsenceTypeId),
      StartDate:     form.StartDate,
      EndDate:       form.EndDate,
      Note:          form.Note || undefined,
    });
  }

  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial?.Id ? 'Abwesenheit bearbeiten' : 'Abwesenheit erfassen'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Employee */}
          <div>
            <label className={labelCls}>Mitarbeiter</label>
            <select
              className={inputCls}
              value={form.EmployeeId}
              onChange={e => set('EmployeeId', e.target.value)}
              required
            >
              {employees.map(emp => (
                <option key={emp.Id} value={emp.Id}>
                  {emp.LastName}, {emp.FirstName}
                  {emp.Department ? ` · ${emp.Department}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Absence type */}
          <div>
            <label className={labelCls}>Art der Abwesenheit</label>
            <select
              className={inputCls}
              value={form.AbsenceTypeId}
              onChange={e => set('AbsenceTypeId', e.target.value)}
              required
            >
              {absenceTypes.map(t => (
                <option key={t.Id} value={t.Id}>{t.Name}</option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Von</label>
              <input
                type="date"
                className={inputCls}
                value={form.StartDate}
                onChange={e => set('StartDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Bis</label>
              <input
                type="date"
                className={inputCls}
                value={form.EndDate}
                min={form.StartDate}
                onChange={e => set('EndDate', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Validation error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Note */}
          <div>
            <label className={labelCls}>Notiz (optional)</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              value={form.Note}
              onChange={e => set('Note', e.target.value)}
              placeholder="z.B. Sommerferien, Arzttermin …"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!!error || loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Wird gespeichert…' : 'In Abacus speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
