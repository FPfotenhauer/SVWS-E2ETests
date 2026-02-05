
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';

const keepTestData = process.env.KEEP_TEST_DATA === 'true' || process.env.KEEP_TEST_DATA === '1';

// Test for Kataloge > Abteilungen

test.describe('Kataloge - Abteilungen', () => {
  test('should login, navigate to Abteilungen, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Click on Abteilungen using robust selector
    await page.locator('td.svws-ui-td', { hasText: 'Abteilungen' }).click();

    // Click the '+' button to add a new Abteilung
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();


    // Fill in the Abteilung name
    const abteilungInput = page.locator('input.text-input--control[type="text"][required]').first();
    await abteilungInput.fill('Testabteilung');
    await abteilungInput.press('Tab');

    // Fill in the Raum name by finding the input near the label 'Raum'
    const raumInput = page.locator('label:has-text("Raum")').locator('input.text-input--control');
    await raumInput.waitFor({ state: 'visible' });
    await raumInput.fill('Testraum 1');
    await raumInput.press('Tab');

    // Fill in the Email field by finding the input near the label 'E-Mail-Adresse'
    const emailInput = page.locator('label:has-text("E-Mail-Adresse")').locator('input.text-input--control');
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.fill('abteilung@a.example.com');
    await emailInput.press('Tab');

    // Fill in the Durchwahl field by finding the input near the label 'Durchwahl'
    const durchwahlInput = page.locator('label:has-text("Durchwahl")').locator('input.text-input--control');
    await durchwahlInput.waitFor({ state: 'visible' });
    await durchwahlInput.fill('12345');
    await durchwahlInput.press('Tab');

    // Select a teacher from the combobox labeled 'Lehrer'
    const lehrerCombo = page.getByRole('combobox', { name: 'Lehrer' });
    await lehrerCombo.click();
    // Select the first available option (or adjust as needed)
    await page.locator('[role="option"]').first().click();
    await lehrerCombo.press('Tab');

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    if (!keepTestData) {

        // Go to the checkbox after saving
        const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div/div[2]/div[2]/div/div[1]/input');
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
