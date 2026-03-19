export interface Employee {
  Id: number;
  FirstName: string;
  LastName: string;
  Email?: string;
  EmployeeNumber?: string;
  Department?: string;
  IsActive?: boolean;
}

export interface AbsenceType {
  Id: number;
  Name: string;
  ShortName?: string;
  IsVacation?: boolean;
  IsPaid?: boolean;
}

export interface Absence {
  Id?: number;
  EmployeeId: number;
  AbsenceTypeId: number;
  StartDate: string;
  EndDate: string;
  Note?: string;
  Status?: string;
  DaysCount?: number;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  absences: AbsenceWithEmployee[];
}

export interface AbsenceWithEmployee extends Absence {
  employee?: Employee;
  absenceType?: AbsenceType;
}
