import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';

// Test for Lehrkräfte - Add Teacher

test.describe('Lehrkräfte - Add Teacher', () => {
  test('should login, navigate to Lehrkräfte, and click add teacher button', async ({ page }) => {
    // Login using shared helper
    await loginAsAdmin(page);

    // Navigate to Lehrkräfte app
    const lehrkraefteLink = page.getByRole('link', { name: /lehrkräfte|teachers/i }).first()
      .or(page.getByRole('button', { name: /lehrkräfte|teachers/i }).first());
    if (await lehrkraefteLink.isVisible({ timeout: 2000 })) {
      await lehrkraefteLink.click();
    }

    // Wait for the page to load
    await page.waitForTimeout(1000);

    // Click on the "+" button to add a new teacher
    const addButton = page.locator('button').filter({ has: page.locator('span.icon.i-ri-add-line') });
    await addButton.click();

    // Check the "Ist Sichtbar" checkbox
    const istSichtbarCheckbox = page.getByLabel('Ist Sichtbar');
    if (await istSichtbarCheckbox.isVisible({ timeout: 1000 })) {
      await istSichtbarCheckbox.check();
    }

    // Check the "Ist Relevant für Statistik" checkbox
    const istRelevantCheckbox = page.getByLabel('Ist Relevant für Statistik');
    if (await istRelevantCheckbox.isVisible({ timeout: 1000 })) {
      await istRelevantCheckbox.check();
    }

    // Fill in Kürzel field
    const kuerzelInput = page.locator('label:has-text("Kürzel")').locator('input.text-input--control');
    if (await kuerzelInput.isVisible({ timeout: 500 })) {
      await kuerzelInput.fill('ATEST');
      await kuerzelInput.press('Tab');
    }

    // Select Personal-Typ from the combobox
    const personalTypCombo = page.getByRole('combobox', { name: 'Personal-Typ' });
    await personalTypCombo.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: 'Sonstiges Personal' }).click();
    await personalTypCombo.press('Tab');

    // Fill in Nachname field
    const nachnameInput = page.locator('label:has-text("Nachname")').locator('input.text-input--control');
    if (await nachnameInput.isVisible({ timeout: 500 })) {
      await nachnameInput.fill('ATestlehrer');
      await nachnameInput.press('Tab');
    }

    // Fill in Rufname field
    const rufnameInput = page.locator('label:has-text("Rufname")').locator('input.text-input--control');
    if (await rufnameInput.isVisible({ timeout: 500 })) {
      await rufnameInput.fill('ATestvorname');
      await rufnameInput.press('Tab');
    }

    // Select Geschlecht from the combobox
    const geschlechtCombo = page.getByRole('combobox', { name: 'Geschlecht' });
    await geschlechtCombo.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: 'weiblich' }).click();
    await geschlechtCombo.press('Tab');

    // Fill in Geburtsdatum field
    const geburtsdatumInput = page.getByLabel('Geburtsdatum');
    if (await geburtsdatumInput.isVisible({ timeout: 500 })) {
      await geburtsdatumInput.fill('1971-03-10');
      await geburtsdatumInput.press('Tab');
    }

    // Select Staatsangehörigkeit from the combobox
    const staatsangehoerigkeitCombo = page.getByRole('combobox', { name: 'Staatsangehörigkeit' });
    await staatsangehoerigkeitCombo.click();
    await page.waitForTimeout(500);
    await page.keyboard.type('indisch');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    // Fill in Akademischer Grad field
    const akademischerGradInput = page.getByLabel('Akademischer Grad');
    if (await akademischerGradInput.isVisible({ timeout: 500 })) {
      await akademischerGradInput.fill('Prof. Dr.');
      await akademischerGradInput.press('Tab');
    }

    // Fill in Amtsbezeichnung field
    const amtsbezeichnungInput = page.locator('label:has-text("Amtsbezeichnung")').locator('input.text-input--control');
    if (await amtsbezeichnungInput.isVisible({ timeout: 500 })) {
      await amtsbezeichnungInput.fill('RSchD');
      await amtsbezeichnungInput.press('Tab');
    }

    // Fill in Straße field
    const strasseInput = page.locator('label:has-text("Straße")').locator('input.text-input--control');
    if (await strasseInput.isVisible({ timeout: 500 })) {
      await strasseInput.fill('Teststraße 99a');
      await strasseInput.press('Tab');
    }

    // Select Wohnort from the combobox
    const wohnortCombo = page.getByRole('combobox', { name: 'Wohnort' });
    await wohnortCombo.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: '42287 Wuppertal' }).click();
    await wohnortCombo.press('Tab');

    // Select Ortsteil from the combobox
    const ortsteilCombo = page.getByRole('combobox', { name: 'Ortsteil' });
    await ortsteilCombo.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: 'Barmen' }).click();
    await ortsteilCombo.press('Tab');

    // Fill in Telefon field
    const telefonInput = page.locator('label:has-text("Telefon")').locator('input.text-input--control');
    if (await telefonInput.isVisible({ timeout: 500 })) {
      await telefonInput.fill('012345-555777');
      await telefonInput.press('Tab');
    }

    // Fill in Mobil oder Fax field
    const mobilFaxInput = page.locator('label:has-text("Mobil oder Fax")').locator('input.text-input--control');
    if (await mobilFaxInput.isVisible({ timeout: 500 })) {
      await mobilFaxInput.fill('012345-555888');
      await mobilFaxInput.press('Tab');
    }

    // Fill in Private E-Mail-Adresse field
    const privateEmailInput = page.locator('label:has-text("Private E-Mail-Adresse")').locator('input.text-input--control');
    if (await privateEmailInput.isVisible({ timeout: 500 })) {
      await privateEmailInput.fill('lehrer@privat.example.com');
      await privateEmailInput.press('Tab');
    }

    // Fill in Schulische E-Mail-Adresse field
    const schulischeEmailInput = page.locator('label:has-text("Schulische E-Mail-Adresse")').locator('input.text-input--control');
    if (await schulischeEmailInput.isVisible({ timeout: 500 })) {
      await schulischeEmailInput.fill('lehrer@schule.example.com');
      await schulischeEmailInput.press('Tab');
    }

    // Click the Speichern button
    const speichernButton = page.getByRole('button', { name: 'Speichern' });
    if (await speichernButton.isVisible({ timeout: 1000 })) {
      await speichernButton.click();
    }

    // Optional: Verify the add teacher dialog/form opened
    await page.waitForTimeout(2000);
  });
});