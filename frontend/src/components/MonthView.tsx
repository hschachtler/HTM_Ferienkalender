import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { CalendarDay, AbsenceWithEmployee } from '../types';
import { formatMonthYear, employeeColour } from '../lib/calendar';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

interface Props {
  month: Date;
  days: CalendarDay[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddAbsence: (date?: Date) => void;
  onAbsenceClick: (absence: AbsenceWithEmployee) => void;
}

export function MonthView({ month, days, onPrev, onNext, onToday, onAddAbsence, onAbsenceClick }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base font-semibold text-gray-900 w-40 text-center capitalize">
            {formatMonthYear(month)}
          </h2>
          <button
            onClick={onNext}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="Nächster Monat"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToday}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          >
            Heute
          </button>
          <button
            onClick={() => onAddAbsence()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={16} />
            Abwesenheit
          </button>
        </div>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {WEEKDAYS.map(d => (
          <div
            key={d}
            className={`py-2 text-center text-xs font-medium uppercase tracking-wide
              ${d === 'Sa' || d === 'So' ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 border-l border-t overflow-auto">
        {days.map((day, i) => (
          <DayCell
            key={i}
            day={day}
            onAddAbsence={() => onAddAbsence(day.date)}
            onAbsenceClick={onAbsenceClick}
          />
        ))}
      </div>
    </div>
  );
}

function DayCell({
  day,
  onAddAbsence,
  onAbsenceClick,
}: {
  day: CalendarDay;
  onAddAbsence: () => void;
  onAbsenceClick: (a: AbsenceWithEmployee) => void;
}) {
  const { date, isCurrentMonth, isToday, isWeekend, absences } = day;

  return (
    <div
      className={`border-b border-r min-h-[90px] p-1.5 flex flex-col group transition-colors
        ${!isCurrentMonth ? 'bg-gray-50/60' : isWeekend ? 'bg-gray-50/40' : 'bg-white'}
        hover:bg-blue-50/30`}
    >
      {/* Date number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium
            ${isToday
              ? 'bg-blue-600 text-white'
              : isCurrentMonth
                ? isWeekend ? 'text-gray-400' : 'text-gray-700'
                : 'text-gray-300'}`}
        >
          {date.getDate()}
        </span>
        {/* Add button (shows on hover) */}
        {isCurrentMonth && !isWeekend && (
          <button
            onClick={onAddAbsence}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-blue-100 text-blue-400 hover:text-blue-600"
            aria-label="Abwesenheit hinzufügen"
          >
            <Plus size={12} />
          </button>
        )}
      </div>

      {/* Absences */}
      <div className="flex flex-col gap-0.5 overflow-hidden">
        {absences.slice(0, 3).map(a => (
          <button
            key={a.Id ?? `${a.EmployeeId}-${a.StartDate}`}
            onClick={() => onAbsenceClick(a)}
            className={`w-full text-left text-xs px-1.5 py-0.5 rounded border truncate
              font-medium transition-opacity hover:opacity-80
              ${employeeColour(a.EmployeeId)}`}
            title={`${a.employee?.FirstName ?? ''} ${a.employee?.LastName ?? ''} · ${a.absenceType?.Name ?? ''}`}
          >
            {a.employee?.FirstName?.[0]}{a.employee?.LastName?.[0] ?? '?'} · {a.absenceType?.ShortName ?? a.absenceType?.Name ?? '?'}
          </button>
        ))}
        {absences.length > 3 && (
          <span className="text-xs text-gray-400 px-1">+{absences.length - 3} weitere</span>
        )}
      </div>
    </div>
  );
}
