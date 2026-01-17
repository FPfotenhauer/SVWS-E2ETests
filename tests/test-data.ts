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
    
    // Look for any student with "Testname-" in the name
    const testNamePattern = 'Testname-';
    const rows = page.locator('[role="row"]');
    const count = await rows.count();
    
    let foundTestStudent = false;
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
        
        // Auto-save should trigger, wait a bit
        await page.waitForTimeout(1000);
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