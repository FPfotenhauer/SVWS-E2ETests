import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';

// Test for Kataloge > Betriebe

test.describe('Kataloge - Betriebe', () => {
  test('should login, navigate to Betriebe, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Betriebe using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Betriebe"]').click();

    // Verify we're on the Betriebe page by checking for a specific element
    await page.waitForSelector('text=Betriebe', { timeout: 5000 });

    // Click the '+' button to add a new Betrieb
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Wait for observation
    await page.waitForTimeout(1000);

    // Fill in the Betrieb name
    const nameInput = page.locator('label:has-text("Name (zwischen 1 und 50 Zeichen)")').locator('input.text-input--control');
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill('Testbetrieb');
    await nameInput.press('Tab');

    // Fill in the Namensergänzung field
    const namenserganzungInput = page.locator('label:has-text("Namensergänzung (max. 50 Zeichen)")').locator('input.text-input--control');
    await namenserganzungInput.waitFor({ state: 'visible' });
    await namenserganzungInput.fill('Testname');
    await namenserganzungInput.press('Tab');

    // Select Betriebsart from the combobox
    const betriebsartCombo = page.getByRole('combobox', { name: 'Betriebsart' });
    await betriebsartCombo.click();

    // Select the first available option
    await page.locator('[role="option"]').first().click();
    await betriebsartCombo.press('Tab');

    // Fill in the Branche field
    const brancheInput = page.locator('label:has-text("Branche")').locator('input.text-input--control');
    await brancheInput.waitFor({ state: 'visible' });
    await brancheInput.fill('Lebensmittel');
    await brancheInput.press('Tab');

    // Fill in the Bemerkungen textarea
    const bemerkungenTextarea = page.locator('label:has-text("Bemerkungen")').locator('textarea');
    await bemerkungenTextarea.waitFor({ state: 'visible' });
    await bemerkungenTextarea.fill('Dies ist ein Testeintrag für Bemerkungen.');
    await bemerkungenTextarea.press('Tab');

    // Check all enabled checkboxes
    await page.getByLabel('Ausbildungsbetrieb').check();
    await page.getByLabel('Maßnahmenträger').check();
    await page.getByLabel('Belehrung nach ISG notwendig').check();
    await page.getByLabel('Bietet Praktikumsplätze').check();
    await page.getByLabel('Erweitertes Führungszeugnis notwendig').check();

    // Fill in the Straße field
    const strasseInput = page.locator('label:has-text("Straße")').locator('input.text-input--control');
    await strasseInput.waitFor({ state: 'visible' });
    await strasseInput.fill('Teststraße 99a');
    await strasseInput.press('Tab');

    // Select Wohnort from the combobox
    const wohnortCombo = page.getByRole('combobox', { name: 'Wohnort' });
    await wohnortCombo.click();
    // Wait for options to appear
    await page.waitForTimeout(500);
    // Press arrow down to select the next option and enter to confirm
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await wohnortCombo.press('Tab');

    // Fill in the Telefon field
    const telefonInput = page.locator('label:has-text("Telefon")').locator('input.text-input--control').first();
    await telefonInput.waitFor({ state: 'visible' });
    await telefonInput.fill('555123-678');
    await telefonInput.press('Tab');

    // Fill in the 2. Telefon field
    const telefon2Input = page.locator('label:has-text("2. Telefon")').locator('input.text-input--control');
    await telefon2Input.waitFor({ state: 'visible' });
    await telefon2Input.fill('555123-999');
    await telefon2Input.press('Tab');

    // Fill in the E-Mail-Adresse field
    const emailInput = page.locator('label:has-text("E-Mail-Adresse")').locator('input.text-input--control');
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.fill('betrieb@b.example.com');
    await emailInput.press('Tab');

    // Fill in the Fax field
    const faxInput = page.locator('label:has-text("Fax")').locator('input.text-input--control');
    await faxInput.waitFor({ state: 'visible' });
    await faxInput.fill('555123-000');
    await faxInput.press('Tab');

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Go to the checkbox after saving
    const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div/div[2]/div[2]/div/div[1]/input');
    await postSaveCheckbox.check();

    // Click the "Löschen" button to delete
    await page.locator('button:has-text("Löschen")').first().click();

    // Click the confirmation "Löschen" button
    await page.locator('button:has-text("Löschen")').last().click();

    // Wait for observation
    await page.waitForTimeout(0);
  });
});