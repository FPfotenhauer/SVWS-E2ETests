import { test, expect } from '@playwright/test';
import { firefox } from 'playwright';
import { loginAsAdmin, logout, printSchulbescheinigungForRandomStudent } from './schulbescheinigung-flow';

// Anzahl paralleler "Nutzer": LOAD_TEST_CONCURRENCY=200 npx playwright test tests/student-print-schulbescheinigung-load-test.spec.ts
const CONCURRENCY = parseInt(process.env.LOAD_TEST_CONCURRENCY || '5', 10);
// Zeitversatz zwischen dem Start je zweier paralleler Durchläufe (ms)
const STAGGER_MS = parseInt(process.env.LOAD_TEST_STAGGER_MS || '250', 10);
// Anzahl separater Browser-Prozesse, über die die Durchläufe verteilt werden.
// Ein einzelner Browser-Prozess wird ab ~50-100 gleichzeitigen Tabs selbst zum
// Flaschenhals (JS-Hauptthread, IPC) statt den Server unter Last zu setzen.
// Mehrere Prozesse verteilen die Tabs und lassen echte Nebenläufigkeit beim Server ankommen.
const BROWSER_COUNT = Math.max(1, Math.min(CONCURRENCY, parseInt(process.env.LOAD_TEST_BROWSERS || '10', 10)));

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface WorkerResult {
  index: number;
  browserIndex: number;
  success: boolean;
  durationMs: number;
  filename?: string;
  error?: string;
}

test.describe('Lasttest - Schulbescheinigung drucken', () => {
  test(`${CONCURRENCY} parallele Anmeldungen drucken je eine zufällige Schulbescheinigung (Stagger ${STAGGER_MS}ms, ${BROWSER_COUNT} Browser-Prozesse)`, async () => {
    test.setTimeout(Math.max(60000, (CONCURRENCY - 1) * STAGGER_MS + 150000));

    console.log(
      `Starte Lasttest: ${CONCURRENCY} parallele Durchläufe über ${BROWSER_COUNT} Browser-Prozesse ` +
      `(Stagger ${STAGGER_MS}ms zwischen Start je zweier Durchläufe)`
    );

    // Mehrere unabhängige Browser-Prozesse starten, statt viele Tabs in einem
    // einzigen Prozess zu bündeln - das vermeidet, dass der Browser selbst zum
    // limitierenden Faktor wird, bevor der Server überhaupt unter Last gerät.
    const browsers = await Promise.all(
      Array.from({ length: BROWSER_COUNT }, () => firefox.launch())
    );
    console.log(`✓ ${browsers.length} Browser-Prozesse gestartet`);

    const runOne = async (index: number): Promise<WorkerResult> => {
      const browserIndex = index % browsers.length;
      if (index > 0) {
        await sleep(index * STAGGER_MS);
      }
      const start = Date.now();
      const context = await browsers[browserIndex].newContext({ ignoreHTTPSErrors: true, acceptDownloads: true });
      const page = await context.newPage();
      try {
        await loginAsAdmin(page);
        const result = await printSchulbescheinigungForRandomStudent(page);
        await logout(page);
        const durationMs = Date.now() - start;
        console.log(`✓ [Worker ${index}/Browser ${browserIndex}] "${result.filename}" (${result.bytes} Bytes) in ${durationMs}ms`);
        return { index, browserIndex, success: true, durationMs, filename: result.filename };
      } catch (err: any) {
        const durationMs = Date.now() - start;
        const message = err?.message || String(err);
        console.log(`✗ [Worker ${index}/Browser ${browserIndex}] Fehler nach ${durationMs}ms: ${message}`);
        return { index, browserIndex, success: false, durationMs, error: message };
      } finally {
        await context.close().catch(() => {});
      }
    };

    let results: WorkerResult[];
    try {
      const tasks: Promise<WorkerResult>[] = [];
      for (let i = 0; i < CONCURRENCY; i++) {
        tasks.push(runOne(i));
      }
      results = await Promise.all(tasks);
    } finally {
      await Promise.all(browsers.map((b) => b.close().catch(() => {})));
    }

    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);
    const durations = results.map((r) => r.durationMs);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;

    console.log('=== Lasttest-Zusammenfassung ===');
    console.log(`Erfolgreich: ${successes.length}/${CONCURRENCY}`);
    console.log(`Fehlgeschlagen: ${failures.length}/${CONCURRENCY}`);
    console.log(`Dauer (ms) — min: ${Math.min(...durations)}, max: ${Math.max(...durations)}, avg: ${avg.toFixed(0)}`);
    for (const f of failures) {
      console.log(`  Worker ${f.index}/Browser ${f.browserIndex}: ${f.error}`);
    }
    console.log('=== Ende Zusammenfassung ===');

    expect(failures, `${failures.length} von ${CONCURRENCY} parallelen Durchläufen sind fehlgeschlagen`).toHaveLength(0);
  });
});
