import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isWeekend,
  format, parseISO, isWithinInterval,
} from 'date-fns';
import { de } from 'date-fns/locale';
import type { CalendarDay, Absence, AbsenceWithEmployee, Employee, AbsenceType } from '../types';

export function buildCalendarDays(
  month: Date,
  absences: Absence[],
  employees: Employee[],
  absenceTypes: AbsenceType[],
): CalendarDay[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end   = endOfWeek(endOfMonth(month),     { weekStartsOn: 1 });

  const empMap  = new Map(employees.map(e => [e.Id, e]));
  const typeMap = new Map(absenceTypes.map(t => [t.Id, t]));

  return eachDayOfInterval({ start, end }).map(date => {
    const dayAbsences: AbsenceWithEmployee[] = absences
      .filter(a => {
        const s = parseISO(a.StartDate);
        const e = parseISO(a.EndDate);
        return isWithinInterval(date, { start: s, end: e });
      })
      .map(a => ({
        ...a,
        employee:    empMap.get(a.EmployeeId),
        absenceType: typeMap.get(a.AbsenceTypeId),
      }));

    return {
      date,
      isCurrentMonth: isSameMonth(date, month),
      isToday:        isToday(date),
      isWeekend:      isWeekend(date),
      absences:       dayAbsences,
    };
  });
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: de });
}

export function formatDateShort(date: Date): string {
  return format(date, 'dd.MM.yyyy');
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function monthRange(month: Date): { from: string; to: string } {
  return {
    from: toISODate(startOfMonth(month)),
    to:   toISODate(endOfMonth(month)),
  };
}

// Pastel colour per employee (deterministic)
const PALETTE = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-red-100 text-red-800 border-red-200',
];

export function employeeColour(employeeId: number): string {
  return PALETTE[employeeId % PALETTE.length];
}
