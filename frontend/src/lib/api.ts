import type { Employee, AbsenceType, Absence } from '../types';

const ABACUS_URL = 'https://abac.hartmann-group.ch';
const MANDANT    = 7777;
const BASE_ODATA = `${ABACUS_URL}/api/entity/v1/mandants/${MANDANT}`;

// OAuth2 Token-Cache
let _token: string | null = null;
let _tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry - 60_000) return _token;
  const clientId     = import.meta.env.VITE_ABACUS_CLIENT_ID     ?? '';
  const clientSecret = import.meta.env.VITE_ABACUS_CLIENT_SECRET ?? '';
  const res = await fetch(`${ABACUS_URL}/oauth/oauth2/v1/token`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`Abacus Auth fehlgeschlagen: ${res.status}`);
  const data = await res.json();
  _token = data.access_token;
  _tokenExpiry = Date.now() + data.expires_in * 1000;
  return _token!;
}

async function abacusFetch<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: object,
  params?: Record<string, string>
): Promise<T> {
  const token = await getToken();
  let url = `${BASE_ODATA}/${path}`;
  if (params) url += '?' + new URLSearchParams(params).toString();
  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept':        'application/json',
      'Content-Type':  'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as unknown as T;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Abacus ${res.status} [${method} ${path}]: ${err}`);
  }
  const json = await res.json();
  // OData gibt { value: [...] } zurück, einzelne Entities direkt
  return json.value ?? json;
}

export const api = {
  // Mitarbeitende
  getEmployees: () =>
    abacusFetch<Employee[]>('GET', 'Subjects', undefined, {
      $select:  'Id,FirstName,LastName,Email,EmployeeNumber,Department',
      $orderby: 'LastName asc,FirstName asc',
      $filter:  'IsActive eq true',
    }),

  // Absenztypen
  getAbsenceTypes: () =>
    abacusFetch<AbsenceType[]>('GET', 'AbsenceTypes', undefined, {
      $select: 'Id,Name,ShortName,IsVacation,IsPaid',
    }),

  // Absenzen lesen (Team, Zeitraum)
  getTeamAbsences: (from: string, to: string) =>
    abacusFetch<Absence[]>('GET', 'EmployeeAbsences', undefined, {
      $select:  'Id,EmployeeId,AbsenceTypeId,StartDate,EndDate,Note,Status,DaysCount',
      $orderby: 'StartDate asc',
      $filter:  `StartDate le ${to} and EndDate ge ${from}`,
    }),

  getEmployeeAbsences: (employeeId: number, from?: string, to?: string) => {
    let filter = `EmployeeId eq ${employeeId}`;
    if (from) filter += ` and EndDate ge ${from}`;
    if (to)   filter += ` and StartDate le ${to}`;
    return abacusFetch<Absence[]>('GET', 'EmployeeAbsences', undefined, {
      $select:  'Id,EmployeeId,AbsenceTypeId,StartDate,EndDate,Note,Status,DaysCount',
      $orderby: 'StartDate asc',
      $filter:  filter,
    });
  },

  // Absenzen schreiben → direkt in Abacus ERP
  createAbsence: (data: Omit<Absence, 'Id'>) =>
    abacusFetch<Absence>('POST', 'EmployeeAbsences', data),

  updateAbsence: (id: number, changes: Partial<Omit<Absence, 'Id'>>) =>
    abacusFetch<void>('PATCH', `EmployeeAbsences(${id})`, changes),

  deleteAbsence: (id: number) =>
    abacusFetch<void>('DELETE', `EmployeeAbsences(${id})`),
};
