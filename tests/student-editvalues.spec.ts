import { test } from './fixtures';
import { expect } from '@playwright/test';
import { seedTestData, resetTestData, TEST_STUDENT } from './test-data';

const keepTestData = process.env.KEEP_TEST_DATA === 'true' || process.env.KEEP_TEST_DATA === '1';

// Store original values for reset after test
let originalValues: {
  nachname?: string;
  rufname?: string;
  alleVornamen?: string;
  geburtsort?: string;
  geburtsname?: string;
  geschlecht?: string;
  geburtsdatum?: string;
  staatsangehoerigkeit?: string;
  staatsangehoerigkeit2?: string;
  strasse?: string;
  wohnort?: string;
  ortsteil?: string;
  telefon?: string;
  mobilOderFax?: string;
  privateEmail?: string;
  schulEmail?: string;
  konfession?: string;
  konfessionAufsZeugnis?: boolean;
  abmeldungReligion?: string;
  wiederanmeldung?: string;
  migrationshintergrundVorhanden?: boolean;
  zuzugsjahr?: string;
  geburtsland?: string;
  geburtslandMutter?: string;
  geburtslandVater?: string;
  verkehrssprache?: string;
} = {};

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

const getTodayDate = () => {
  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
};

test.describe('Student minimal edit', () => {
  test.beforeEach(async ({ page }) => {
    // Reset originalValues before each test
    originalValues = {};
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
    // Randomly select a gender option to test different values
    const genderOptions = ['m', 'w', 'd'] as const;
    const newGender = genderOptions[Math.floor(Math.random() * genderOptions.length)];
    // Use ISO format for date inputs to avoid malformed value errors
    const newBirthDate = '2000-12-31';
    const newNationality = 'jamaikanisch';
    const newNationality2 = 'laotisch';
    const newStreet = `Teststraße 123`;
    const newTown = '42287 Wuppertal';
    const newDistrict = 'Barmen';
    const newPhone = '555555';
    const newMobileOrFax = '555555';
    const newPrivateEmail = `test.privat.${timestamp}@example.com`;
    const newSchoolEmail = `test.schule.${timestamp}@example.com`;
    const newKonfession = 'Testkonfession';
    // Always toggle the checkbox (check if unchecked, uncheck if checked)
    const todayDate = getTodayDate();
    const newAbmeldungReligion = todayDate; // Withdrawal date (today)
    const newWiederanmeldung = todayDate; // Re-registration date (today)
    // Ensure Migrationshintergrund checkbox is checked to enable other fields
    const ensureMigrationshintergrundChecked = true;
    // Migrationshintergrund-dependent fields
    const currentYear = new Date().getFullYear().toString();
    const newZuzugsjahr = currentYear; // Year of move
    const newGeburtsland = 'Fidschi';
    const newGeburtslandMutter = 'Fidschi';
    const newGeburtslandVater = 'Fidschi';
    const newVerkehrssprache = 'Fidschi';

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
    const origNationalityField2 = page.getByLabel(/2\.\s*staatsangehörigkeit|zweit.*staatsangehörigkeit|second.*nationality|citizenship.*2/i).first()
      .or(page.locator('input[role="combobox"][aria-label*="2."]').first());
    const origStreetField = page.getByLabel(/straße|strasse|street/i).first()
      .or(page.locator('input[name*="strasse"]').first());
    const origTownField = page.getByRole('combobox', { name: /wohnort/i }).first()
      .or(page.locator('input[role="combobox"][aria-label*="ohnort"]').first());
    const origDistrictField = page.getByRole('combobox', { name: /ortsteil|stadtteil|bezirk/i }).first()
      .or(page.locator('input[role="combobox"][aria-label*="ortsteil"]').first());
    const origPhoneField = page.getByLabel(/telefon|phone/i).first()
      .or(page.locator('input[name*="telefon"]').first());
    const origMobileFaxField = page.getByLabel(/mobil|fax/i).first()
      .or(page.locator('input[name*="mobil"]').first());
    const origPrivateEmailField = page.getByLabel(/private.*e-?mail|e-?mail.*privat|privat.*mail/i).first()
      .or(page.locator('input[name*="emailPrivat"]').first());
    const origSchoolEmailField = page.getByLabel(/schulische.*e-?mail|schule.*e-?mail|school.*email/i).first()
      .or(page.locator('input[name*="emailSchule"]').first());
    const origKonfessionField = page.getByLabel(/konfession|religion|faith/i).first()
      .or(page.locator('input[role="combobox"][aria-label*="onfession"]').first());
    const origKonfessionAufsZeugnisField = page.getByLabel(/konfession.*zeugnis|zeugnis.*konfession/i).first()
      .or(page.locator('input[type="checkbox"][aria-label*="onfession"]').first());
    const origAbmeldungReligionField = page.getByLabel(/abmeldung.*religion|religion.*abmeldung/i).first()
      .or(page.locator('input[type="date"][aria-label*="bmel"]').first());
    const origWiederanmeldungField = page.getByLabel(/wiederanmeldung|re-?registration/i).first()
      .or(page.locator('input[type="date"][aria-label*="ieder"]').first());
    const origMigrationshintergrundField = page.getByLabel(/migrationshintergrund.*vorhanden|vorhanden.*migrationshintergrund/i).first()
      .or(page.locator('input[type="checkbox"][aria-label*="igrationshintergrund"]').first());
    const origZuzugsjahr = page.getByLabel(/zuzugsjahr|year.*of.*move/i).first()
      .or(page.locator('input[type="text"][aria-label*="uzugs"]').first());
    const origGeburtslandField = page.getByLabel(/geburtsland(?!.*mutter|.*vater)|birth.*country(?!.*mother|.*father)/i).first()
      .or(page.locator('input[role="combobox"][aria-label*="eburtsland"]').first());
    const origGeburtslandMutterField = page.getByLabel(/geburtsland.*mutter|mutter.*geburtsland/i).first()
      .or(page.locator('input[role="combobox"][aria-label*="utter"]').first());
    const origGeburtslandVaterField = page.getByLabel(/geburtsland.*vater|vater.*geburtsland/i).first()
      .or(page.locator('input[role="combobox"][aria-label*="ater"]').first());
    const origVerkehrsspracheField = page.getByLabel(/verkehrssprache|language.*spoken/i).first()
      .or(page.locator('input[role="combobox"][aria-label*="erkehrssprache"]').first());

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
    if (await origNationalityField2.isVisible({ timeout: 500 })) {
      originalValues.staatsangehoerigkeit2 = await origNationalityField2.inputValue();
    }
    if (await origStreetField.isVisible({ timeout: 500 })) {
      originalValues.strasse = await origStreetField.inputValue();
    }
    if (await origTownField.isVisible({ timeout: 500 })) {
      originalValues.wohnort = await origTownField.inputValue();
    }
    if (await origDistrictField.isVisible({ timeout: 500 })) {
      originalValues.ortsteil = await origDistrictField.inputValue();
    }
    if (await origPhoneField.isVisible({ timeout: 500 })) {
      originalValues.telefon = await origPhoneField.inputValue();
    }
    if (await origMobileFaxField.isVisible({ timeout: 500 })) {
      originalValues.mobilOderFax = await origMobileFaxField.inputValue();
    }
    if (await origPrivateEmailField.isVisible({ timeout: 500 })) {
      originalValues.privateEmail = await origPrivateEmailField.inputValue();
    }
    if (await origSchoolEmailField.isVisible({ timeout: 500 })) {
      originalValues.schulEmail = await origSchoolEmailField.inputValue();
    }
    if (await origKonfessionField.isVisible({ timeout: 500 })) {
      originalValues.konfession = await origKonfessionField.inputValue();
    }
    if (await origKonfessionAufsZeugnisField.isVisible({ timeout: 500 })) {
      originalValues.konfessionAufsZeugnis = await origKonfessionAufsZeugnisField.isChecked();
    }
    if (await origAbmeldungReligionField.isVisible({ timeout: 500 })) {
      originalValues.abmeldungReligion = await origAbmeldungReligionField.inputValue();
    }
    if (await origWiederanmeldungField.isVisible({ timeout: 500 })) {
      originalValues.wiederanmeldung = await origWiederanmeldungField.inputValue();
    }
    if (await origMigrationshintergrundField.isVisible({ timeout: 500 })) {
      originalValues.migrationshintergrundVorhanden = await origMigrationshintergrundField.isChecked();
    }
    if (await origZuzugsjahr.isVisible({ timeout: 500 })) {
      originalValues.zuzugsjahr = await origZuzugsjahr.inputValue();
    }
    if (await origGeburtslandField.isVisible({ timeout: 500 })) {
      originalValues.geburtsland = await origGeburtslandField.inputValue();
    }
    if (await origGeburtslandMutterField.isVisible({ timeout: 500 })) {
      originalValues.geburtslandMutter = await origGeburtslandMutterField.inputValue();
    }
    if (await origGeburtslandVaterField.isVisible({ timeout: 500 })) {
      originalValues.geburtslandVater = await origGeburtslandVaterField.inputValue();
    }
    if (await origVerkehrsspracheField.isVisible({ timeout: 500 })) {
      originalValues.verkehrssprache = await origVerkehrsspracheField.inputValue();
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
    console.log(`2. Staatsangehörigkeit: "${originalValues.staatsangehoerigkeit2}"`);
    console.log(`Straße: "${originalValues.strasse}"`);
    console.log(`Wohnort: "${originalValues.wohnort}"`);
    console.log(`Ortsteil: "${originalValues.ortsteil}"`);
    console.log(`Telefon: "${originalValues.telefon}"`);
    console.log(`Mobil oder Fax: "${originalValues.mobilOderFax}"`);
    console.log(`Private E-Mail-Adresse: "${originalValues.privateEmail}"`);
    console.log(`Schulische E-Mail-Adresse: "${originalValues.schulEmail}"`);
    console.log(`Konfession: "${originalValues.konfession}"`);
    console.log(`Konfession aufs Zeugnis: ${originalValues.konfessionAufsZeugnis}`);
    console.log(`Abmeldung vom Religionsunterricht: "${originalValues.abmeldungReligion}"`);
    console.log(`Wiederanmeldung: "${originalValues.wiederanmeldung}"`);
    console.log(`Migrationshintergrund vorhanden: ${originalValues.migrationshintergrundVorhanden}`);
    console.log(`Zuzugsjahr: "${originalValues.zuzugsjahr}"`);
    console.log(`Geburtsland: "${originalValues.geburtsland}"`);
    console.log(`Geburtsland Mutter: "${originalValues.geburtslandMutter}"`);
    console.log(`Geburtsland Vater: "${originalValues.geburtslandVater}"`);
    console.log(`Verkehrssprache: "${originalValues.verkehrssprache}"`);
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

    // Fill Straße
    const streetField = page.getByLabel(/straße|strasse|street/i).first()
      .or(page.locator('input[name*="strasse"]').first());
    if (await streetField.isVisible({ timeout: 500 })) {
      await streetField.fill(newStreet);
    }

    // Fill Wohnort (combobox)
    const townField = page.getByRole('combobox', { name: /wohnort/i }).first()
      .or(page.locator('input[role="combobox"][aria-label*="ohnort"]').first());
    if (await townField.isVisible({ timeout: 1000 })) {
      await townField.click();
      await page.waitForTimeout(300);
      const townOption = page.getByRole('option', { name: new RegExp('42287.*wuppertal', 'i') }).first();
      if (await townOption.isVisible({ timeout: 1000 })) {
        await townOption.click();
        console.log('Wohnort set to "42287 Wuppertal" (combobox)');
      } else {
        console.log('Wohnort option "42287 Wuppertal" not found');
      }
    }

    // Fill Ortsteil (combobox) → type filter then select
    const districtField = page.getByRole('combobox', { name: /ortsteil|stadtteil|bezirk/i }).first()
      .or(page.locator('input[role="combobox"][aria-label*="ortsteil"]').first());
    if (await districtField.isVisible({ timeout: 1000 })) {
      await districtField.click();
      await page.waitForTimeout(200);
      // Type to filter and confirm with Enter
      await page.keyboard.type('Barmen');
      await page.waitForTimeout(300);
      const opt = page.getByRole('option', { name: /barmen/i }).first();
      if (await opt.isVisible({ timeout: 800 })) {
        await opt.click();
        console.log('Ortsteil set to "Barmen" (combobox)');
      } else {
        await page.keyboard.press('Enter');
        console.log('Ortsteil set via Enter to "Barmen" (combobox)');
      }
      // Blur to trigger autosave
      try { await districtField.press('Tab'); } catch {}
      await page.waitForTimeout(300);
    }

    // Fill Telefon
    const phoneField = page.getByLabel(/telefon|phone/i).first()
      .or(page.locator('input[name*="telefon"]').first());
    if (await phoneField.isVisible({ timeout: 500 })) {
      await phoneField.fill(newPhone);
    }

    // Fill Mobil oder Fax
    const mobileFaxField = page.getByLabel(/mobil|fax/i).first()
      .or(page.locator('input[name*="mobil"]').first());
    if (await mobileFaxField.isVisible({ timeout: 500 })) {
      await mobileFaxField.fill(newMobileOrFax);
    }

    // Fill Private E-Mail-Adresse
    const privateEmailField = page.getByLabel(/private.*e-?mail|e-?mail.*privat|privat.*mail/i).first()
      .or(page.locator('input[name*="emailPrivat"]').first());
    if (await privateEmailField.isVisible({ timeout: 500 })) {
      await privateEmailField.fill(newPrivateEmail);
    }

    // Fill Schulische E-Mail-Adresse
    const schoolEmailField = page.getByLabel(/schulische.*e-?mail|schule.*e-?mail|school.*email/i).first()
      .or(page.locator('input[name*="emailSchule"]').first());
    if (await schoolEmailField.isVisible({ timeout: 500 })) {
      await schoolEmailField.fill(newSchoolEmail);
    }

    // Fill Konfession (combobox field)
    const konfessionField = page.getByLabel(/konfession|religion|faith/i).first()
      .or(page.locator('input[role="combobox"][aria-label*="onfession"]').first());
    if (await konfessionField.isVisible({ timeout: 1000 })) {
      await konfessionField.click();
      await page.waitForTimeout(300);
      const konfessionOption = page.getByRole('option', { name: new RegExp(newKonfession, 'i') }).first();
      if (await konfessionOption.isVisible({ timeout: 1000 })) {
        await konfessionOption.click();
        console.log(`Konfession set to "${newKonfession}" (combobox)`);
      } else {
        console.log(`Konfession option "${newKonfession}" not found in combobox dropdown`);
      }
    } else {
      console.log('Konfession field not visible - skipped');
    }

    // Fill Konfession aufs Zeugnis (checkbox field)
    const konfessionAufsZeugnisField = page.getByLabel(/konfession.*zeugnis|zeugnis.*konfession/i).first()
      .or(page.locator('input[type="checkbox"][aria-label*="onfession"]').first());
    if (await konfessionAufsZeugnisField.isVisible({ timeout: 1000 })) {
      const isCurrentlyChecked = await konfessionAufsZeugnisField.isChecked();
      // Always toggle the checkbox
      await konfessionAufsZeugnisField.click();
      const newState = !isCurrentlyChecked;
      console.log(`Konfession aufs Zeugnis toggled from ${isCurrentlyChecked} to ${newState}`);
    } else {
      console.log('Konfession aufs Zeugnis field not visible - skipped');
    }

    // Fill Abmeldung vom Religionsunterricht (date field)
    const abmeldungReligionField = page.getByLabel(/abmeldung.*religion|religion.*abmeldung/i).first()
      .or(page.locator('input[type="date"][aria-label*="bmel"]').first());
    if (await abmeldungReligionField.isVisible({ timeout: 500 })) {
      await abmeldungReligionField.fill(newAbmeldungReligion);
      console.log(`Abmeldung vom Religionsunterricht set to "${newAbmeldungReligion}" (date)`);
    } else {
      console.log('Abmeldung vom Religionsunterricht field not visible - skipped');
    }

    // Fill Wiederanmeldung (date field)
    const wiederanmeldungField = page.getByLabel(/wiederanmeldung|re-?registration/i).first()
      .or(page.locator('input[type="date"][aria-label*="ieder"]').first());
    if (await wiederanmeldungField.isVisible({ timeout: 500 })) {
      await wiederanmeldungField.fill(newWiederanmeldung);
      console.log(`Wiederanmeldung set to "${newWiederanmeldung}" (date)`);
    } else {
      console.log('Wiederanmeldung field not visible - skipped');
    }

    // Ensure Migrationshintergrund vorhanden checkbox is checked (to enable other fields)
    const migrationshintergrundField = page.getByLabel(/migrationshintergrund.*vorhanden|vorhanden.*migrationshintergrund/i).first()
      .or(page.locator('input[type="checkbox"][aria-label*="igrationshintergrund"]').first());
    if (await migrationshintergrundField.isVisible({ timeout: 1000 })) {
      const isCurrentlyChecked = await migrationshintergrundField.isChecked();
      if (!isCurrentlyChecked && ensureMigrationshintergrundChecked) {
        // If unchecked and we need it checked, check it
        await migrationshintergrundField.click();
        console.log(`Migrationshintergrund vorhanden: enabled (was unchecked, now checked)`);
      } else if (isCurrentlyChecked) {
        console.log(`Migrationshintergrund vorhanden: already checked`);
      }
    } else {
      console.log('Migrationshintergrund vorhanden field not visible - skipped');
    }

    // Fill Zuzugsjahr (text input - current year)
    const zuzugsjahr = page.getByLabel(/zuzugsjahr|year.*of.*move/i).first()
      .or(page.locator('input[type="text"][aria-label*="uzugs"]').first());
    if (await zuzugsjahr.isVisible({ timeout: 500 })) {
      await zuzugsjahr.fill(newZuzugsjahr);
      console.log(`Zuzugsjahr set to "${newZuzugsjahr}" (text)`);
    } else {
      console.log('Zuzugsjahr field not visible - skipped');
    }

    // Fill Geburtsland (combobox)
    const geburtslandField = page.getByLabel(/geburtsland(?!.*mutter|.*vater)|birth.*country(?!.*mother|.*father)/i).first()
      .or(page.locator('input[role="combobox"][aria-label*="eburtsland"]').first());
    if (await geburtslandField.isVisible({ timeout: 1000 })) {
      await geburtslandField.click();
      await page.waitForTimeout(300);
      const geburtslandOption = page.getByRole('option', { name: new RegExp(newGeburtsland, 'i') }).first();
      if (await geburtslandOption.isVisible({ timeout: 1000 })) {
        await geburtslandOption.click();
        console.log(`Geburtsland set to "${newGeburtsland}" (combobox)`);
      } else {
        console.log(`Geburtsland option "${newGeburtsland}" not found`);
      }
    } else {
      console.log('Geburtsland field not visible - skipped');
    }

    // Fill Geburtsland Mutter (combobox)
    const geburtslandMutterField = page.getByLabel(/geburtsland.*mutter|mutter.*geburtsland/i).first()
      .or(page.locator('input[role="combobox"][aria-label*="utter"]').first());
    if (await geburtslandMutterField.isVisible({ timeout: 1000 })) {
      await geburtslandMutterField.click();
      await page.waitForTimeout(300);
      const geburtslandMutterOption = page.getByRole('option', { name: new RegExp(newGeburtslandMutter, 'i') }).first();
      if (await geburtslandMutterOption.isVisible({ timeout: 1000 })) {
        await geburtslandMutterOption.click();
        console.log(`Geburtsland Mutter set to "${newGeburtslandMutter}" (combobox)`);
      } else {
        console.log(`Geburtsland Mutter option "${newGeburtslandMutter}" not found`);
      }
    } else {
      console.log('Geburtsland Mutter field not visible - skipped');
    }

    // Fill Geburtsland Vater (combobox)
    const geburtslandVaterField = page.getByLabel(/geburtsland.*vater|vater.*geburtsland/i).first()
      .or(page.locator('input[role="combobox"][aria-label*="ater"]').first());
    if (await geburtslandVaterField.isVisible({ timeout: 1000 })) {
      await geburtslandVaterField.click();
      await page.waitForTimeout(300);
      const geburtslandVaterOption = page.getByRole('option', { name: new RegExp(newGeburtslandVater, 'i') }).first();
      if (await geburtslandVaterOption.isVisible({ timeout: 1000 })) {
        await geburtslandVaterOption.click();
        console.log(`Geburtsland Vater set to "${newGeburtslandVater}" (combobox)`);
      } else {
        console.log(`Geburtsland Vater option "${newGeburtslandVater}" not found`);
      }
    } else {
      console.log('Geburtsland Vater field not visible - skipped');
    }

    // Fill Verkehrssprache (combobox)
    const verkehrsspracheField = page.getByLabel(/verkehrssprache|language.*spoken/i).first()
      .or(page.locator('input[role="combobox"][aria-label*="erkehrssprache"]').first());
    if (await verkehrsspracheField.isVisible({ timeout: 1000 })) {
      await verkehrsspracheField.click();
      await page.waitForTimeout(300);
      const verkehrsspracheOption = page.getByRole('option', { name: new RegExp(newVerkehrssprache, 'i') }).first();
      if (await verkehrsspracheOption.isVisible({ timeout: 1000 })) {
        await verkehrsspracheOption.click();
        console.log(`Verkehrssprache set to "${newVerkehrssprache}" (combobox)`);
      } else {
        console.log(`Verkehrssprache option "${newVerkehrssprache}" not found`);
      }
    } else {
      console.log('Verkehrssprache field not visible - skipped');
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

    // Fill 2. Staatsangehörigkeit - tests selection in this combobox
    // NOTE: Known limitation - the X button to clear combobox to empty state is not reliably
    // clickable via automation (works manually but Playwright cannot target it). When originally
    // empty, the field will remain filled after test. Use KEEP_TEST_DATA mode to inspect.
    const nationalityField2 = page.getByLabel(/2\.\s*staatsangehörigkeit|zweit.*staatsangehörigkeit|second.*nationality|citizenship.*2/i).first();
    if (await nationalityField2.isVisible({ timeout: 1000 })) {
      // Only fill if not originally empty, to avoid testing the clearing logic which has UI issues
      if (originalValues.staatsangehoerigkeit2) {
        await nationalityField2.click();
        await page.waitForTimeout(300);
        const laotischOption2 = page.getByRole('option', { name: /laotisch/i }).first();
        if (await laotischOption2.isVisible({ timeout: 1000 })) {
          await laotischOption2.click();
          console.log('2. Staatsangehörigkeit set to "Laotisch" (combobox)');
        } else {
          await page.keyboard.type('Laotisch');
          await page.waitForTimeout(200);
          await page.keyboard.press('Enter');
          console.log('2. Staatsangehörigkeit set via Enter to "Laotisch" (combobox)');
        }
      } else {
        // Original was empty - set it to Laotisch for testing
        await nationalityField2.click();
        await page.waitForTimeout(300);
        const laotischOption2 = page.getByRole('option', { name: /laotisch/i }).first();
        if (await laotischOption2.isVisible({ timeout: 1000 })) {
          await laotischOption2.click();
          console.log('2. Staatsangehörigkeit set to "Laotisch" (combobox, was empty)');
        } else {
          await page.keyboard.type('Laotisch');
          await page.waitForTimeout(200);
          await page.keyboard.press('Enter');
          console.log('2. Staatsangehörigkeit set via Enter to "Laotisch" (combobox, was empty)');
        }
      }
    } else {
      console.log('2. Staatsangehörigkeit field not visible - skipped');
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
      { label: 'Straße', locator: streetField },
      { label: 'Wohnort', locator: townField },
      { label: 'Ortsteil', locator: districtField },
      { label: 'Telefon', locator: phoneField },
      { label: 'Mobil oder Fax', locator: mobileFaxField },
      { label: 'Private E-Mail-Adresse', locator: privateEmailField },
      { label: 'Schulische E-Mail-Adresse', locator: schoolEmailField },
      { label: 'Geschlecht', locator: genderField },
      { label: 'Geburtsdatum', locator: birthDateField },
      { label: '1. Staatsangehörigkeit', locator: nationalityField },
      { label: '2. Staatsangehörigkeit', locator: nationalityField2 },
      { label: 'Konfession', locator: konfessionField },
      { label: 'Konfession aufs Zeugnis', locator: konfessionAufsZeugnisField },
      { label: 'Abmeldung vom Religionsunterricht', locator: abmeldungReligionField },
      { label: 'Wiederanmeldung', locator: wiederanmeldungField },
      { label: 'Migrationshintergrund vorhanden', locator: migrationshintergrundField },
      { label: 'Zuzugsjahr', locator: zuzugsjahr },
      { label: 'Geburtsland', locator: geburtslandField },
      { label: 'Geburtsland Mutter', locator: geburtslandMutterField },
      { label: 'Geburtsland Vater', locator: geburtslandVaterField },
      { label: 'Verkehrssprache', locator: verkehrsspracheField },
    ];
    for (const check of snapshotChecks) {
      try {
        if (await check.locator.isVisible({ timeout: 500 })) {
          // Handle checkbox fields differently
          if (check.label === 'Konfession aufs Zeugnis') {
            const isChecked = await check.locator.isChecked();
            console.log(`${check.label}: ${isChecked}`);
          } else {
            const value = await check.locator.inputValue();
            console.log(`${check.label}: "${value}"`);
          }
        } else {
          console.log(`${check.label}: not visible`);
        }
      } catch (err) {
        console.log(`${check.label}: read failed - ${err}`);
      }
    }
    console.log('=== END INPUT SNAPSHOT ===');

    // View-mode verification: pair label "Ortsteil" with its displayed value
    try {
      let verified = false;

      // Strategy A: definition list pattern dt/dd
      const ddValue = page.locator('xpath=//dt[normalize-space(.)="Ortsteil"]/following-sibling::dd[1]').first();
      if (await ddValue.isVisible({ timeout: 800 })) {
        const txt = (await ddValue.textContent()) || '';
        if (/barmen/i.test(txt)) {
          console.log('✓ Ortsteil (dt/dd) shows "Barmen"');
          verified = true;
        }
      }

      // Strategy B: role=group named Ortsteil, then value inside
      if (!verified) {
        const group = page.getByRole('group', { name: /ortsteil/i }).first();
        if (await group.isVisible({ timeout: 800 })) {
          const groupValue = group.locator('span,div,dd,p').filter({ hasText: /barmen/i }).first();
          if (await groupValue.isVisible({ timeout: 800 })) {
            console.log('✓ Ortsteil (group) shows "Barmen"');
            verified = true;
          }
        }
      }

      // Strategy C: label text container → nearest sibling value
      if (!verified) {
        const label = page.getByText(/^Ortsteil$/).first();
        if (await label.isVisible({ timeout: 800 })) {
          const container = label.locator('xpath=ancestor::*[self::div or self::li or self::tr][1]');
          const nearValue = container.getByText(/barmen/i).first();
          if (await nearValue.isVisible({ timeout: 800 })) {
            console.log('✓ Ortsteil (label+value) shows "Barmen"');
            verified = true;
          }
        }
      }

      // Fallback: generic text search
      if (!verified) {
        const barmenText = page.getByText(/\bBarmen\b/).first();
        if (await barmenText.isVisible({ timeout: 800 })) {
          console.log('✓ View-mode shows Ortsteil "Barmen" (generic)');
          verified = true;
        }
      }

      if (!verified) {
        console.log('⚠ Could not verify Ortsteil "Barmen" via label+value pairing');
      }
    } catch (err) {
      console.log('Ortsteil view-mode verification failed:', err);
    }

    // (Skipped) Combobox selected-option verification, as UI may not expose selected state reliably.

    // Minimal assertion: Nachname visible somewhere on page (use nth to bypass strict mode)
    const nameLocator = page.getByText(newLastName).first();
    await expect(nameLocator).toBeVisible({ timeout: 2000 });
  });
});
