import { test } from './fixtures';
import { expect } from '@playwright/test';
import { loginAsAdmin, logout, printSchulbescheinigungForRandomStudent } from './schulbescheinigung-flow';

test.describe('Student - Schulbescheinigung drucken', () => {
  test('Zufälligen Schüler auswählen und Schulbescheinigung als PDF drucken', async ({ page }) => {
    test.setTimeout(60000);

    // Login
    await loginAsAdmin(page);
    console.log('✓ Logged in');

    // Zufälligen Schüler auswählen, Schulbescheinigung drucken und PDF verifizieren
    await page.screenshot({ path: 'debug-images/schulbescheinigung-before-print.png' }).catch(() => {});
    const result = await printSchulbescheinigungForRandomStudent(page);
    console.log(`✓ Schülerdetailseite geöffnet (ID: ${result.studentId})`);
    console.log(`✓ "Schulbescheinigung drucken" geklickt`);
    console.log(`✓ PDF erfolgreich heruntergeladen und verifiziert: "${result.filename}" (${result.bytes} Bytes)`);

    expect(result.filename).toMatch(/^Schulbescheinigung.*\.pdf$/i);

    // Logout
    await logout(page);
    await expect(page.getByLabel('Datenbank-Schema')).toBeVisible({ timeout: 3000 });
    console.log('✓ Abgemeldet');
  });
});
