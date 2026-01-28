import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';

// Test for Kataloge > Einwilligungsarten

test.describe('Kataloge - Einwilligungsarten', () => {
  test('should login, navigate to Einwilligungsarten, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Einwilligungsarten using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Einwilligungsarten"]').click();

    // Verify we're on the Einwilligungsarten page by checking for a specific element
    await page.waitForSelector('text=Einwilligungsarten', { timeout: 200 });

    // Click the '+' button to add a new Einwilligungsart
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Fill in the Einwilligungsart Bezeichnung
    const bezeichnungInput = page.locator('input.text-input--control[type="text"][required]').first();
    await bezeichnungInput.fill('Testeinwilligungsart');
    await bezeichnungInput.press('Tab');

    // Fill in the Beschreibung textarea
    const beschreibungTextarea = page.locator('label:has-text("Beschreibung")').locator('textarea');
    await beschreibungTextarea.waitFor({ state: 'visible' });
    await beschreibungTextarea.fill('Dies ist eine Testbeschreibung für die Einwilligungsart.');
    await beschreibungTextarea.press('Tab');

    // Select Personenart from the combobox
    const personenartCombo = page.getByRole('combobox', { name: 'Personenart' });
    await personenartCombo.click();
    // Wait for options to appear
    await page.waitForTimeout(500);
    // Select "Lehrer/Personal" option
    await page.locator('[role="option"]').filter({ hasText: 'Lehrer/Personal' }).click();
    await personenartCombo.press('Tab');

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Check the specific checkbox
    const specificCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div/div[2]/div[2]/div[3]/div[1]/input');
    await specificCheckbox.check();

    // Click the "Löschen" button to delete
    await page.locator('button:has-text("Löschen")').first().click();

    // Click the confirmation "Löschen" button
    await page.locator('button:has-text("Löschen")').last().click();

    // Click the "Ja" button in the confirmation modal
    await page.locator('button:has-text("Ja")').click();

    // Wait for observation
    await page.waitForTimeout(0);
  });
});