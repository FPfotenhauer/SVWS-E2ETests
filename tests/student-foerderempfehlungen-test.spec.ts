import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';
import { exit } from 'process';

const keepTestData = process.env.KEEP_TEST_DATA === 'true' || process.env.KEEP_TEST_DATA === '1';

// Test for Schüler > Lernabschnitte > Förderempfehlungen

test.describe('Schüler - Lernabschnitte- Förderempfehlungen', () => {
  test('should login, navigate to Förderempfehlungen, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schüler using robust selector
    await page.locator('a.sidebar--menu-item[title="Schüler"]').click();

    // Click on Lernabschnitte using robust selector
    await page.locator('button.svws-ui-tab-button:has(span:has-text("Lernabschnitte"))').click();

    // Click on Förderempfehlungen using robust selector
    await page.locator('button.svws-ui-tab-button:has(span:has-text("Förderempfehlungen"))').click();

    // Verify we're on the Förderempfehlungen page by checking for a specific element
    await page.waitForSelector('text=Förderempfehlungen', { timeout: 2000 });
    
    // Click the '+' button to add a new Förderempfehlung
    await page.locator('button.button--icon:has(span.icon.i-ri-add-line)').last().waitFor({ state: 'visible' });
    await page.locator('button.button--icon:has(span.icon.i-ri-add-line)').last().click();

    // Wait for observation
    await page.waitForTimeout(200);

    // Fill in the Betroffene Fächer field
    const faecherInput = page.getByLabel('Betroffene Fächer (max. 255 Zeichen)');
    await faecherInput.waitFor({ state: 'visible' });
    await faecherInput.fill('Mathe, Deutsch, Englisch');
    await faecherInput.press('Tab');

    // Fill in the Text1 textarea
    const text1Textarea = page.locator('textarea').first();
    await text1Textarea.waitFor({ state: 'visible' });
    await text1Textarea.fill('Dies ist ein Testeintrag für Kompetenzen 1.');
    await text1Textarea.press('Tab');

    // Fill in the Text2 textarea
    const text2Textarea = page.locator('textarea').nth(1);
    await text2Textarea.waitFor({ state: 'visible' });
    await text2Textarea.fill('Dies ist ein Testeintrag für Kompetenzen 2.');
    await text2Textarea.press('Tab');

    // Fill in the Text3 textarea
    const text3Textarea = page.locator('textarea').nth(2);
    await text3Textarea.waitFor({ state: 'visible' });
    await text3Textarea.fill('Dies ist ein Testeintrag für Kompetenzen 3.');
    await text3Textarea.press('Tab');

    // Fill in the Text4 textarea
    const text4Textarea = page.locator('textarea').nth(3);
    await text4Textarea.waitFor({ state: 'visible' });
    await text4Textarea.fill('Dies ist ein Testeintrag für Kompetenzen 4.');
    await text4Textarea.press('Tab');

    // Fill in the Text5 textarea
    const text5Textarea = page.locator('textarea').nth(4);
    await text5Textarea.waitFor({ state: 'visible' });
    await text5Textarea.fill('Dies ist ein Testeintrag für Kompetenzen 5.');
    await text5Textarea.press('Tab');

    // Fill in the Text6 textarea
    const text6Textarea = page.locator('textarea').nth(5);
    await text6Textarea.waitFor({ state: 'visible' });
    await text6Textarea.fill('Dies ist ein Testeintrag für Kompetenzen 6.');
    await text6Textarea.press('Tab');

    // Fill in the Text7 textarea
    const text7Textarea = page.locator('textarea').nth(6);
    await text7Textarea.waitFor({ state: 'visible' });
    await text7Textarea.fill('Dies ist ein Testeintrag für Kompetenzen 7.');
    await text7Textarea.press('Tab');

    // Fill in the Text8 textarea
    const text8Textarea = page.locator('textarea').nth(7);
    await text8Textarea.waitFor({ state: 'visible' });
    await text8Textarea.fill('Dies ist ein Testeintrag für Kompetenzen 8.');
    await text8Textarea.press('Tab');

    // Fill in the Date Umsetzung von field
    const umsetzungVonInput = page.getByLabel('Umsetzung von');
    await umsetzungVonInput.waitFor({ state: 'visible' });
    await umsetzungVonInput.fill('2024-01-01');
    await umsetzungVonInput.press('Tab');

    // Fill in the Date Umsetzung bis field
    const umsetzungBisInput = page.getByLabel('Umsetzung bis');
    await umsetzungBisInput.waitFor({ state: 'visible' });
    await umsetzungBisInput.fill('2024-12-31');
    await umsetzungBisInput.press('Tab');

    // Fill in the Date Überprüfung bis field
    const ueberpruefungBisInput = page.getByLabel('Überprüfung bis');
    await ueberpruefungBisInput.waitFor({ state: 'visible' });
    await ueberpruefungBisInput.fill('2024-12-31');
    await ueberpruefungBisInput.press('Tab');

    // Fill in the Date Nächstes Beratungsgespräch field
    const naechsteBeratungInput = page.getByLabel('Nächstes Beratungsgespräch');
    await naechsteBeratungInput.waitFor({ state: 'visible' });
    await naechsteBeratungInput.fill('2024-12-31');
    await naechsteBeratungInput.press('Tab');

    // Check all enabled checkboxes
    await page.getByLabel('Texteingabe abgeschlossen').check();
    await page.getByLabel('Empfehlung abgeschlossen').check();

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Wait for observation
    await page.waitForTimeout(1000);



    if (!keepTestData) {

        // Go to the checkbox after saving
        const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div/main/div[2]/div/div[3]/div/div[2]/div/div/div[1]/div[2]/div/div[1]/input');
        await postSaveCheckbox.check();

        // Wait for the delete button to appear
        await page.waitForTimeout(500);

        // Click the trash button to delete Förderempfehlung
        const deleteButton = page.locator('button.button--trash');
        await deleteButton.waitFor({ state: 'visible' });
        await deleteButton.click();

        // Click the confirmation "Löschen" button
        await page.locator('button:has-text("Löschen")').last().click();
    }

    // Wait for observation
    await page.waitForTimeout(0);
  });
});