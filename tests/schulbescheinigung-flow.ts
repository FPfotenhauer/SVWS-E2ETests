import { Page } from '@playwright/test';
import fs from 'fs';

export async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.getByLabel('Datenbank-Schema').click();
  await page.getByRole('option', { name: 'svwse2e' }).click();
  await page.getByLabel('Benutzername').fill('Admin');
  await page.getByLabel('Passwort').fill('');
  await page.getByRole('button', { name: /anmelden|login/i }).click();
  await page.waitForURL('**/svwse2e/**');
}

export async function logout(page: Page) {
  const logoutLink = page.getByRole('link', { name: /^Abmelden$/i })
    .or(page.getByText(/^Abmelden$/i))
    .first();
  await logoutLink.click();
  await page.waitForURL('**/login**', { timeout: 4000 }).catch(() => {});
}

export interface SchulbescheinigungResult {
  studentId: string | null;
  filename: string;
  bytes: number;
}

/**
 * Navigates to the student list, picks a random student and prints their
 * "Schulbescheinigung" as a PDF. Verifies the download is a non-empty PDF
 * named after the selected student. Reads directly from Playwright's own
 * (auto-cleaned) download storage so no artifact is left behind on disk.
 */
export async function printSchulbescheinigungForRandomStudent(page: Page): Promise<SchulbescheinigungResult> {
  const studentsLink = page.getByRole('link', { name: /schüler|students|pupils/i }).first()
    .or(page.getByRole('button', { name: /schüler|students|pupils/i }).first());
  if (await studentsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    await studentsLink.click();
  }
  await page.waitForTimeout(500);

  const rows = page.locator('[role="row"]');
  const rowCount = await rows.count();
  if (rowCount <= 1) {
    throw new Error('Keine Schüler in der Liste gefunden');
  }
  const randomIndex = 1 + Math.floor(Math.random() * (rowCount - 1));
  // The app lands on a "schueler/<id>/daten" URL right after login already (server
  // remembers the last-viewed student), so matching that generic pattern after the
  // click can resolve immediately without the navigation to the *new* student having
  // happened yet - especially under load. Wait for the URL to actually change instead.
  const previousUrl = page.url();
  await rows.nth(randomIndex).click();
  const navigated = await page
    .waitForURL((url) => url.toString() !== previousUrl, { timeout: 10000 })
    .then(() => true)
    .catch(() => false);
  await page.waitForTimeout(300);

  const studentId = navigated ? (page.url().match(/schueler\/(\d+)\/daten/)?.[1] ?? null) : null;

  const printButton = page.getByRole('button', { name: /Schulbescheinigung drucken/i });
  await printButton.waitFor({ state: 'visible', timeout: 20000 });

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    printButton.click(),
  ]);

  const filename = download.suggestedFilename();
  const downloadPath = await download.path();
  if (!downloadPath) {
    throw new Error('Kein Download-Pfad erhalten');
  }
  const stats = fs.statSync(downloadPath);
  const header = fs.readFileSync(downloadPath, { encoding: 'latin1', flag: 'r' }).slice(0, 5);
  if (header !== '%PDF-') {
    throw new Error(`Heruntergeladene Datei "${filename}" ist kein PDF (Header: "${header}")`);
  }
  if (stats.size <= 0) {
    throw new Error(`Heruntergeladene PDF-Datei "${filename}" ist leer`);
  }
  if (studentId && !filename.includes(`(${studentId})`)) {
    throw new Error(`Dateiname "${filename}" enthält nicht die erwartete Schüler-ID (${studentId})`);
  }

  return { studentId, filename, bytes: stats.size };
}
