import { test } from './fixtures';

// Test data seeding utilities
export interface TestStudent {
  id?: number;
  nachname: string;
  rufname: string;
  alleVornamen: string;
  geschlecht: 'm' | 'w' | 'd'; // m=männlich, w=weiblich, d=divers
  geburtsdatum: string; // YYYY-MM-DD format
}

// Known test student for consistent testing
export const TEST_STUDENT: TestStudent = {
  nachname: 'Teststudent',
  rufname: 'Anna',
  alleVornamen: 'Anna Maria',
  geschlecht: 'w',
  geburtsdatum: '2005-03-15'
};

// API base URL for test data management
const API_BASE = 'https://localhost:8443/api';

/**
 * Seed test data before tests
 * This function should be called in test setup
 */
export async function seedTestData(page: any) {
  console.log('Seeding test data...');

  // For now, just log that we're using existing data
  // The actual seeding would require proper API endpoints
  console.log('Using existing data in database (no API seeding implemented yet)');
  console.log('Test student should exist with name:', TEST_STUDENT.nachname);
}

/**
 * Reset test data after tests
 * This function should be called in test teardown
 * @param page - Playwright page object
 * @param originalValues - Original field values to restore
 */
export async function resetTestData(page: any, originalValues: any = {}) {
  console.log('Resetting test data...');

  if (!originalValues || Object.keys(originalValues).length === 0) {
    console.log('No original values provided - skipping reset');
    return;
  }

  try {
    // Navigate to the student we just modified
    await page.goto('https://localhost:8443/#/svwse2e/1/schueler/', { waitUntil: 'load', timeout: 5000 }).catch(() => {});
    
    // Prefer the exact student we modified (by original Nachname) before falling back to Testname- pattern
    const rows = page.locator('[role="row"]');
    const count = await rows.count();
    const testNamePattern = 'Testname-';
    let foundTestStudent = false;

    // Try to find by original Nachname first (handles fallback students like Briel/Boetius)
    if (originalValues.nachname) {
      for (let i = 0; i < Math.min(count, 50); i++) {
        const row = rows.nth(i);
        const text = await row.textContent().catch(() => '');
        if (text && text.includes(String(originalValues.nachname))) {
          console.log(`Found student ${originalValues.nachname} to reset at row ${i}`);
          await row.click();
          await page.waitForTimeout(500);
          foundTestStudent = true;
          break;
        }
      }
    }

    // Fallback: any Testname-* row
    if (!foundTestStudent) {
      for (let i = 0; i < Math.min(count, 50); i++) {
        const row = rows.nth(i);
        const text = await row.textContent().catch(() => '');
        if (text && text.includes(testNamePattern)) {
          console.log(`Found test student to reset at row ${i}`);
          await row.click();
          await page.waitForTimeout(500);
          foundTestStudent = true;
          break;
        }
      }
    }
    
    if (foundTestStudent) {
      // Enter edit mode
      const editBtn = page.getByRole('button', { name: /bearbeiten|edit/i }).first();
      console.log('Looking for edit button...');
      
      if (await editBtn.isVisible({ timeout: 1500 })) {
        console.log('Edit button found, clicking...');
        await editBtn.click();
        await page.waitForTimeout(1000); // Longer wait for edit mode to load
      } else {
        console.log('Edit button not visible, may already be in edit mode');
      }
        
        // Restore Nachname
        if (originalValues.nachname) {
          const nachnameField = page.getByLabel(/nachname|lastname/i).first();
          try {
            if (await nachnameField.isVisible({ timeout: 500 })) {
              await nachnameField.clear();
              await nachnameField.fill(originalValues.nachname);
              console.log(`✓ Restored Nachname to "${originalValues.nachname}"`);
            } else {
              console.log('Nachname field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Nachname: ${err}`);
          }
        }

        // Restore Rufname
        if (originalValues.rufname) {
          const rufnameField = page.getByLabel(/rufname|given name|first name/i).first();
          try {
            if (await rufnameField.isVisible({ timeout: 500 })) {
              await rufnameField.clear();
              await rufnameField.fill(originalValues.rufname);
              console.log(`✓ Restored Rufname to "${originalValues.rufname}"`);
            } else {
              console.log('Rufname field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Rufname: ${err}`);
          }
        }

        // Restore Alle Vornamen
        if (originalValues.hasOwnProperty('alleVornamen')) {
          const alleVornamenField = page.getByLabel(/alle vornamen|all first names|all given names/i).first();
          try {
            if (await alleVornamenField.isVisible({ timeout: 500 })) {
              await alleVornamenField.clear();
              await alleVornamenField.fill(originalValues.alleVornamen || '');
              console.log(`✓ Restored Alle Vornamen to "${originalValues.alleVornamen}"`);
            } else {
              console.log('Alle Vornamen field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Alle Vornamen: ${err}`);
          }
        }

        // Restore Geburtsort
        if (originalValues.hasOwnProperty('geburtsort')) {
          const geburtsortField = page.getByLabel(/geburtsort|birth.?place/i).first();
          try {
            if (await geburtsortField.isVisible({ timeout: 500 })) {
              await geburtsortField.clear();
              await geburtsortField.fill(originalValues.geburtsort || '');
              console.log(`✓ Restored Geburtsort to "${originalValues.geburtsort}"`);
            } else {
              console.log('Geburtsort field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Geburtsort: ${err}`);
          }
        }

        // Restore Geburtsname
        if (originalValues.hasOwnProperty('geburtsname')) {
          const geburtsnameField = page.getByLabel(/geburtsname|birth.?name/i).first();
          try {
            if (await geburtsnameField.isVisible({ timeout: 500 })) {
              await geburtsnameField.clear();
              await geburtsnameField.fill(originalValues.geburtsname || '');
              console.log(`✓ Restored Geburtsname to "${originalValues.geburtsname}"`);
            } else {
              console.log('Geburtsname field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Geburtsname: ${err}`);
          }
        }

        // Restore Geschlecht (combobox field - same pattern as Staatsangehörigkeit)
        if (originalValues.hasOwnProperty('geschlecht')) {
          const genderField = page.getByLabel(/geschlecht|gender|sex/i).first()
            .or(page.locator('input[role="combobox"][aria-label*="eschlecht"]').first());
          try {
            if (await genderField.isVisible({ timeout: 500 })) {
              await genderField.click();
              await page.waitForTimeout(300);
              
              // Try to find and click the original option using the stored value directly
              let found = false;
              const options = page.getByRole('option');
              const optCount = await options.count();
              
              console.log(`Looking for gender option "${originalValues.geschlecht}" among ${optCount} options`);
              for (let j = 0; j < optCount; j++) {
                const opt = options.nth(j);
                const optText = await opt.textContent().catch(() => '');
                if (optText && optText.toLowerCase().includes(originalValues.geschlecht.toLowerCase())) {
                  await opt.click();
                  found = true;
                  console.log(`✓ Restored Geschlecht to "${originalValues.geschlecht}"`);
                  break;
                }
              }
              
              if (!found) {
                console.log(`Could not find option for Geschlecht "${originalValues.geschlecht}" - will skip`);
              }
            } else {
              console.log('Geschlecht field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Geschlecht: ${err}`);
          }
        }
        
        // Restore Geburtsdatum
        if (originalValues.geburtsdatum) {
          const birthDateField = page.getByLabel(/geburtsdatum|birth.?date|geburt/i).first();
          try {
            if (await birthDateField.isVisible({ timeout: 500 })) {
              await birthDateField.clear();
              await birthDateField.fill(originalValues.geburtsdatum);
              console.log(`✓ Restored Geburtsdatum to "${originalValues.geburtsdatum}"`);
            } else {
              console.log('Geburtsdatum field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Geburtsdatum: ${err}`);
          }
        }
        
        // Restore Staatsangehörigkeit (combobox)
        if (originalValues.staatsangehoerigkeit) {
          const nationField = page.getByLabel(/1\.\s*staatsangehörigkeit|staatsangehörigkeit|nationality|citizenship/i).first();
          try {
            if (await nationField.isVisible({ timeout: 500 })) {
              await nationField.click();
              await page.waitForTimeout(300);
              
              // Try to find and click the original option
              let found = false;
              const options = page.getByRole('option');
              const optCount = await options.count();
              
              console.log(`Looking for option "${originalValues.staatsangehoerigkeit}" among ${optCount} options`);
              for (let j = 0; j < optCount; j++) {
                const opt = options.nth(j);
                const optText = await opt.textContent().catch(() => '');
                if (optText && optText.toLowerCase().includes(originalValues.staatsangehoerigkeit.toLowerCase())) {
                  await opt.click();
                  found = true;
                  console.log(`✓ Restored 1. Staatsangehörigkeit to "${originalValues.staatsangehoerigkeit}"`);
                  break;
                }
              }
              
              if (!found) {
                console.log(`Could not find option for "${originalValues.staatsangehoerigkeit}" - will skip`);
              }
            } else {
              console.log('1. Staatsangehörigkeit field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Staatsangehörigkeit: ${err}`);
          }
        }

        // Restore 2. Staatsangehörigkeit (combobox)
        if (originalValues.hasOwnProperty('staatsangehoerigkeit2')) {
          const nationField2 = page.getByLabel(/2\.\s*staatsangehörigkeit|zweit.*staatsangehörigkeit|second.*nationality|citizenship.*2/i).first();
          try {
            if (await nationField2.isVisible({ timeout: 500 })) {
              if (originalValues.staatsangehoerigkeit2) {
                // Original had a value: restore it by clicking and selecting
                await nationField2.click();
                await page.waitForTimeout(300);
                const options = page.getByRole('option');
                const optCount = await options.count();
                console.log(`Looking for option "${originalValues.staatsangehoerigkeit2}" among ${optCount} options`);
                let found = false;
                for (let j = 0; j < optCount; j++) {
                  const opt = options.nth(j);
                  const optText = await opt.textContent().catch(() => '');
                  if (optText && optText.toLowerCase().includes(String(originalValues.staatsangehoerigkeit2).toLowerCase())) {
                    await opt.click();
                    found = true;
                    console.log(`✓ Restored 2. Staatsangehörigkeit to "${originalValues.staatsangehoerigkeit2}"`);
                    break;
                  }
                }
                if (!found) {
                  console.log(`Could not find option for "${originalValues.staatsangehoerigkeit2}" - will skip`);
                }
              } else {
                // Original was empty: skip clearing (known UI limitation - X button not reliably clickable via automation)
                console.log('⚠ 2. Staatsangehörigkeit was originally empty - skipping clear (UI limitation)');
              }
            } else {
              console.log('2. Staatsangehörigkeit field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring 2. Staatsangehörigkeit: ${err}`);
          }
        }

        // Restore Straße
        if (originalValues.hasOwnProperty('strasse')) {
          const streetField = page.getByLabel(/straße|strasse|street/i).first();
          try {
            if (await streetField.isVisible({ timeout: 500 })) {
              await streetField.clear();
              await streetField.fill(originalValues.strasse || '');
              console.log(`✓ Restored Straße to "${originalValues.strasse}"`);
            } else {
              console.log('Straße field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Straße: ${err}`);
          }
        }

        // Restore Wohnort (combobox)
        if (originalValues.hasOwnProperty('wohnort')) {
          const townField = page.getByRole('combobox', { name: /wohnort/i }).first()
            .or(page.locator('input[role="combobox"][aria-label*="ohnort"]').first());
          try {
            if (await townField.isVisible({ timeout: 500 })) {
              await townField.click();
              await page.waitForTimeout(300);
              let found = false;
              const options = page.getByRole('option');
              const optCount = await options.count();
              console.log(`Looking for Wohnort option "${originalValues.wohnort}" among ${optCount} options`);
              for (let j = 0; j < optCount; j++) {
                const opt = options.nth(j);
                const optText = await opt.textContent().catch(() => '');
                if (optText && optText.toLowerCase().includes(String(originalValues.wohnort).toLowerCase())) {
                  await opt.click();
                  found = true;
                  console.log(`✓ Restored Wohnort to "${originalValues.wohnort}"`);
                  break;
                }
              }
              if (!found) {
                console.log(`Could not find option for Wohnort "${originalValues.wohnort}" - will skip`);
              }
            } else {
              console.log('Wohnort field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Wohnort: ${err}`);
          }
        }

        // Restore Ortsteil (combobox)
        if (originalValues.hasOwnProperty('ortsteil')) {
          const districtField = page.getByRole('combobox', { name: /ortsteil|stadtteil|bezirk/i }).first()
            .or(page.locator('input[role="combobox"][aria-label*="ortsteil"]').first());
          try {
            if (await districtField.isVisible({ timeout: 500 })) {
              await districtField.click();
              await page.waitForTimeout(300);
              let found = false;
              const options = page.getByRole('option');
              const optCount = await options.count();
              console.log(`Looking for Ortsteil option "${originalValues.ortsteil}" among ${optCount} options`);
              for (let j = 0; j < optCount; j++) {
                const opt = options.nth(j);
                const optText = await opt.textContent().catch(() => '');
                if (optText && optText.toLowerCase().includes(String(originalValues.ortsteil).toLowerCase())) {
                  await opt.click();
                  found = true;
                  console.log(`✓ Restored Ortsteil to "${originalValues.ortsteil}"`);
                  break;
                }
              }
              if (!found) {
                console.log(`Could not find option for Ortsteil "${originalValues.ortsteil}" - will skip`);
              }
            } else {
              console.log('Ortsteil field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Ortsteil: ${err}`);
          }
        }

        // Restore Telefon
        if (originalValues.hasOwnProperty('telefon')) {
          const phoneField = page.getByLabel(/telefon|phone/i).first();
          try {
            if (await phoneField.isVisible({ timeout: 500 })) {
              await phoneField.clear();
              await phoneField.fill(originalValues.telefon || '');
              console.log(`✓ Restored Telefon to "${originalValues.telefon}"`);
            } else {
              console.log('Telefon field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Telefon: ${err}`);
          }
        }

        // Restore Mobil oder Fax
        if (originalValues.hasOwnProperty('mobilOderFax')) {
          const mobileFaxField = page.getByLabel(/mobil|fax/i).first();
          try {
            if (await mobileFaxField.isVisible({ timeout: 500 })) {
              await mobileFaxField.clear();
              await mobileFaxField.fill(originalValues.mobilOderFax || '');
              console.log(`✓ Restored Mobil oder Fax to "${originalValues.mobilOderFax}"`);
            } else {
              console.log('Mobil oder Fax field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Mobil oder Fax: ${err}`);
          }
        }

        // Restore Private E-Mail-Adresse
        if (originalValues.hasOwnProperty('privateEmail')) {
          const privateEmailField = page.getByRole('textbox', { name: /private.*e-?mail|e-?mail.*privat|privat.*mail/i }).first()
            .or(page.getByLabel(/private.*e-?mail|e-?mail.*privat|privat.*mail/i).first())
            .or(page.locator('input[name*="emailPrivat"]').first());
          try {
            if (await privateEmailField.isVisible({ timeout: 500 })) {
              await privateEmailField.clear();
              await privateEmailField.fill(originalValues.privateEmail || '');
              // Trigger blur to ensure auto-save
              try { await privateEmailField.press('Tab'); } catch {}
              await page.waitForTimeout(300);
              console.log(`✓ Restored Private E-Mail-Adresse to "${originalValues.privateEmail}"`);
            } else {
              console.log('Private E-Mail-Adresse field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Private E-Mail-Adresse: ${err}`);
          }
        }

        // Restore Schulische E-Mail-Adresse
        if (originalValues.hasOwnProperty('schulEmail')) {
          const schoolEmailField = page.getByRole('textbox', { name: /schulische.*e-?mail/i }).first()
            .or(page.getByLabel(/schulische.*e-?mail|schule.*e-?mail|school.*email/i).first())
            .or(page.locator('input[name*="emailSchule"]').first());
          try {
            if (await schoolEmailField.isVisible({ timeout: 500 })) {
              await schoolEmailField.clear();
              await schoolEmailField.fill(originalValues.schulEmail || '');
              // Trigger blur to ensure auto-save
              try { await schoolEmailField.press('Tab'); } catch {}
              await page.waitForTimeout(300);
              console.log(`✓ Restored Schulische E-Mail-Adresse to "${originalValues.schulEmail}"`);
              // Verify restoration
              const currentSchoolEmail = await schoolEmailField.inputValue();
              if (String(currentSchoolEmail) === String(originalValues.schulEmail || '')) {
                console.log('✓ Verified Schulische E-Mail-Adresse restored correctly');
              } else {
                console.log(`⚠ Schulische E-Mail verification mismatch: now "${currentSchoolEmail}", expected "${originalValues.schulEmail}"`);
              }
            } else {
              console.log('Schulische E-Mail-Adresse field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Schulische E-Mail-Adresse: ${err}`);
          }
        }

        // Restore Konfession (combobox)
        if (originalValues.hasOwnProperty('konfession')) {
          const konfessionField = page.getByLabel(/konfession|religion|faith/i).first()
            .or(page.locator('input[role="combobox"][aria-label*="onfession"]').first());
          try {
            if (await konfessionField.isVisible({ timeout: 500 })) {
              if (originalValues.konfession) {
                // Original had a value: restore it by clicking and selecting
                await konfessionField.click();
                await page.waitForTimeout(300);
                const options = page.getByRole('option');
                const optCount = await options.count();
                console.log(`Looking for Konfession option "${originalValues.konfession}" among ${optCount} options`);
                let found = false;
                for (let j = 0; j < optCount; j++) {
                  const opt = options.nth(j);
                  const optText = await opt.textContent().catch(() => '');
                  if (optText && optText.toLowerCase().includes(String(originalValues.konfession).toLowerCase())) {
                    await opt.click();
                    found = true;
                    console.log(`✓ Restored Konfession to "${originalValues.konfession}"`);
                    break;
                  }
                }
                if (!found) {
                  console.log(`Could not find option for Konfession "${originalValues.konfession}" - will skip`);
                }
              } else {
                // Original was empty: skip clearing (known UI limitation)
                console.log('⚠ Konfession was originally empty - skipping clear (UI limitation)');
              }
            } else {
              console.log('Konfession field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Konfession: ${err}`);
          }
        }

        // Restore Konfession aufs Zeugnis (checkbox)
        if (originalValues.hasOwnProperty('konfessionAufsZeugnis')) {
          const konfessionAufsZeugnisField = page.getByLabel(/konfession.*zeugnis|zeugnis.*konfession/i).first()
            .or(page.locator('input[type="checkbox"][aria-label*="onfession"]').first());
          try {
            if (await konfessionAufsZeugnisField.isVisible({ timeout: 500 })) {
              const isCurrentlyChecked = await konfessionAufsZeugnisField.isChecked();
              const shouldBeChecked = originalValues.konfessionAufsZeugnis || false;
              if (isCurrentlyChecked !== shouldBeChecked) {
                await konfessionAufsZeugnisField.click();
                console.log(`✓ Restored Konfession aufs Zeugnis to ${shouldBeChecked}`);
              } else {
                console.log(`Konfession aufs Zeugnis already ${shouldBeChecked} - no change needed`);
              }
            } else {
              console.log('Konfession aufs Zeugnis field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Konfession aufs Zeugnis: ${err}`);
          }
        }

        // Restore Abmeldung vom Religionsunterricht (date field)
        if (originalValues.hasOwnProperty('abmeldungReligion')) {
          const abmeldungReligionField = page.getByLabel(/abmeldung.*religion|religion.*abmeldung/i).first()
            .or(page.locator('input[type="date"][aria-label*="bmel"]').first());
          try {
            if (await abmeldungReligionField.isVisible({ timeout: 500 })) {
              if (originalValues.abmeldungReligion) {
                await abmeldungReligionField.clear();
                await abmeldungReligionField.fill(originalValues.abmeldungReligion);
                console.log(`✓ Restored Abmeldung vom Religionsunterricht to "${originalValues.abmeldungReligion}"`);
              } else {
                await abmeldungReligionField.clear();
                console.log(`✓ Cleared Abmeldung vom Religionsunterricht (was originally empty)`);
              }
            } else {
              console.log('Abmeldung vom Religionsunterricht field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Abmeldung vom Religionsunterricht: ${err}`);
          }
        }

        // Restore Wiederanmeldung (date field)
        if (originalValues.hasOwnProperty('wiederanmeldung')) {
          const wiederanmeldungField = page.getByLabel(/wiederanmeldung|re-?registration/i).first()
            .or(page.locator('input[type="date"][aria-label*="ieder"]').first());
          try {
            if (await wiederanmeldungField.isVisible({ timeout: 500 })) {
              if (originalValues.wiederanmeldung) {
                await wiederanmeldungField.clear();
                await wiederanmeldungField.fill(originalValues.wiederanmeldung);
                console.log(`✓ Restored Wiederanmeldung to "${originalValues.wiederanmeldung}"`);
              } else {
                await wiederanmeldungField.clear();
                console.log(`✓ Cleared Wiederanmeldung (was originally empty)`);
              }
            } else {
              console.log('Wiederanmeldung field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Wiederanmeldung: ${err}`);
          }
        }

        // Only restore dependent fields if they originally had values (meaning parent was checked)
        // Note: Migrationshintergrund vorhanden will be restored AFTER these fields to avoid disabling them
        const shouldRestoreDependentFields = originalValues.zuzugsjahr || originalValues.geburtsland || 
                                             originalValues.geburtslandMutter || originalValues.geburtslandVater || 
                                             originalValues.verkehrssprache;

        if (shouldRestoreDependentFields) {
          // Restore Zuzugsjahr (text field)
          if (originalValues.hasOwnProperty('zuzugsjahr')) {
            const zuzugsjahrField = page.getByLabel(/zuzugsjahr|year.*of.*move/i).first()
              .or(page.locator('input[type="text"][aria-label*="uzugs"]').first());
            try {
              if (await zuzugsjahrField.isVisible({ timeout: 500 })) {
                await zuzugsjahrField.clear();
                if (originalValues.zuzugsjahr) {
                  await zuzugsjahrField.fill(originalValues.zuzugsjahr);
                }
                console.log(`✓ Restored Zuzugsjahr to "${originalValues.zuzugsjahr}"`);
              } else {
                console.log('Zuzugsjahr field not visible for restore');
              }
            } catch (err) {
              console.log(`Error restoring Zuzugsjahr: ${err}`);
            }
          }

          // Restore Geburtsland (combobox)
          if (originalValues.hasOwnProperty('geburtsland')) {
            const geburtslandField = page.getByLabel(/geburtsland(?!.*mutter|.*vater)|birth.*country(?!.*mother|.*father)/i).first()
              .or(page.locator('input[role="combobox"][aria-label*="eburtsland"]').first());
            try {
              if (await geburtslandField.isVisible({ timeout: 500 })) {
                if (originalValues.geburtsland) {
                  await geburtslandField.click();
                  await page.waitForTimeout(300);
                  const options = page.getByRole('option');
                  const optCount = await options.count();
                  let found = false;
                  for (let j = 0; j < optCount; j++) {
                    const opt = options.nth(j);
                    const optText = await opt.textContent().catch(() => '');
                    if (optText && optText.toLowerCase().includes(String(originalValues.geburtsland).toLowerCase())) {
                      await opt.click();
                      found = true;
                      console.log(`✓ Restored Geburtsland to "${originalValues.geburtsland}"`);
                      break;
                    }
                  }
                  if (!found) {
                    console.log(`Could not find Geburtsland option "${originalValues.geburtsland}"`);
                  }
                }
              } else {
                console.log('Geburtsland field not visible for restore');
              }
            } catch (err) {
              console.log(`Error restoring Geburtsland: ${err}`);
            }
          }

          // Restore Geburtsland Mutter (combobox)
          if (originalValues.hasOwnProperty('geburtslandMutter')) {
            const geburtslandMutterField = page.getByLabel(/geburtsland.*mutter|mutter.*geburtsland/i).first()
              .or(page.locator('input[role="combobox"][aria-label*="utter"]').first());
            try {
              if (await geburtslandMutterField.isVisible({ timeout: 500 })) {
                if (originalValues.geburtslandMutter) {
                  await geburtslandMutterField.click();
                  await page.waitForTimeout(300);
                  const options = page.getByRole('option');
                  const optCount = await options.count();
                  let found = false;
                  for (let j = 0; j < optCount; j++) {
                    const opt = options.nth(j);
                    const optText = await opt.textContent().catch(() => '');
                    if (optText && optText.toLowerCase().includes(String(originalValues.geburtslandMutter).toLowerCase())) {
                      await opt.click();
                      found = true;
                      console.log(`✓ Restored Geburtsland Mutter to "${originalValues.geburtslandMutter}"`);
                      break;
                    }
                  }
                  if (!found) {
                    console.log(`Could not find Geburtsland Mutter option "${originalValues.geburtslandMutter}"`);
                  }
                }
              } else {
                console.log('Geburtsland Mutter field not visible for restore');
              }
            } catch (err) {
              console.log(`Error restoring Geburtsland Mutter: ${err}`);
            }
          }

          // Restore Geburtsland Vater (combobox)
          if (originalValues.hasOwnProperty('geburtslandVater')) {
            const geburtslandVaterField = page.getByLabel(/geburtsland.*vater|vater.*geburtsland/i).first()
              .or(page.locator('input[role="combobox"][aria-label*="ater"]').first());
            try {
              if (await geburtslandVaterField.isVisible({ timeout: 500 })) {
                if (originalValues.geburtslandVater) {
                  await geburtslandVaterField.click();
                  await page.waitForTimeout(300);
                  const options = page.getByRole('option');
                  const optCount = await options.count();
                  let found = false;
                  for (let j = 0; j < optCount; j++) {
                    const opt = options.nth(j);
                    const optText = await opt.textContent().catch(() => '');
                    if (optText && optText.toLowerCase().includes(String(originalValues.geburtslandVater).toLowerCase())) {
                      await opt.click();
                      found = true;
                      console.log(`✓ Restored Geburtsland Vater to "${originalValues.geburtslandVater}"`);
                      break;
                    }
                  }
                  if (!found) {
                    console.log(`Could not find Geburtsland Vater option "${originalValues.geburtslandVater}"`);
                  }
                }
              } else {
                console.log('Geburtsland Vater field not visible for restore');
              }
            } catch (err) {
              console.log(`Error restoring Geburtsland Vater: ${err}`);
            }
          }

          // Restore Verkehrssprache (combobox)
          if (originalValues.hasOwnProperty('verkehrssprache')) {
            const verkehrsspracheField = page.getByLabel(/verkehrssprache|language.*spoken/i).first()
              .or(page.locator('input[role="combobox"][aria-label*="erkehrssprache"]').first());
            try {
              if (await verkehrsspracheField.isVisible({ timeout: 500 })) {
                if (originalValues.verkehrssprache) {
                  await verkehrsspracheField.click();
                  await page.waitForTimeout(300);
                  const options = page.getByRole('option');
                  const optCount = await options.count();
                  let found = false;
                  for (let j = 0; j < optCount; j++) {
                    const opt = options.nth(j);
                    const optText = await opt.textContent().catch(() => '');
                    if (optText && optText.toLowerCase().includes(String(originalValues.verkehrssprache).toLowerCase())) {
                      await opt.click();
                      found = true;
                      console.log(`✓ Restored Verkehrssprache to "${originalValues.verkehrssprache}"`);
                      break;
                    }
                  }
                  if (!found) {
                    console.log(`Could not find Verkehrssprache option "${originalValues.verkehrssprache}"`);
                  }
                }
              } else {
                console.log('Verkehrssprache field not visible for restore');
              }
            } catch (err) {
              console.log(`Error restoring Verkehrssprache: ${err}`);
            }
          }
        }

        // Now restore Migrationshintergrund vorhanden AFTER dependent fields (so they won't be disabled)
        if (originalValues.hasOwnProperty('migrationshintergrundVorhanden')) {
          const migrationshintergrundField = page.getByLabel(/migrationshintergrund.*vorhanden|vorhanden.*migrationshintergrund/i).first()
            .or(page.locator('input[type="checkbox"][aria-label*="igrationshintergrund"]').first());
          try {
            if (await migrationshintergrundField.isVisible({ timeout: 500 })) {
              const isCurrentlyChecked = await migrationshintergrundField.isChecked();
              const shouldBeChecked = originalValues.migrationshintergrundVorhanden || false;
              if (isCurrentlyChecked !== shouldBeChecked) {
                await migrationshintergrundField.click();
                console.log(`✓ Restored Migrationshintergrund vorhanden to ${shouldBeChecked}`);
              } else {
                console.log(`Migrationshintergrund vorhanden already ${shouldBeChecked} - no change needed`);
              }
            } else {
              console.log('Migrationshintergrund vorhanden field not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Migrationshintergrund vorhanden: ${err}`);
          }
        }
        
        // Restore Weitere Telefonnummern modal values
        if (originalValues.hasOwnProperty('weitereTelefonNummer') || 
            originalValues.hasOwnProperty('weitereTelefonArt') ||
            originalValues.hasOwnProperty('weitereTelefonBemerkung') ||
            originalValues.hasOwnProperty('weitereTelefonGesperrt')) {
          
          try {
            // Find the "Weitere Telefonnummern" section
            const weitereTelefonSection = page.getByText(/Weitere Telefonnummern/i).first();
            
            if (await weitereTelefonSection.isVisible({ timeout: 1000 })) {
              const sectionContainer = weitereTelefonSection.locator('xpath=ancestor::*[self::div or self::section][1]');
              const phoneEntries = sectionContainer.locator('button, a, li, [role="button"]').filter({ 
                hasText: /\d{3,}|mobil|festnetz|privat|geschäftlich|test/i 
              });
              
              const phoneCount = await phoneEntries.count();
              
              if (phoneCount > 0) {
                const firstEntry = phoneEntries.first();
                await firstEntry.click();
                await page.waitForTimeout(500);
                
                const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
                
                if (await modal.isVisible({ timeout: 2000 })) {
                  console.log('Restoring Weitere Telefonnummern values...');
                  
                  // Restore Telefonart
                  if (originalValues.hasOwnProperty('weitereTelefonArt') && originalValues.weitereTelefonArt) {
                    const telefonartField = modal.getByLabel(/Telefonart|phone.*type/i).first()
                      .or(modal.locator('input[role="combobox"]').first());
                    
                    if (await telefonartField.isVisible({ timeout: 500 })) {
                      await telefonartField.click();
                      await page.waitForTimeout(300);
                      
                      const options = page.getByRole('option');
                      const optCount = await options.count();
                      let found = false;
                      
                      for (let j = 0; j < optCount; j++) {
                        const opt = options.nth(j);
                        const optText = await opt.textContent().catch(() => '');
                        if (optText && optText.toLowerCase().includes(String(originalValues.weitereTelefonArt).toLowerCase())) {
                          await opt.click();
                          found = true;
                          console.log(`✓ Restored Telefonart to "${originalValues.weitereTelefonArt}"`);
                          break;
                        }
                      }
                      
                      if (!found) {
                        console.log(`Could not find Telefonart option "${originalValues.weitereTelefonArt}"`);
                      }
                    }
                  }
                  
                  // Restore Telefonnummer
                  if (originalValues.hasOwnProperty('weitereTelefonNummer')) {
                    const telefonnummerField = modal.getByLabel(/Telefonnummer|phone.*number/i).first()
                      .or(modal.locator('input[type="text"]').filter({ hasText: /nummer/i }).first());
                    
                    if (await telefonnummerField.isVisible({ timeout: 500 })) {
                      await telefonnummerField.clear();
                      if (originalValues.weitereTelefonNummer) {
                        await telefonnummerField.fill(originalValues.weitereTelefonNummer);
                      }
                      console.log(`✓ Restored Telefonnummer to "${originalValues.weitereTelefonNummer}"`);
                    }
                  }
                  
                  // Restore Bemerkung
                  if (originalValues.hasOwnProperty('weitereTelefonBemerkung')) {
                    const bemerkungField = modal.getByLabel(/Bemerkung|note|comment/i).first()
                      .or(modal.locator('input[type="text"], textarea').filter({ hasText: /bemerkung/i }).first());
                    
                    if (await bemerkungField.isVisible({ timeout: 500 })) {
                      await bemerkungField.clear();
                      if (originalValues.weitereTelefonBemerkung) {
                        await bemerkungField.fill(originalValues.weitereTelefonBemerkung);
                      }
                      console.log(`✓ Restored Bemerkung to "${originalValues.weitereTelefonBemerkung}"`);
                    }
                  }
                  
                  // Restore Gesperrt checkbox
                  if (originalValues.hasOwnProperty('weitereTelefonGesperrt')) {
                    const gesperrtCheckbox = modal.getByLabel(/gesperrt|blocked|locked/i).first()
                      .or(modal.locator('input[type="checkbox"]').first());
                    
                    if (await gesperrtCheckbox.isVisible({ timeout: 500 })) {
                      const isCurrentlyChecked = await gesperrtCheckbox.isChecked();
                      const shouldBeChecked = originalValues.weitereTelefonGesperrt || false;
                      
                      if (isCurrentlyChecked !== shouldBeChecked) {
                        await gesperrtCheckbox.click();
                        console.log(`✓ Restored Gesperrt to ${shouldBeChecked}`);
                      } else {
                        console.log(`Gesperrt already ${shouldBeChecked} - no change needed`);
                      }
                    }
                  }
                  
                  // Click Speichern button
                  const speichernButton = modal.getByRole('button', { name: /Speichern|Save/i }).first()
                    .or(modal.locator('button').filter({ hasText: /Speichern|Save/i }).first());
                  
                  if (await speichernButton.isVisible({ timeout: 1000 })) {
                    await speichernButton.click();
                    console.log('✓ Saved Weitere Telefonnummern changes');
                    await page.waitForTimeout(1000);
                  }
                }
              } else {
                console.log('No phone entries found to restore');
              }
            } else {
              console.log('Weitere Telefonnummern section not visible for restore');
            }
          } catch (err) {
            console.log(`Error restoring Weitere Telefonnummern: ${err}`);
          }
        }
        
        // Auto-save should trigger, wait a bit
        // Explicit save (UI sometimes stays in edit mode without autosaving)
        const saveCandidates = [
          page.getByRole('button', { name: /speichern|save|ok/i }).first(),
          page.locator('button').filter({ hasText: /speichern|save|ok/i }).first(),
          page.locator('button[type="submit"]').first(),
        ];
        let saved = false;
        for (const candidate of saveCandidates) {
          if (await candidate.isVisible({ timeout: 1200 }).catch(() => false)) {
            console.log('Save button found during reset, clicking...');
            await candidate.click({ trial: false }).catch(() => {});
            await page.waitForTimeout(1200);
            saved = true;
            break;
          }
        }
        if (!saved) {
          console.log('Save button not found during reset - relying on autosave');
          // Try Ctrl+S as a fallback to trigger form save shortcuts
          await page.keyboard.press('Control+S').catch(() => {});
          await page.waitForTimeout(800);
        }

        // Verify Nachname restored after save by re-reading field (best-effort)
        try {
          const nachnameFieldVerify = page.getByLabel(/nachname|lastname/i).first();
          if (await nachnameFieldVerify.isVisible({ timeout: 800 })) {
            const currentNachname = await nachnameFieldVerify.inputValue();
            if (String(currentNachname) !== String(originalValues.nachname || '')) {
              console.log(`⚠ Nachname verification mismatch after reset: now "${currentNachname}", expected "${originalValues.nachname}"`);
            } else {
              console.log('✓ Nachname verified after reset');
            }
          }
        } catch {}

        // Allow any debounced autosave to finish
        await page.waitForTimeout(800);
        console.log('Test data reset completed successfully');
    } else {
      console.log('No test students found to reset');
    }
  } catch (error) {
    console.log(`Reset failed: ${error}`);
  }
}

/**
 * Alternative: Use database direct access for seeding/resetting
 * This would require database connection details
 */
export async function resetDatabaseDirectly() {
  // TODO: Implement direct database operations
  // This could use a database client library to:
  // 1. Connect to svwse2e database
  // 2. Reset specific tables
  // 3. Insert known test data
  console.log('Direct database reset not implemented yet');
}

/**
 * Alternative: Use test-specific data that doesn't interfere
 * Each test uses unique data identifiers
 */
export function generateUniqueTestData(testName: string): TestStudent {
  const timestamp = Date.now();
  return {
    nachname: `Test_${testName}_${timestamp}`,
    rufname: 'Test',
    alleVornamen: 'Test User',
    geschlecht: 'w',
    geburtsdatum: '2000-01-01'
  };
}