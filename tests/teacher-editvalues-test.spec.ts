import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';

// Test for Lehrkräfte - Edit Values

test.describe('Lehrkräfte - Edit Values', () => {
  test('should login, navigate to Lehrkräfte, and add teacher data', async ({ page }) => {
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

    // Fill in Kürzel field
    const kuerzelInput = page.locator('label:has-text("Kürzel")').locator('input.text-input--control');
    if (await kuerzelInput.isVisible({ timeout: 500 })) {
      await kuerzelInput.fill('TEST');
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
      await nachnameInput.fill('Mustermann');
      await nachnameInput.press('Tab');
    }
    
    // Fill in Rufname field
    const rufnameInput = page.locator('label:has-text("Rufname")').locator('input.text-input--control');
    if (await rufnameInput.isVisible({ timeout: 500 })) {
      await rufnameInput.fill('Max');
      await rufnameInput.press('Tab');
    }

     // Select Geschlecht from the combobox
    const geschlechtCombo = page.getByRole('combobox', { name: 'Geschlecht' });
    await geschlechtCombo.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: 'divers' }).click();
    await geschlechtCombo.press('Tab');   

    // Fill in Geburtsdatum field
    const geburtsdatumInput = page.locator('label:has-text("Geburtsdatum")').locator('input.text-input--control');
    if (await geburtsdatumInput.isVisible({ timeout: 500 })) {
      await geburtsdatumInput.fill('1999-12-31');
      await geburtsdatumInput.press('Tab');
    }

    // Select Staatsangehörigkeit from the combobox
    const staatsangehoerigkeitCombo = page.getByRole('combobox', { name: 'Staatsangehörigkeit' });
    await staatsangehoerigkeitCombo.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: 'finnisch' }).click();
    await staatsangehoerigkeitCombo.press('Tab');

    // Fill in Akademischer Grad field
    const akademischerGradInput = page.locator('label:has-text("Akadademischer Grad")').locator('input.text-input--control');
    await akademischerGradInput.fill('Prof. Dr');
    await akademischerGradInput.press('Tab');

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
      await telefonInput.fill('012345-555666');
      await telefonInput.press('Tab');
    }

    // Fill in Mobil oder Fax field
    const mobilFaxInput = page.locator('label:has-text("Mobil oder Fax")').locator('input.text-input--control');
    if (await mobilFaxInput.isVisible({ timeout: 500 })) {
      await mobilFaxInput.fill('012345-555999');
      await mobilFaxInput.press('Tab');
    }

    // Fill in Private E-Mail-Adresse field
    const emailInput = page.locator('label:has-text("Private E-Mail-Adresse")').locator('input.text-input--control');
    if (await emailInput.isVisible({ timeout: 500 })) {
      await emailInput.fill('testlehrer@l.example.com');
      await emailInput.press('Tab');
    }

    // Fill in Schulische E-Mail-Adresse field
    const schulEmailInput = page.locator('label:has-text("Schulische E-Mail-Adresse")').locator('input.text-input--control');
    if (await schulEmailInput.isVisible({ timeout: 500 })) {
      await schulEmailInput.fill('testlehrer@lschul.example.com');
      await schulEmailInput.press('Tab');
    }

    // Uncheck the "Ist sichtbar" checkbox
    const istSichtbarCheckbox = page.getByLabel('Ist sichtbar');
    if (await istSichtbarCheckbox.isVisible({ timeout: 500 })) {
      await istSichtbarCheckbox.uncheck();
    }

    // Uncheck the "Ist Relevant für Statistik" checkbox
    const istRelevantCheckbox = page.getByLabel('Ist Relevant für Statistik');
    if (await istRelevantCheckbox.isVisible({ timeout: 500 })) {
      await istRelevantCheckbox.uncheck();
    }

    // Go to the "Personaldaten" tab
    const personaldatenTab = page.getByRole('button', { name: 'Personaldaten' });
    if (await personaldatenTab.isVisible({ timeout: 1000 })) {
      await personaldatenTab.click();
      await page.waitForTimeout(1000); // Wait for tab content to load
    }

    // Fill in Identnummer field
    const identnummerInput = page.locator('label:has-text("Identnummer")').locator('input.text-input--control');
    if (await identnummerInput.isVisible({ timeout: 500 })) {
      await identnummerInput.fill('3112705');
      await identnummerInput.press('Tab');
    }

    // Fill in Seriennummer field
    const seriennummerInput = page.locator('label:has-text("Seriennummer")').locator('input.text-input--control');
    if (await seriennummerInput.isVisible({ timeout: 500 })) {
      await seriennummerInput.fill('1234X');
      await seriennummerInput.press('Tab');
    }

    // Fill in Vergütungsschlüssen field
    const verguetungsschluessenInput = page.locator('label:has-text("Vergütungsschlüssen")').locator('input.text-input--control');
    if (await verguetungsschluessenInput.isVisible({ timeout: 500 })) {
      await verguetungsschluessenInput.fill('AB');
      await verguetungsschluessenInput.press('Tab');
    }

    // Fill in PA-Nummer field
    const paNummerInput = page.locator('label:has-text("PA-Nummer")').locator('input.text-input--control');
    if (await paNummerInput.isVisible({ timeout: 500 })) {
      await paNummerInput.fill('PA123456789');
      await paNummerInput.press('Tab');
    }

    // Fill in LBV-Personalnummer field
    const lbvPersonalnummerInput = page.locator('label:has-text("LBV-Personalnummer")').locator('input.text-input--control');
    if (await lbvPersonalnummerInput.isVisible({ timeout: 500 })) {
      await lbvPersonalnummerInput.fill('LBV123456');
      await lbvPersonalnummerInput.press('Tab');
    }

    // Fill in Zugangsdatum field
    const zugangsdatumInput = page.getByLabel('Zugangsdatum');
    if (await zugangsdatumInput.isVisible({ timeout: 500 })) {
      await zugangsdatumInput.fill('2025-07-31');
      await zugangsdatumInput.press('Tab');
    }

    // Fill in Abgangsdatum field
    const abgangsdatumInput = page.getByLabel('Abgangsdatum');
    if (await abgangsdatumInput.isVisible({ timeout: 500 })) {
      await abgangsdatumInput.fill('2026-07-31');
      await abgangsdatumInput.press('Tab');
    }

    // Select Rechtsverhältnis from the combobox
    const rechtsverhaeltnisCombo = page.getByRole('combobox', { name: 'Rechtsverhältnis' });
    await rechtsverhaeltnisCombo.click();
    await page.waitForTimeout(500);
    await page.keyboard.type('unentgeltlich');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    // Select Beschäftigungsart from the combobox
    const beschaeftigungsartCombo = page.getByRole('combobox', { name: 'Beschäftigungsart' });
    await beschaeftigungsartCombo.click();
    await page.waitForTimeout(500);
    await page.keyboard.type('studierende');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    // Fill in Pflichtstundensoll field
    const pflichtstundensollInput = page.getByLabel('Pflichtstundensoll');
    await pflichtstundensollInput.fill('99');
    await pflichtstundensollInput.press('Tab');

    // Select Einsatzstatus from the combobox
    const einsatzstatusCombo = page.getByRole('combobox', { name: 'Einsatzstatus' });
    await einsatzstatusCombo.click();
    await page.waitForTimeout(500);
    await page.keyboard.type('nicht Stammschule');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    // Select Stammschule from the combobox
    const stammschuleCombo = page.getByRole('combobox', { name: 'Stammschule' });
    await stammschuleCombo.click();
    await page.waitForTimeout(500);
    await page.keyboard.type('Eigene Schule');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    // Optional: Verify the teacher was added
    await page.waitForTimeout(0);
  });
});