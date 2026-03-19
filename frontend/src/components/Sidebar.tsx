import type { Employee, AbsenceWithEmployee } from '../types';
import { employeeColour, formatDateShort } from '../lib/calendar';
import { parseISO } from 'date-fns';

interface Props {
  employees: Employee[];
  upcomingAbsences: AbsenceWithEmployee[];
  onEmployeeClick: (employee: Employee) => void;
}

export function Sidebar({ employees, upcomingAbsences, onEmployeeClick }: Props) {
  return (
    <aside className="w-60 border-r bg-gray-50 flex flex-col overflow-hidden shrink-0">
      {/* Logo / title */}
      <div className="px-4 py-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">FK</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Ferienkalender</div>
            <div className="text-xs text-gray-500">Abacus Integration</div>
          </div>
        </div>
      </div>

      {/* Team members */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Team ({employees.length})
          </h3>
          <ul className="space-y-0.5">
            {employees.map(emp => (
              <li key={emp.Id}>
                <button
                  onClick={() => onEmployeeClick(emp)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-left group"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 border
                      ${employeeColour(emp.Id)}`}
                  >
                    {emp.FirstName[0]}{emp.LastName[0]}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-800 truncate">
                      {emp.FirstName} {emp.LastName}
                    </div>
                    {emp.Department && (
                      <div className="text-xs text-gray-400 truncate">{emp.Department}</div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming absences */}
        {upcomingAbsences.length > 0 && (
          <div className="px-3 py-3 border-t mt-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              Bald abwesend
            </h3>
            <ul className="space-y-1.5">
              {upcomingAbsences.slice(0, 6).map(a => (
                <li
                  key={a.Id ?? `${a.EmployeeId}-${a.StartDate}`}
                  className={`px-2 py-1.5 rounded-lg border text-xs ${employeeColour(a.EmployeeId)}`}
                >
                  <div className="font-medium truncate">
                    {a.employee?.FirstName} {a.employee?.LastName}
                  </div>
                  <div className="opacity-70">
                    {formatDateShort(parseISO(a.StartDate))} – {formatDateShort(parseISO(a.EndDate))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
