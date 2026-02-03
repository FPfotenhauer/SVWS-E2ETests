import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';
import { exit } from 'process';

// Test for Kataloge > Floskeln

test.describe('Kataloge - Floskeln', () => {
  test('should login, navigate to Betriebe, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Floskeln using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Floskeln"]').click();

    // Verify we're on the Floskeln page by checking for a specific element
    await page.waitForSelector('text=Floskeln', { timeout: 2000 });

    // Click the '+' button to add a new Floskelgruppe
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Wait for observation
    await page.waitForTimeout(1000);

    // Fill in the Kürzel field
    const kuerzelInput = page.getByLabel('Kürzel (zwischen 1 und 10 Zeichen)');
    await kuerzelInput.waitFor({ state: 'visible' });
    await kuerzelInput.fill('TEST');
    await kuerzelInput.press('Tab');

    // Fill in the Text field
    const textInput = page.getByLabel('Text');
    await textInput.waitFor({ state: 'visible' });
    await textInput.fill('Dies ist eine Testfloskel $Vorname$.');
    await textInput.press('Tab');

    // Select new Floskelgruppe  from the combobox
    const asdKuerzelNeuCombo = page.getByRole('combobox', { name: 'Floskelgruppe' });
    await asdKuerzelNeuCombo.click();
    // Select the option with value "M"
    await page.locator('[role="option"]').getByText('Allgemeine Floskeln', { exact: true }).click();
    await asdKuerzelNeuCombo.press('Tab');

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Wait for observation
    await page.waitForTimeout(1000);

    // Fill in the Kürzel field
    const kuerzelNeuInput = page.getByLabel('Kürzel (zwischen 1 und 10 Zeichen)');
    await kuerzelNeuInput.waitFor({ state: 'visible' });
    await kuerzelNeuInput.fill('NEUTest');
    await kuerzelNeuInput.press('Tab');

    // Fill in the Text field
    const textNeuInput = page.getByLabel('Text');
    await textNeuInput.waitFor({ state: 'visible' });
    await textNeuInput.fill('Neue Floskel mit $Vorname$');
    await textNeuInput.press('Tab');

    // Go to the checkbox after saving
    const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div/div[2]/div/div[1]/input');
    await postSaveCheckbox.check();

    // Click the "Löschen" button to delete
    // await page.locator('button:has-text("Löschen")').first().click();

    // Click the confirmation "Löschen" button
    // await page.locator('button:has-text("Löschen")').last().click();

    // Wait for observation
    await page.waitForTimeout(0);
  });
});