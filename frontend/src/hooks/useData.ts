import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Absence } from '../types';

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: api.getEmployees,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAbsenceTypes() {
  return useQuery({
    queryKey: ['absenceTypes'],
    queryFn: api.getAbsenceTypes,
    staleTime: 10 * 60 * 1000,
  });
}

export function useTeamAbsences(from: string, to: string) {
  return useQuery({
    queryKey: ['absences', from, to],
    queryFn: () => api.getTeamAbsences(from, to),
    enabled: !!from && !!to,
  });
}

export function useCreateAbsence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Absence, 'Id'>) => api.createAbsence(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['absences'] }),
  });
}

export function useUpdateAbsence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: Partial<Omit<Absence, 'Id'>> }) =>
      api.updateAbsence(id, changes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['absences'] }),
  });
}

export function useDeleteAbsence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteAbsence(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['absences'] }),
  });
}
