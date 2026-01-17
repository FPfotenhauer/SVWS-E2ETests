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