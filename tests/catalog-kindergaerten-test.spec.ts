import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';
import { exit } from 'process';

// Test for Kataloge > Kindergärten 

test.describe('Kataloge - Kindergärten', () => {
  test('should login, navigate to Kindergärten, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Kindergärten using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Kindergärten"]').click();

    // Verify we're on the Kindergärten page by checking for a specific element
    await page.waitForSelector('text=Kindergärten', { timeout: 2000 });

    // Click the '+' button to add a new Kindergarten
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Wait for observation
    await page.waitForTimeout(1000);

    // Fill in the Bezeichnung field
    const bezeichnungInput = page.getByLabel('Bezeichnung (zwischen 1 und 100 Zeichen)');
    await bezeichnungInput.waitFor({ state: 'visible' });
    await bezeichnungInput.fill('Test-Kindergarten Pippi Langstrumpf');
    await bezeichnungInput.press('Tab');

    // Fill in the Bemerkung field
    const bemerkungInput = page.getByLabel('Bemerkung (max. 50 Zeichen)');
    await bemerkungInput.waitFor({ state: 'visible' });
    await bemerkungInput.fill('Hat ein tolles Außengelände.');
    await bemerkungInput.press('Tab');

    // Change the Anzahl der Telefon field
    const telefonInput = page.getByLabel('Telefon (max. 20 Zeichen)');
    await telefonInput.waitFor({ state: 'visible' });
    await telefonInput.fill('012345-77777');
    await telefonInput.press('Tab');

    // Change the Anzahl der E-Mail-Adresse field
    const emailInput = page.getByLabel('E-Mail-Adresse (max. 40 Zeichen)');
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.fill('kindergarten@kita.example.com');
    await emailInput.press('Tab');

    // Change the Anzahl der Straße field
    const strasseInput = page.getByLabel('Straße (max. 55 Zeichen)');
    await strasseInput.waitFor({ state: 'visible' });
    await strasseInput.fill('Musterstraße 123');
    await strasseInput.press('Tab');

    // Change the Anzahl der PLZ field
    const plzInput = page.getByLabel('PLZ (max. 10 Zeichen)');
    await plzInput.waitFor({ state: 'visible' });
    await plzInput.fill('42287');
    await plzInput.press('Tab');

    // Change the Anzahl der Wohnort field
    const wohnortInput = page.getByLabel('Wohnort (max. 30 Zeichen)');
    await wohnortInput.waitFor({ state: 'visible' });
    await wohnortInput.fill('Wuppertal');
    await wohnortInput.press('Tab');

    // Change the Sortierung field
    const sortierungInput = page.getByLabel('Sortierung');
    await sortierungInput.waitFor({ state: 'visible' });
    await sortierungInput.fill('31999');
    await sortierungInput.press('Tab');

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Wait for observation
    await page.waitForTimeout(200);

    // Fill in the Bezeichnung field
    const bezeichnungNeuInput = page.getByLabel('Bezeichnung (zwischen 1 und 100 Zeichen)');
    await bezeichnungNeuInput.waitFor({ state: 'visible' });
    await bezeichnungNeuInput.fill('Test-Kindergarten Pippi Langstrumpf');
    await bezeichnungNeuInput.press('Tab');

    // Fill in the Bemerkung field
    const bemerkungNeuInput = page.getByLabel('Bemerkung (max. 50 Zeichen)');
    await bemerkungNeuInput.waitFor({ state: 'visible' });
    await bemerkungNeuInput.fill('Hat ein neues tolles Außengelände.');
    await bemerkungNeuInput.press('Tab');

    // Change the Anzahl der Telefon field
    const telefonNeuInput = page.getByLabel('Telefon (max. 20 Zeichen)');
    await telefonNeuInput.waitFor({ state: 'visible' });
    await telefonNeuInput.fill('012345-88888');
    await telefonNeuInput.press('Tab');

    // Change the Anzahl der E-Mail-Adresse field
    const emailNeuInput = page.getByLabel('E-Mail-Adresse (max. 40 Zeichen)');
    await emailNeuInput.waitFor({ state: 'visible' });
    await emailNeuInput.fill('neuerkindergarten@kita.example.com');
    await emailNeuInput.press('Tab');

    // Change the Anzahl der Straße field
    const strasseNeuInput = page.getByLabel('Straße (max. 55 Zeichen)');
    await strasseNeuInput.waitFor({ state: 'visible' });
    await strasseNeuInput.fill('Neumünsterstraße 123');
    await strasseNeuInput.press('Tab');

    // Change the Anzahl der PLZ field
    const plzNeuInput = page.getByLabel('PLZ (max. 10 Zeichen)');
    await plzNeuInput.waitFor({ state: 'visible' });
    await plzNeuInput.fill('42103');
    await plzNeuInput.press('Tab');

    // Change the Anzahl der Wohnort field
    const wohnortNeuInput = page.getByLabel('Wohnort (max. 30 Zeichen)');
    await wohnortNeuInput.waitFor({ state: 'visible' });
    await wohnortNeuInput.fill('Neu Elberfeld');
    await wohnortNeuInput.press('Tab');

    // Change the Sortierung field
    const sortierungNeuInput = page.getByLabel('Sortierung');
    await sortierungNeuInput.waitFor({ state: 'visible' });
    await sortierungNeuInput.fill('3199');
    await sortierungNeuInput.press('Tab');

    // Wait for observation
    await page.waitForTimeout(200);

    // Go to the checkbox after saving
    const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div[2]/div[2]/div/div[1]/input');
    await postSaveCheckbox.check();

    // Click the "Löschen" button to delete
    await page.locator('button:has-text("Löschen")').first().click();

    // Click the confirmation "Löschen" button
    await page.locator('button:has-text("Löschen")').last().click();

    // Wait for observation
    await page.waitForTimeout(0);
  });
});