import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';
import { exit } from 'process';

const keepTestData = process.env.KEEP_TEST_DATA === 'true' || process.env.KEEP_TEST_DATA === '1';

// Test for Kataloge > Schulen

test.describe('Kataloge - Schulen', () => {
  test('should login, navigate to Schulen, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Schulen using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Schulen"]').click();

    // Verify we're on the Schulen page by checking for a specific element
    await page.waitForSelector('text=Schulen', { timeout: 2000 });
    
    // Click the '+' button to add a new Schule
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Wait for observation
    await page.waitForTimeout(200);

    // Select new Wohnort from the combobox
    const ortCombo = page.getByRole('combobox', { name: 'Schulen innerhalb NRW' });
    await ortCombo.click();
    // Select the option with value "100014""
    await page.locator('[role="option"]').getByText('100014').click();
    await ortCombo.press('Tab');

    // Fill in the Kürzel field
    const kuerzelInput = page.getByLabel('Kürzel (max. 10 Zeichen)');
    await kuerzelInput.waitFor({ state: 'visible' });
    await kuerzelInput.fill('KOLIBRI');
    await kuerzelInput.press('Tab');

    // Fill in the Sortierung field
    const sortierungInput = page.getByLabel('Sortierung');
    await sortierungInput.waitFor({ state: 'visible' });
    await sortierungInput.fill('1');
    await sortierungInput.press('Tab');

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Wait for observation
    await page.waitForTimeout(200);



    if (!keepTestData) {

        // Go to the checkbox after saving
        const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div[2]/div[2]/div[1]/div[1]/input');
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