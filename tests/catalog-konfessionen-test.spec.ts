import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';
import { exit } from 'process';

const keepTestData = process.env.KEEP_TEST_DATA === 'true' || process.env.KEEP_TEST_DATA === '1';

// Test for Kataloge > Konfessionen

test.describe('Kataloge - Konfessionen', () => {
  test('should login, navigate to Konfessionen, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Konfessionen using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Konfessionen"]').click();

    // Verify we're on the Konfessionen page by checking for a specific element
    await page.waitForSelector('text=Konfessionen', { timeout: 2000 });

    // Click the '+' button to add a new Konfession
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Wait for observation
    await page.waitForTimeout(1000);

    // Select new Konfession ASD-Kürzel from the combobox
    const asdKuerzelCombo = page.getByRole('combobox', { name: 'Konfession ASD-Kürzel' });
    await asdKuerzelCombo.click();
    // Select the option with value "ME"
    await page.locator('[role="option"]').getByText('ME', { exact: true }).click();
    await asdKuerzelCombo.press('Tab');

    // Fill in the interne Bezeichnung field
    const bezeichnungInput = page.getByLabel('interne Bezeichnung (zwischen 1 und 30 Zeichen)');
    await bezeichnungInput.waitFor({ state: 'visible' });
    await bezeichnungInput.fill('Testreligion Shangrila');
    await bezeichnungInput.press('Tab');

    // Fill in the Zeugnisbezeichnung field
    const zeugnisbezeichnungInput = page.getByLabel('Zeugnisbezeichnung (max. 50 Zeichen)');
    await zeugnisbezeichnungInput.waitFor({ state: 'visible' });
    await zeugnisbezeichnungInput.fill('Testreligion Zeugnis Shangrila');
    await zeugnisbezeichnungInput.press('Tab');

    // Change the Sortierung field
    const sortierungInput = page.getByLabel('Sortierung');
    await sortierungInput.waitFor({ state: 'visible' });
    await sortierungInput.fill('31999');
    await sortierungInput.press('Tab');


    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Wait for observation
    await page.waitForTimeout(1000);

    // Select new Konfession ASD-Kürzel from the combobox
    const asdKuerzelNeuCombo = page.getByRole('combobox', { name: 'Konfession ASD-Kürzel' });
    await asdKuerzelNeuCombo.click();
    // Select the option with value "ME"
    await page.locator('[role="option"]').getByText('XO', { exact: true }).click();
    await asdKuerzelNeuCombo.press('Tab');

    // Fill in the interne Bezeichnung field
    const bezeichnungNeuInput = page.getByLabel('interne Bezeichnung (zwischen 1 und 30 Zeichen)');
    await bezeichnungNeuInput.waitFor({ state: 'visible' });
    await bezeichnungNeuInput.fill('Testreligion Neuerdia');
    await bezeichnungNeuInput.press('Tab');

    // Fill in the Zeugnisbezeichnung field
    const zeugnisbezeichnungNeuInput = page.getByLabel('Zeugnisbezeichnung (max. 50 Zeichen)');
    await zeugnisbezeichnungNeuInput.waitFor({ state: 'visible' });
    await zeugnisbezeichnungNeuInput.fill('Testreligion Zeugnis Neuerdia');
    await zeugnisbezeichnungNeuInput.press('Tab');

    // Change the Sortierung field
    const sortierungNeuInput = page.getByLabel('Sortierung');
    await sortierungNeuInput.waitFor({ state: 'visible' });
    await sortierungNeuInput.fill('3199');
    await sortierungNeuInput.press('Tab');    

    if (!keepTestData) {

        // Go to the checkbox after saving
        const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div[2]/div[2]/div[21]/div[1]/input');
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