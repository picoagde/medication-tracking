import type { Medication, MedicationDraft } from './types';

const BASE = '/api/medications';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body && typeof body.error === 'string') message = body.error;
    } catch {
      // Response body was not JSON; keep the default message.
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function listMedications(): Promise<Medication[]> {
  return request<Medication[]>(BASE);
}

export async function createMedication(input: MedicationDraft): Promise<Medication> {
  return request<Medication>(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateMedication(id: string, input: MedicationDraft): Promise<Medication> {
  return request<Medication>(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function deleteMedication(id: string): Promise<void> {
  await request<null>(`${BASE}/${id}`, { method: 'DELETE' });
}
