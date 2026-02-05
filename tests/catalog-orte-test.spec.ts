import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';
import { exit } from 'process';

const keepTestData = process.env.KEEP_TEST_DATA === 'true' || process.env.KEEP_TEST_DATA === '1';

// Test for Kataloge > Orte

test.describe('Kataloge - Orte', () => {
  test('should login, navigate to Orte, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Orte using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Orte"]').click();

    // Verify we're on the Orte page by checking for a specific element
    await page.waitForSelector('text=Orte', { timeout: 2000 });
    
    // Click the '+' button to add a new Ort
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Wait for observation
    await page.waitForTimeout(200);

    // Fill in the PLZ field
    const plzInput = page.getByLabel('PLZ (zwischen 1 und 10 Zeichen)');
    await plzInput.waitFor({ state: 'visible' });
    await plzInput.fill('99123');
    await plzInput.press('Tab');

    // Fill in the Ortsname field
    const ortsnameInput = page.getByLabel('Ortsname (zwischen 1 und 50 Zeichen)');
    await ortsnameInput.waitFor({ state: 'visible' });
    await ortsnameInput.fill('Wupperhausen');
    await ortsnameInput.press('Tab');

    // Fill in the Kreis field
    const kreisInput = page.getByLabel('Kreis (max. 3 Zeichen)');
    await kreisInput.waitFor({ state: 'visible' });
    await kreisInput.fill('WU');
    await kreisInput.press('Tab');

    // Fill in the Land field
    const landInput = page.getByLabel('Land (max. 2 Zeichen)');
    await landInput.waitFor({ state: 'visible' });
    await landInput.fill('NW');
    await landInput.press('Tab');

    // Fill in the Sortierung field
    const sortierungInput = page.getByLabel('Sortierung');
    await sortierungInput.waitFor({ state: 'visible' });
    await sortierungInput.fill('0');
    await sortierungInput.press('Tab');

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Wait for observation
    await page.waitForTimeout(200);

    // Fill in the PLZ field
    const plzNeuInput = page.getByLabel('PLZ (zwischen 1 und 10 Zeichen)');
    await plzNeuInput.waitFor({ state: 'visible' });
    await plzNeuInput.fill('99124');
    await plzNeuInput.press('Tab');

    // Fill in the Ortsname field
    const ortsnameNeuInput = page.getByLabel('Ortsname (zwischen 1 und 50 Zeichen)');
    await ortsnameNeuInput.waitFor({ state: 'visible' });
    await ortsnameNeuInput.fill('Wupperhausen Neu');
    await ortsnameNeuInput.press('Tab');

    // Fill in the Kreis field
    const kreisNeuInput = page.getByLabel('Kreis (max. 3 Zeichen)');
    await kreisNeuInput.waitFor({ state: 'visible' });
    await kreisNeuInput.fill('WP');
    await kreisNeuInput.press('Tab');

    // Fill in the Land field
    const landNeuInput = page.getByLabel('Land (max. 2 Zeichen)');
    await landNeuInput.waitFor({ state: 'visible' });
    await landNeuInput.fill('BW');
    await landNeuInput.press('Tab');

    // Fill in the Sortierung field
    const sortierungNeuInput = page.getByLabel('Sortierung');
    await sortierungNeuInput.waitFor({ state: 'visible' });
    await sortierungNeuInput.fill('1');
    await sortierungNeuInput.press('Tab');

    if (!keepTestData) {

        // Go to the checkbox after saving
        const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div/div[2]/div[2]/div[1]/div[1]/input');
        await postSaveCheckbox.check();

        // Click the "Löschen" button to delete
        await page.locator('button:has-text("Löschen")').first().click();

        // Click the confirmation "Löschen" button
        await page.locator('button:has-text("Löschen")').last().click();
    }

    // Wait for observation
    await page.waitForTimeout(0);
  });
});