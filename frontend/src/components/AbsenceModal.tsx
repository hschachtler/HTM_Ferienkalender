import { X, Pencil, Trash2, CalendarDays, User, Tag, StickyNote } from 'lucide-react';
import type { AbsenceWithEmployee } from '../types';
import { formatDateShort, employeeColour } from '../lib/calendar';
import { parseISO } from 'date-fns';

interface Props {
  absence: AbsenceWithEmployee;
  onEdit:  () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function AbsenceModal({ absence, onEdit, onDelete, onClose }: Props) {
  const emp  = absence.employee;
  const type = absence.absenceType;
  const colour = employeeColour(absence.EmployeeId);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 rounded-t-xl border-b`}>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${colour.split(' ')[0]}`} />
            <span className="font-semibold text-gray-900 text-sm">
              {emp ? `${emp.FirstName} ${emp.LastName}` : `Mitarbeiter #${absence.EmployeeId}`}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Details */}
        <div className="px-5 py-4 space-y-3">
          <Row icon={<User size={15} />} label="Mitarbeiter">
            {emp
              ? `${emp.FirstName} ${emp.LastName}${emp.Department ? ` · ${emp.Department}` : ''}`
              : `ID ${absence.EmployeeId}`}
          </Row>
          <Row icon={<Tag size={15} />} label="Art">
            {type?.Name ?? `Typ #${absence.AbsenceTypeId}`}
          </Row>
          <Row icon={<CalendarDays size={15} />} label="Zeitraum">
            {formatDateShort(parseISO(absence.StartDate))} – {formatDateShort(parseISO(absence.EndDate))}
            {absence.DaysCount ? ` (${absence.DaysCount} Tage)` : ''}
          </Row>
          {absence.Note && (
            <Row icon={<StickyNote size={15} />} label="Notiz">
              {absence.Note}
            </Row>
          )}
          {absence.Status && (
            <Row icon={<Tag size={15} />} label="Status">
              <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                {absence.Status}
              </span>
            </Row>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            <Pencil size={14} /> Bearbeiten
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg py-2 text-sm hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} /> Löschen
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 text-sm">
      <span className="mt-0.5 text-gray-400 shrink-0">{icon}</span>
      <div>
        <span className="text-gray-500 text-xs block">{label}</span>
        <span className="text-gray-900">{children}</span>
      </div>
    </div>
  );
}
