import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';
import { exit } from 'process';

const keepTestData = process.env.KEEP_TEST_DATA === 'true' || process.env.KEEP_TEST_DATA === '1';

// Test for Kataloge > Ortsteile

test.describe('Kataloge - Ortsteile', () => {
  test('should login, navigate to Ortsteile, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Ortsteile using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Ortsteile"]').click();

    // Verify we're on the Ortsteile page by checking for a specific element
    await page.waitForSelector('text=Ortsteile', { timeout: 2000 });
    
    // Click the '+' button to add a new Ortsteil
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Wait for observation
    await page.waitForTimeout(200);

    // Fill in the Ortsteil field
    const ortsteilInput = page.getByLabel('Ortsteil (zwischen 1 und 30 Zeichen)');
    await ortsteilInput.waitFor({ state: 'visible' });
    await ortsteilInput.fill('Elberfeld');
    await ortsteilInput.press('Tab');

    // Select new Wohnort from the combobox
    const ortCombo = page.getByRole('combobox', { name: 'Ort' });
    await ortCombo.click();
    // Select the option with value "42103 Wuppertal"
    await page.locator('[role="option"]').getByText('42103 Wuppertal', { exact: true }).click();
    await ortCombo.press('Tab');

    // Fill in the Sortierung field
    const sortierungInput = page.getByLabel('Sortierung');
    await sortierungInput.waitFor({ state: 'visible' });
    await sortierungInput.fill('10');
    await sortierungInput.press('Tab');

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Wait for observation
    await page.waitForTimeout(200);

    // Fill in the Ortsteil field
    const ortsteilNeuInput = page.getByLabel('Ortsteil (zwischen 1 und 30 Zeichen)');
    await ortsteilNeuInput.waitFor({ state: 'visible' });
    await ortsteilNeuInput.fill('Lichtscheid');
    await ortsteilNeuInput.press('Tab');

    // Select new Wohnort from the combobox
    const ortNeuCombo = page.getByRole('combobox', { name: 'Ort' });
    await ortNeuCombo.click({ force: true });
    // Select the option with value "42285 Wuppertal"
    await page.locator('[role="option"]').getByText('42285 Wuppertal', { exact: true }).click();
    await ortNeuCombo.press('Tab');

    // Fill in the Sortierung field
    const sortierungNeuInput = page.getByLabel('Sortierung');
    await sortierungNeuInput.waitFor({ state: 'visible' });
    await sortierungNeuInput.fill('11');
    await sortierungNeuInput.press('Enter');

    if (!keepTestData) {

        // Go to the checkbox after saving
        const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div[2]/div[2]/div[2]/div[1]/input');
        await postSaveCheckbox.check();

        // Click the "Löschen" button to delete
        await page.locator('button:has-text("Löschen")').first().click();

        // Click the confirmation "Löschen" button
        await page.locator('button:has-text("Löschen")').last().click();

        // Click the confirmation "Ja" button
        await page.locator('button:has-text("Ja")').last().click();
    }

    // Wait for observation
    await page.waitForTimeout(0);
  });
});