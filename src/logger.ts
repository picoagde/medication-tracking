import { AddressInfo } from 'node:net';
import { mkdir, appendFile } from 'node:fs/promises';
import path from 'node:path';

// Request log file for the notes-app API server. The directory (and the file)
// is created on first write, so the server needs no extra setup to produce
// auditable request logs.
const LOG_DIR = path.resolve(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

// One request log entry is a single JSON line so it can be parsed by log
// tools (`jq`, ...) and is stable across runs.
export interface RequestLogEntry {
  ts: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  remote?: string;
  error?: string;
}

async function ensureLogFile(): Promise<void> {
  await mkdir(LOG_DIR, { recursive: true });
}

// Writes one request log entry to stdout and to `logs/app.log`.
export async function logRequest(entry: RequestLogEntry): Promise<void> {
  const line = `${JSON.stringify(entry)}\n`;
  console.log(line);
  await ensureLogFile();
  await appendFile(LOG_FILE, line, 'utf8');
}

// Logs the address/port the API server is listening on (startup info).
export async function logServerAddress(address: AddressInfo) {
  const line = `${JSON.stringify({
    ts: new Date().toISOString(),
    service: 'medication-app API',
    listening: true,
    address: address.address,
    port: address.port,
    url: `http://${address.address}:${address.port}`,
  })}\n`;
  console.log(line);
  await ensureLogFile();
  await appendFile(LOG_FILE, line, 'utf8');
}
