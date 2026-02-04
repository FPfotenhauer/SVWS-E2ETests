import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';
import { exit } from 'process';

// Test for Kataloge > Förderschwerpunkte

test.describe('Kataloge - Haltestellen', () => {
  test('should login, navigate to Haltestellen, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Haltestellen using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Haltestellen"]').click();

    // Verify we're on the Haltestellen page by checking for a specific element
    await page.waitForSelector('text=Haltestellen', { timeout: 2000 });
    
    // Click the '+' button to add a new Haltestelle
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Wait for observation
    await page.waitForTimeout(1000);

    // Fill in the Bezeichnung field
    const bezeichnungInput = page.getByLabel('Bezeichnung (zwischen 1 und 30 Zeichen)');
    await bezeichnungInput.waitFor({ state: 'visible' });
    await bezeichnungInput.fill('Bahnhof Nord Test');
    await bezeichnungInput.press('Tab');

    // Change the Sortierung field
    const sortierungInput = page.getByLabel('Sortierung');
    await sortierungInput.waitFor({ state: 'visible' });
    await sortierungInput.fill('31999');
    await sortierungInput.press('Tab');


    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Wait for observation
    await page.waitForTimeout(1000);

    // Fill in the Bezeichnung field
    const bezeichnungNeuInput = page.getByLabel('Bezeichnung (zwischen 1 und 30 Zeichen)');
    await bezeichnungNeuInput.waitFor({ state: 'visible' });
    await bezeichnungNeuInput.fill('Bahnhof West Test Neu');
    await bezeichnungNeuInput.press('Tab');

    // Change the Sortierung field
    const sortierungNeuInput = page.getByLabel('Sortierung');
    await sortierungNeuInput.waitFor({ state: 'visible' });
    await sortierungNeuInput.fill('3199');
    await sortierungNeuInput.press('Tab');

    // Go to the checkbox after saving
    const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div[2]/div[2]/div/div[1]/input');
    await postSaveCheckbox.check();

    // Click the "Löschen" button to delete
    await page.locator('button:has-text("Löschen")').first().click();

    // Click the confirmation "Löschen" button
    await page.locator('button:has-text("Löschen")').last().click();

    // Wait for observation
    await page.waitForTimeout(0);
  });
});