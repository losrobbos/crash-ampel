// Führt alle Daten-Jobs aus und schreibt public/data-<ampel>.json.
// Fällt ein Job aus, werden die übrigen trotzdem geschrieben; nur wenn ALLE scheitern, bricht das Skript ab.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fetchAktien } from './aktien.mjs';

const JOBS = { aktien: fetchAktien };
mkdirSync('public', { recursive: true });
let ok = 0;
for (const [id, job] of Object.entries(JOBS)) {
  try {
    const data = await job();
    writeFileSync(`public/data-${id}.json`, JSON.stringify({ updated: new Date().toISOString(), ...data }));
    console.log('OK', id); ok++;
  } catch (err) { console.error('FEHLER', id, err.message); }
}
if (!ok) process.exit(1);
