import { test } from './fixtures';
import { expect } from '@playwright/test';
import { seedTestData, resetTestData, TEST_STUDENT } from './test-data';

const keepTestData = process.env.KEEP_TEST_DATA === 'true' || process.env.KEEP_TEST_DATA === '1';

// Store original values for reset after test
let originalValues: { nachname?: string; rufname?: string; alleVornamen?: string; geburtsort?: string; geburtsname?: string; geschlecht?: string; geburtsdatum?: string; staatsangehoerigkeit?: string } = {};

const makeTimestamp = () => {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('-');
};

test.describe('Student minimal edit', () => {
  test.beforeEach(async ({ page }) => {
    await seedTestData(page);
  });

  test.afterEach(async ({ page }) => {
    if (keepTestData) {
      console.log('Keeping test data changes (KEEP_TEST_DATA=true)');
    } else {
      await resetTestData(page, originalValues);
    }
  });

  test('Edit Nachname, Rufname, Alle Vornamen, Geburtsort, Geburtsname, Geschlecht, Geburtsdatum, 1. Staatsangehörigkeit', async ({ page }) => {
    const timestamp = makeTimestamp();
    const newLastName = `Testname-${timestamp}`;
    const newFirstName = `Testrufname-${timestamp}`;
    const newAllFirstNames = `TestAllNames-${timestamp}`;
    const newBirthPlace = `TestBirthPlace-${timestamp}`;
    const newBirthName = `TestBirthName-${timestamp}`;
    const newGender: 'm' | 'w' | 'd' = 'd'; // männlich, weiblich, or divers
    // Use ISO format for date inputs to avoid malformed value errors
    const newBirthDate = '2000-12-31';
    const newNationality = 'jamaikanisch';

    // Login
    await page.goto('/');
    await page.getByLabel('Datenbank-Schema').click();
    await page.getByRole('option', { name: 'svwse2e' }).click();
    await page.getByLabel('Benutzername').fill('Admin');
    await page.getByLabel('Passwort').fill('');
    await page.getByRole('button', { name: /anmelden|login/i }).click();
    await page.waitForURL('**/svwse2e/**');

    // Navigate to student
    const studentsLink = page.getByRole('link', { name: /schüler|students|pupils/i }).first()
      .or(page.getByRole('button', { name: /schüler|students|pupils/i }).first());
    if (await studentsLink.isVisible({ timeout: 2000 })) {
      await studentsLink.click();
    }
    await page.waitForTimeout(500);

    const row = page.locator('[role="row"]').filter({ hasText: TEST_STUDENT.nachname }).first()
      .or(page.locator('tr').filter({ hasText: TEST_STUDENT.nachname }).first());
    if (await row.isVisible({ timeout: 3000 })) {
      await row.click();
    } else {
      const fallback = page.locator('[role="row"]').filter({ hasText: /^[A-Za-z]/ }).first();
      await fallback.click();
    }
    await page.waitForURL('**/schueler/**/daten', { timeout: 4000 }).catch(() => {});

    // Enter edit mode if needed
    const editButton = page.getByRole('button', { name: /bearbeiten|edit/i }).first()
      .or(page.locator('[data-testid*="edit"]').first());
    if (await editButton.isVisible({ timeout: 1500 })) {
      await editButton.click();
      await page.waitForTimeout(500);
    }

    // Capture original values before modifying
    const origLastNameField = page.getByLabel(/nachname|lastname/i).first()
      .or(page.locator('input[name*="nachname"]').first());
    const origFirstNameField = page.getByLabel(/rufname|given name|first name/i).first()
      .or(page.locator('input[name*="rufname"]').first());
    const origAllFirstNamesField = page.getByLabel(/alle vornamen|all first names|all given names/i).first()
      .or(page.locator('input[name*="alleVornamen"]').first());
    const origBirthPlaceField = page.getByLabel(/geburtsort|birth.?place/i).first()
      .or(page.locator('input[name*="geburtsort"]').first());
    const origBirthNameField = page.getByLabel(/geburtsname|birth.?name/i).first()
      .or(page.locator('input[name*="geburtsname"]').first());
    const origGenderField = page.getByLabel(/geschlecht|gender|sex/i).first()
      .or(page.locator('select[name*="geschlecht"]').first());
    const origBirthDateField = page.getByLabel(/geburtsdatum|birth.?date|geburt/i).first()
      .or(page.locator('input[type="date"]').first());
    const origNationalityField = page.getByLabel(/1\.\s*staatsangehörigkeit|staatsangehörigkeit|nationality|citizenship/i).first();

    if (await origLastNameField.isVisible({ timeout: 500 })) {
      originalValues.nachname = await origLastNameField.inputValue();
    }
    if (await origFirstNameField.isVisible({ timeout: 500 })) {
      originalValues.rufname = await origFirstNameField.inputValue();
    }
    if (await origAllFirstNamesField.isVisible({ timeout: 500 })) {
      originalValues.alleVornamen = await origAllFirstNamesField.inputValue();
    }
    if (await origBirthPlaceField.isVisible({ timeout: 500 })) {
      originalValues.geburtsort = await origBirthPlaceField.inputValue();
    }
    if (await origBirthNameField.isVisible({ timeout: 500 })) {
      originalValues.geburtsname = await origBirthNameField.inputValue();
    }
    if (await origGenderField.isVisible({ timeout: 500 })) {
      originalValues.geschlecht = await origGenderField.inputValue();
    }
    if (await origBirthDateField.isVisible({ timeout: 500 })) {
      originalValues.geburtsdatum = await origBirthDateField.inputValue();
    }
    if (await origNationalityField.isVisible({ timeout: 500 })) {
      originalValues.staatsangehoerigkeit = await origNationalityField.inputValue();
    }
    console.log('=== CAPTURED ORIGINAL VALUES ===');
    console.log(`Nachname: "${originalValues.nachname}"`);
    console.log(`Rufname: "${originalValues.rufname}"`);
    console.log(`Alle Vornamen: "${originalValues.alleVornamen}"`);
    console.log(`Geburtsort: "${originalValues.geburtsort}"`);
    console.log(`Geburtsname: "${originalValues.geburtsname}"`);
    console.log(`Geschlecht: "${originalValues.geschlecht}"`);
    console.log(`Geburtsdatum: "${originalValues.geburtsdatum}"`);
    console.log(`1. Staatsangehörigkeit: "${originalValues.staatsangehoerigkeit}"`);
    console.log('=== END ORIGINAL VALUES ===');

    // Fill Nachname
    const lastNameField = page.getByLabel(/nachname|lastname/i).first()
      .or(page.locator('input[name*="nachname"]').first());
    await lastNameField.fill(newLastName);

    // Fill Rufname
    const firstNameField = page.getByLabel(/rufname|given name|first name/i).first()
      .or(page.locator('input[name*="rufname"]').first());
    await firstNameField.fill(newFirstName);

    // Fill Alle Vornamen
    const allFirstNamesField = page.getByLabel(/alle vornamen|all first names|all given names/i).first()
      .or(page.locator('input[name*="alleVornamen"]').first());
    await allFirstNamesField.fill(newAllFirstNames);

    // Fill Geburtsort
    const birthPlaceField = page.getByLabel(/geburtsort|birth.?place/i).first()
      .or(page.locator('input[name*="geburtsort"]').first());
    if (await birthPlaceField.isVisible({ timeout: 500 })) {
      await birthPlaceField.fill(newBirthPlace);
    }

    // Fill Geburtsname
    const birthNameField = page.getByLabel(/geburtsname|birth.?name/i).first()
      .or(page.locator('input[name*="geburtsname"]').first());
    if (await birthNameField.isVisible({ timeout: 500 })) {
      await birthNameField.fill(newBirthName);
    }

    // Fill Geschlecht (combobox field - same pattern as Staatsangehörigkeit)
    const genderField = page.getByLabel(/geschlecht|gender|sex/i).first()
      .or(page.locator('input[role="combobox"][aria-label*="eschlecht"]').first());
    if (await genderField.isVisible({ timeout: 1000 })) {
      // Click to open the combobox dropdown
      await genderField.click();
      await page.waitForTimeout(300);
      
      // Map gender value to display text
      let genderDisplayText = '';
      if (newGender === 'm') genderDisplayText = 'männlich|m';
      else if (newGender === 'w') genderDisplayText = 'weiblich|w';
      else if (newGender === 'd') genderDisplayText = 'divers|d';
      
      // Look for and click the gender option
      const genderOption = page.getByRole('option', { name: new RegExp(genderDisplayText, 'i') }).first();
      if (await genderOption.isVisible({ timeout: 1000 })) {
        await genderOption.click();
        console.log(`Geschlecht set to "${newGender}" (combobox)`);
      } else {
        console.log(`Gender option for "${newGender}" not found in combobox dropdown`);
      }
    } else {
      console.log('Geschlecht field not visible - skipped');
    }

    // Fill Geburtsdatum (using dd.mm.yyyy as requested)
    const birthDateField = page.getByLabel(/geburtsdatum|birth.?date|geburt/i).first()
      .or(page.locator('input[type="date"]').first());
    await birthDateField.fill(newBirthDate);

    // Fill 1. Staatsangehörigkeit - it's a combobox field
    const nationalityField = page.getByLabel(/1\.\s*staatsangehörigkeit|staatsangehörigkeit|nationality|citizenship/i).first();
    if (await nationalityField.isVisible({ timeout: 1000 })) {
      // Click to open the combobox dropdown
      await nationalityField.click();
      await page.waitForTimeout(300);
      
      // Look for and click the "Jamaikanisch" option
      const jamaicaOption = page.getByRole('option', { name: /jamaikanisch|jamaica/i }).first();
      if (await jamaicaOption.isVisible({ timeout: 1000 })) {
        await jamaicaOption.click();
        console.log('1. Staatsangehörigkeit set to "Jamaikanisch" (combobox)');
      } else {
        console.log('Jamaikanisch option not found in combobox dropdown');
      }
    } else {
      console.log('1. Staatsangehörigkeit field not visible - skipped');
    }

    // Debug: Take screenshot before save
    await page.screenshot({ path: 'debug-images/debug-minimal-before-save.png' });
    console.log('Screenshot taken: debug-images/debug-minimal-before-save.png');

    // Save
    const saveButton = page.getByRole('button', { name: /speichern|save|ok/i }).first()
      .or(page.locator('button[type="submit"]').first());
    
    if (await saveButton.isVisible({ timeout: 2000 })) {
      console.log('Save button found, clicking...');
      await saveButton.click();
    } else {
      console.log('Save button not found - may already be saved or form is in view mode');
    }
    await page.waitForTimeout(1500);

    // Quick verification in the same view (inputs still present)
    console.log('=== INPUT SNAPSHOT: after save (same view) ===');
    const snapshotChecks = [
      { label: 'Nachname', locator: lastNameField },
      { label: 'Rufname', locator: firstNameField },
      { label: 'Alle Vornamen', locator: allFirstNamesField },
      { label: 'Geburtsort', locator: birthPlaceField },
      { label: 'Geburtsname', locator: birthNameField },
      { label: 'Geschlecht', locator: genderField },
      { label: 'Geburtsdatum', locator: birthDateField },
      { label: '1. Staatsangehörigkeit', locator: nationalityField },
    ];
    for (const check of snapshotChecks) {
      try {
        if (await check.locator.isVisible({ timeout: 500 })) {
          const value = await check.locator.inputValue();
          console.log(`${check.label}: "${value}"`);
        } else {
          console.log(`${check.label}: not visible`);
        }
      } catch (err) {
        console.log(`${check.label}: read failed - ${err}`);
      }
    }
    console.log('=== END INPUT SNAPSHOT ===');

    // Minimal assertion: Nachname visible somewhere on page (use nth to bypass strict mode)
    const nameLocator = page.getByText(newLastName).first();
    await expect(nameLocator).toBeVisible({ timeout: 2000 });
  });
});
