import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';
import { exit } from 'process';

// Test for Kataloge > Fächer

test.describe('Kataloge - Fächer', () => {
  test('should login, navigate to Betriebe, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Fächer using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Fächer"]').click();

    // Verify we're on the Fächer page by checking for a specific element
    await page.waitForSelector('text=Fächer', { timeout: 5000 });

    // Click the '+' button to add a new Fach
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Wait for observation
    await page.waitForTimeout(1000);

    // Select Fach ASD-Kürzel from the combobox
    const asdKuerzelCombo = page.getByRole('combobox', { name: 'Fach ASD-Kürzel' });
    await asdKuerzelCombo.click();
    // Select the first available option
    await page.locator('[role="option"]').first().click();
    await asdKuerzelCombo.press('Tab');

    // Fill in the Fach Kürzel
    const nameInput = page.locator('label:has-text("Kürzel (zwischen 1 und 20 Zeichen)")').locator('input.text-input--control');
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill('ARAB');
    await nameInput.press('Tab');

    // Fill in the Bezeichnung field
    const bezeichnungInput = page.locator('label:has-text("Bezeichnung (zwischen 1 und 255 Zeichen)")').locator('input.text-input--control');
    await bezeichnungInput.waitFor({ state: 'visible' });
    await bezeichnungInput.fill('Arabisch HSU');
    await bezeichnungInput.press('Tab');

    // Check Zeugnis enabled checkbox
    await page.getByLabel('Auf Zeugnis').check();

    // Fill in the Bezeichnung (Zeugnis) field
    const zeugnisInput = page.locator('label:has-text("Bezeichnung (Zeugnis) (max. 255 Zeichen)")').locator('input.text-input--control');
    await zeugnisInput.waitFor({ state: 'visible' });
    await zeugnisInput.fill('Arabisch (Zeugnis)');
    await zeugnisInput.press('Tab');

    // Fill in the Bezeichnung (Überweisungszeugnis) field
    const ueberweisungszeugnisInput = page.locator('label:has-text("Bezeichnung (Überweisungszeugnis) (max. 255 Zeichen)")').locator('input.text-input--control');
    await ueberweisungszeugnisInput.waitFor({ state: 'visible' });
    await ueberweisungszeugnisInput.fill('Arabisch (Überweisungszeugnis)');
    await ueberweisungszeugnisInput.press('Tab');

    // Check Fremdsprache enabled checkbox
    await page.getByLabel('Ist eine Fremdsprache').check();

    // Fill in the max Zeichenlänge field
    const zeichenInput = page.getByLabel('maximale Zeichenanzahl in Fachbemerkungen');
    await zeichenInput.waitFor({ state: 'visible' });
    await zeichenInput.fill('255');
    await zeichenInput.press('Tab');

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Wait for observation
    await page.waitForTimeout(1000);

    // Change in the Fach Kürzel
    const kuerzelInput = page.getByLabel('Kürzel (zwischen 1 und 20 Zeichen)');
    await kuerzelInput.waitFor({ state: 'visible' });
    await kuerzelInput.fill('M-AG');
    await kuerzelInput.press('Tab');

    // Fill in the Bezeichnung field
    const bezeichnungNeuInput = page.getByLabel('Bezeichnung (zwischen 1 und 255 Zeichen)');
    await bezeichnungNeuInput.waitFor({ state: 'visible' });
    await bezeichnungNeuInput.fill('Mathe AG');
    await bezeichnungNeuInput.press('Tab');

    // Select new Fach ASD-Kürzel from the combobox
    const asdKuerzelNeuCombo = page.getByRole('combobox', { name: 'Fach ASD-Kürzel' });
    await asdKuerzelNeuCombo.click();
    // Select the option with value "M"
    await page.locator('[role="option"]').getByText('M', { exact: true }).click();
    await asdKuerzelNeuCombo.press('Tab');

    // Check Zeugnis disabled checkbox
    await page.getByLabel('Auf Zeugnis').uncheck();

    // Change in the Bezeichnung (Zeugnis) field
    const zeugnisNeuInput = page.getByLabel('Bezeichnung (Zeugnis) (max. 255 Zeichen)');
    await zeugnisNeuInput.waitFor({ state: 'visible' });
    await zeugnisNeuInput.fill('Mathe-AG (Zeugnis)');
    await zeugnisNeuInput.press('Tab');

    // Change in the Bezeichnung (Überweisungszeugnis) field
    const ueberweisungszeugnisNeuInput = page.getByLabel('Bezeichnung (Überweisungszeugnis) (max. 255 Zeichen)');
    await ueberweisungszeugnisNeuInput.waitFor({ state: 'visible' });
    await ueberweisungszeugnisNeuInput.fill('Mathe-AG (Überweisungszeugnis)');
    await ueberweisungszeugnisNeuInput.press('Tab');

    // Check Fremdsprache disabled checkbox
    await page.getByLabel('Ist eine Fremdsprache').uncheck();

    // Change in the max Zeichenlänge field
    const zeichenNeuInput = page.getByLabel('maximale Zeichenanzahl in Fachbemerkungen');
    await zeichenNeuInput.waitFor({ state: 'visible' });
    await zeichenNeuInput.fill('256');
    await zeichenNeuInput.press('Tab');

    // Change in the Sortierung field
    const sortierungNeuInput = page.getByLabel('Sortierung');
    await sortierungNeuInput.waitFor({ state: 'visible' });
    await sortierungNeuInput.fill('31999');
    await sortierungNeuInput.press('Enter');

    // Go to the checkbox after saving
    const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div/div[2]/div[2]/div[17]/div[1]/input');
    await postSaveCheckbox.check();

    // Click the "Löschen" button to delete
    // await page.locator('button:has-text("Löschen")').first().click();

    // Click the confirmation "Löschen" button
    // await page.locator('button:has-text("Löschen")').last().click();

    // Wait for observation
    await page.waitForTimeout(0);
  });
});