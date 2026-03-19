import { useState, useMemo } from 'react';
import { addMonths, subMonths, isAfter, startOfToday, parseISO } from 'date-fns';
import { MonthView }    from './components/MonthView';
import { Sidebar }      from './components/Sidebar';
import { AbsenceForm }  from './components/AbsenceForm';
import { AbsenceModal } from './components/AbsenceModal';
import {
  useEmployees, useAbsenceTypes, useTeamAbsences,
  useCreateAbsence, useUpdateAbsence, useDeleteAbsence,
} from './hooks/useData';
import {
  buildCalendarDays, monthRange, toISODate,
} from './lib/calendar';
import type { AbsenceWithEmployee, Employee, Absence } from './types';

export default function App() {
  const [month,         setMonth]         = useState(new Date());
  const [showForm,      setShowForm]      = useState(false);
  const [editAbsence,   setEditAbsence]   = useState<AbsenceWithEmployee | null>(null);
  const [detailAbsence, setDetailAbsence] = useState<AbsenceWithEmployee | null>(null);
  const [formInitial,   setFormInitial]   = useState<Partial<Absence>>({});

  const { from, to } = monthRange(month);

  const { data: employees    = [], isLoading: loadingEmp  } = useEmployees();
  const { data: absenceTypes = [], isLoading: loadingTypes } = useAbsenceTypes();
  const { data: absences     = [], isLoading: loadingAbs  } = useTeamAbsences(from, to);

  const createMut = useCreateAbsence();
  const updateMut = useUpdateAbsence();
  const deleteMut = useDeleteAbsence();

  const days = useMemo(
    () => buildCalendarDays(month, absences, employees, absenceTypes),
    [month, absences, employees, absenceTypes]
  );

  const upcomingAbsences = useMemo<AbsenceWithEmployee[]>(() => {
    const today = startOfToday();
    const empMap  = new Map(employees.map(e => [e.Id, e]));
    const typeMap = new Map(absenceTypes.map(t => [t.Id, t]));
    return absences
      .filter(a => isAfter(parseISO(a.StartDate), today))
      .slice(0, 8)
      .map(a => ({ ...a, employee: empMap.get(a.EmployeeId), absenceType: typeMap.get(a.AbsenceTypeId) }));
  }, [absences, employees, absenceTypes]);

  function handleAddAbsence(date?: Date) {
    setFormInitial(date ? { StartDate: toISODate(date), EndDate: toISODate(date) } : {});
    setEditAbsence(null);
    setShowForm(true);
  }

  function handleEditAbsence(absence: AbsenceWithEmployee) {
    setDetailAbsence(null);
    setEditAbsence(absence);
    setFormInitial(absence);
    setShowForm(true);
  }

  async function handleSave(data: Omit<Absence, 'Id'>) {
    if (editAbsence?.Id) {
      await updateMut.mutateAsync({ id: editAbsence.Id, changes: data });
    } else {
      await createMut.mutateAsync(data);
    }
    setShowForm(false);
    setEditAbsence(null);
  }

  async function handleDelete(id: number) {
    if (!confirm('Abwesenheit wirklich löschen? Dies wird auch in Abacus gelöscht.')) return;
    await deleteMut.mutateAsync(id);
    setDetailAbsence(null);
  }

  const isLoading = loadingEmp || loadingTypes || loadingAbs;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Loading bar */}
      {isLoading && (
        <div className="h-0.5 bg-blue-600 animate-pulse" />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          employees={employees}
          upcomingAbsences={upcomingAbsences}
          onEmployeeClick={(_emp: Employee) => {}}
        />

        {/* Calendar */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <MonthView
            month={month}
            days={days}
            onPrev={()  => setMonth(m => subMonths(m, 1))}
            onNext={()  => setMonth(m => addMonths(m, 1))}
            onToday={()  => setMonth(new Date())}
            onAddAbsence={handleAddAbsence}
            onAbsenceClick={a => setDetailAbsence(a)}
          />
        </main>
      </div>

      {/* Absence form modal */}
      {showForm && (
        <AbsenceForm
          initial={formInitial}
          employees={employees}
          absenceTypes={absenceTypes}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditAbsence(null); }}
          loading={createMut.isPending || updateMut.isPending}
        />
      )}

      {/* Absence detail modal */}
      {detailAbsence && (
        <AbsenceModal
          absence={detailAbsence}
          onEdit={() => handleEditAbsence(detailAbsence)}
          onDelete={() => detailAbsence.Id && handleDelete(detailAbsence.Id)}
          onClose={() => setDetailAbsence(null)}
        />
      )}
    </div>
  );
}
