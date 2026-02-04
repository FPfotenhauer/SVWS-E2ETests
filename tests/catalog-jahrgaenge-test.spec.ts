import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';
import { exit } from 'process';

// Test for Kataloge > Jahrgänge

test.describe('Kataloge - Jahrgänge', () => {
  test('should login, navigate to Jahrgänge, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Jahrgänge using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Jahrgänge"]').click();

    // Verify we're on the Jahrgänge page by checking for a specific element
    await page.waitForSelector('text=Jahrgänge', { timeout: 2000 });

    // Click the '+' button to add a new Jahrgang
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Wait for observation
    await page.waitForTimeout(1000);

    // Fill in the Kürzel field
    const kuerzelInput = page.getByLabel('Kürzel (zwischen 1 und 20 Zeichen)');
    await kuerzelInput.waitFor({ state: 'visible' });
    await kuerzelInput.fill('01 TEST');
    await kuerzelInput.press('Tab');

    // Fill in the Bezeichnung field
    const bezeichnungInput = page.getByLabel('Bezeichnung (zwischen 1 und 100 Zeichen)');
    await bezeichnungInput.waitFor({ state: 'visible' });
    await bezeichnungInput.fill('Test-Jahrgang 01');
    await bezeichnungInput.press('Tab');

    // Fill in the interne Kurzbezeichnung field
    const kurzbezeichnungInput = page.getByLabel('Kurzbezeichnung (max. 2 Zeichen)');
    await kurzbezeichnungInput.waitFor({ state: 'visible' });
    await kurzbezeichnungInput.fill('J1');
    await kurzbezeichnungInput.press('Tab');

    // Select new Folgejahrgang ASD-Kürzel from the combobox
    const folgejahrgangCombo = page.getByRole('combobox', { name: 'Folgejahrgang' });
    await folgejahrgangCombo.click();
    // Select the option with value "2. Jahrgang"
    await page.locator('[role="option"]').nth(1).click();
    await folgejahrgangCombo.press('Tab');

    // Select new Schulgliederung ASD-Kürzel from the combobox
    const schulgliederungCombo = page.getByRole('combobox', { name: 'Schulgliederung ASD-Kürzel' });
    await schulgliederungCombo.click();
    // Select the option with value "GMS"
    await page.locator('[role="option"]').getByText('GMS', { exact: true }).click();
    await schulgliederungCombo.press('Tab');
    
    // Select new Jahrgang ASD-Kürzel from the combobox
    const asdJahrgangCombo = page.getByRole('combobox', { name: 'Jahrgang ASD-Kürzel' });
    await asdJahrgangCombo.click();
    // Select the option with value "01"
    await page.locator('[role="option"]').getByText('01', { exact: true }).click();
    await asdJahrgangCombo.press('Tab');

    // Select new Bildungsstufe from the combobox
    const BildungsstufeCombo = page.getByRole('combobox', { name: ' Bildungsstufe' });
    await BildungsstufeCombo.click();
    // Select the option with value "Primarstufe"
    await page.locator('[role="option"]').getByText('Primarstufe', { exact: true }).click();
    await BildungsstufeCombo.press('Tab');

    // Change the Anzahl der Restabschnitte field
    const anzahlRestabschnitteInput = page.getByLabel('Anzahl der Restabschnitte');
    await anzahlRestabschnitteInput.waitFor({ state: 'visible' });
    await anzahlRestabschnitteInput.fill('6');
    await anzahlRestabschnitteInput.press('Tab');

    // Change the Sortierung field
    const sortierungInput = page.getByLabel('Sortierung');
    await sortierungInput.waitFor({ state: 'visible' });
    await sortierungInput.fill('31999');
    await sortierungInput.press('Tab');

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Wait for observation
    await page.waitForTimeout(200);

    // Fill in the Kürzel field
    const kuerzelNeuInput = page.getByLabel('Kürzel (zwischen 1 und 20 Zeichen)');
    await kuerzelNeuInput.waitFor({ state: 'visible' });
    await kuerzelNeuInput.fill('01 neu TEST');
    await kuerzelNeuInput.press('Tab');

    // Fill in the Bezeichnung field
    const bezeichnungNeuInput = page.getByLabel('Bezeichnung (zwischen 1 und 100 Zeichen)');
    await bezeichnungNeuInput.waitFor({ state: 'visible' });
    await bezeichnungNeuInput.fill('Test-Jahrgang 01 neu');
    await bezeichnungNeuInput.press('Tab');

    // Fill in the interne Kurzbezeichnung field
    const kurzbezeichnungNeuInput = page.getByLabel('Kurzbezeichnung (max. 2 Zeichen)');
    await kurzbezeichnungNeuInput.waitFor({ state: 'visible' });
    await kurzbezeichnungNeuInput.fill('N1');
    await kurzbezeichnungInput.press('Tab');

    // Select new Folgejahrgang ASD-Kürzel from the combobox
    const folgejahrgangNeuCombo = page.getByRole('combobox', { name: 'Folgejahrgang' });
    await folgejahrgangNeuCombo.click();
    // Select the option with value "2. Jahrgang"
    await page.locator('[role="option"]').nth(3).click();
    await folgejahrgangNeuCombo.press('Tab');

    // Select new Schulgliederung ASD-Kürzel from the combobox
    const schulgliederungNeuCombo = page.getByRole('combobox', { name: 'Schulgliederung ASD-Kürzel' });
    await schulgliederungNeuCombo.click();
    // Select the option with value "EVB"
    await page.locator('[role="option"]').getByText('EVB', { exact: true }).click();
    await schulgliederungNeuCombo.press('Tab');
    
    // Select new Jahrgang ASD-Kürzel from the combobox
    const asdJahrgangNeuCombo = page.getByRole('combobox', { name: 'Jahrgang ASD-Kürzel' });
    await asdJahrgangNeuCombo.click();
    // Select the option with value "01"
    await page.locator('[role="option"]').getByText('02', { exact: true }).click();
    await asdJahrgangCombo.press('Tab');

    // Select new Bildungsstufe from the combobox
    const bildungsstufeNeuCombo = page.getByRole('combobox', { name: ' Bildungsstufe' });
    await bildungsstufeNeuCombo.click();
    // Select the option with value "Primarstufe"
    await page.locator('[role="option"]').getByText('Sekundarstufe I', { exact: true }).click();
    await bildungsstufeNeuCombo.press('Tab');

    // Change the Anzahl der Restabschnitte field
    const anzahlRestabschnitteNeuInput = page.getByLabel('Anzahl der Restabschnitte');
    await anzahlRestabschnitteNeuInput.waitFor({ state: 'visible' });
    await anzahlRestabschnitteNeuInput.fill('10');
    await anzahlRestabschnitteNeuInput.press('Tab');

    // Change the Sortierung field
    const sortierungNeuInput = page.getByLabel('Sortierung');
    await sortierungNeuInput.waitFor({ state: 'visible' });
    await sortierungNeuInput.fill('3199');
    await sortierungNeuInput.press('Tab');

    // Wait for observation
    await page.waitForTimeout(200);

    // Go to the checkbox after saving
    const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div/div[2]/div[2]/div[5]/div[1]/input');
    await postSaveCheckbox.check();

    // Click the "Löschen" button to delete
    await page.locator('button:has-text("Löschen")').first().click();

    // Click the confirmation "Löschen" button
    await page.locator('button:has-text("Löschen")').last().click();

    // Wait for observation
    await page.waitForTimeout(0);
  });
});