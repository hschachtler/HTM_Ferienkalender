/**
 * Abacus ERP REST API Client
 * OAuth 2.0 client_credentials + OData 4.0
 */

export interface AbacusConfig {
  serverUrl: string;
  mandant: number;
  clientId: string;
  clientSecret: string;
}

export interface AbacusToken {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope?: string;
  expiresAt?: number;
}

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
  StartDate: string;   // ISO: "2026-07-01"
  EndDate: string;     // ISO: "2026-07-14"
  Note?: string;
  Status?: string;
  DaysCount?: number;
}

interface ODataList<T> {
  value: T[];
  '@odata.nextLink'?: string;
}

export class AbacusClient {
  private cfg: AbacusConfig;
  private token: AbacusToken | null = null;

  constructor(config: AbacusConfig) {
    this.cfg = config;
  }

  // ── Auth ──────────────────────────────────────────────────────

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    const buffer = 60_000;
    if (this.token?.expiresAt && now < this.token.expiresAt - buffer) {
      return this.token.access_token;
    }

    const credentials = Buffer.from(
      `${this.cfg.clientId}:${this.cfg.clientSecret}`
    ).toString('base64');

    const res = await fetch(
      `${this.cfg.serverUrl}/oauth/oauth2/v1/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
          Accept: 'application/json',
        },
        body: 'grant_type=client_credentials',
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Abacus auth failed ${res.status}: ${err}`);
    }

    const data: AbacusToken = await res.json();
    data.expiresAt = now + data.expires_in * 1000;
    this.token = data;
    return data.access_token;
  }

  // ── Base request ──────────────────────────────────────────────

  private get base(): string {
    return `${this.cfg.serverUrl}/api/entity/v1/mandants/${this.cfg.mandant}`;
  }

  private async req<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    body?: object,
    params?: Record<string, string>
  ): Promise<T> {
    const token = await this.getAccessToken();
    let url = `${this.base}/${path}`;
    if (params && Object.keys(params).length) {
      url += '?' + new URLSearchParams(params).toString();
    }
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 204) return undefined as unknown as T;
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Abacus API ${res.status} [${method} ${path}]: ${err}`);
    }
    return res.json();
  }

  // ── Employees ─────────────────────────────────────────────────

  async getEmployees(filter?: string): Promise<Employee[]> {
    const params: Record<string, string> = {
      $select: 'Id,FirstName,LastName,Email,EmployeeNumber,Department',
      $orderby: 'LastName asc,FirstName asc',
      $filter: 'IsActive eq true',
    };
    if (filter) params.$filter = filter;
    const res = await this.req<ODataList<Employee>>('GET', 'Subjects', undefined, params);
    return res.value;
  }

  async getEmployee(id: number): Promise<Employee> {
    return this.req<Employee>('GET', `Subjects(${id})`);
  }

  // ── Absence types ─────────────────────────────────────────────

  async getAbsenceTypes(): Promise<AbsenceType[]> {
    const res = await this.req<ODataList<AbsenceType>>(
      'GET', 'AbsenceTypes', undefined,
      { $select: 'Id,Name,ShortName,IsVacation,IsPaid' }
    );
    return res.value;
  }

  async getVacationTypes(): Promise<AbsenceType[]> {
    const all = await this.getAbsenceTypes();
    return all.filter(t => t.IsVacation === true);
  }

  // ── Absences (CRUD) ───────────────────────────────────────────

  async getAbsences(filter?: string): Promise<Absence[]> {
    const params: Record<string, string> = {
      $select: 'Id,EmployeeId,AbsenceTypeId,StartDate,EndDate,Note,Status,DaysCount',
      $orderby: 'StartDate asc',
    };
    if (filter) params.$filter = filter;
    const res = await this.req<ODataList<Absence>>('GET', 'EmployeeAbsences', undefined, params);
    return res.value;
  }

  async getTeamAbsences(from: string, to: string): Promise<Absence[]> {
    return this.getAbsences(`StartDate le ${to} and EndDate ge ${from}`);
  }

  async getAbsencesForEmployee(
    employeeId: number,
    from?: string,
    to?: string
  ): Promise<Absence[]> {
    let filter = `EmployeeId eq ${employeeId}`;
    if (from) filter += ` and EndDate ge ${from}`;
    if (to)   filter += ` and StartDate le ${to}`;
    return this.getAbsences(filter);
  }

  async createAbsence(data: Omit<Absence, 'Id'>): Promise<Absence> {
    return this.req<Absence>('POST', 'EmployeeAbsences', data);
  }

  async updateAbsence(id: number, changes: Partial<Omit<Absence, 'Id'>>): Promise<void> {
    await this.req<void>('PATCH', `EmployeeAbsences(${id})`, changes);
  }

  async deleteAbsence(id: number): Promise<void> {
    await this.req<void>('DELETE', `EmployeeAbsences(${id})`);
  }

  // ── Health check ──────────────────────────────────────────────

  async ping(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton factory
let _client: AbacusClient | null = null;
export function getAbacusClient(): AbacusClient {
  if (!_client) {
    _client = new AbacusClient({
      serverUrl:    process.env.ABACUS_SERVER_URL    ?? '',
      mandant:      parseInt(process.env.ABACUS_MANDANT ?? '0', 10),
      clientId:     process.env.ABACUS_CLIENT_ID     ?? '',
      clientSecret: process.env.ABACUS_CLIENT_SECRET ?? '',
    });
  }
  return _client;
}
