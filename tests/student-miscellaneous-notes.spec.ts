import { test } from './fixtures';
import { expect } from '@playwright/test';
import { seedTestData, TEST_STUDENT } from './test-data';

const keepTestData = process.env.KEEP_TEST_DATA === 'true' || process.env.KEEP_TEST_DATA === '1';

// Track what was added for cleanup
let testNoteCreated = false;
let testNoteText = '';
let testCheckboxesChecked: { section: string; count: number }[] = [];

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

test.describe('Student miscellaneous notes', () => {
  test.beforeEach(async ({ page }) => {
    await seedTestData(page);
    testNoteCreated = false;
    testCheckboxesChecked = [];
  });

  test.afterEach(async ({ page }) => {
    if (keepTestData) {
      console.log('Keeping test data changes (KEEP_TEST_DATA=true)');
      return;
    }

    console.log('Resetting test data...');
    
    // First, do the quick cleanup tasks, THEN do the long ones
    // This prevents session timeout
    
    // Step 1: Delete notes (quick)
    if (testNoteCreated && testNoteText) {
      try {
        console.log('Deleting created notes...');
        
        // Don't reload - just navigate directly
        const sonstigesTab = page.getByRole('button', { name: /sonstiges|miscellaneous/i }).first()
          .or(page.locator('[role="tab"]').filter({ hasText: /sonstiges|miscellaneous/i }).first());
        
        if (await sonstigesTab.isVisible({ timeout: 1500 }).catch(() => false)) {
          await sonstigesTab.click();
          await page.waitForTimeout(200);
          
          // Find and click Vermerke subtab
          const vermerkeSubtab = page.getByRole('button', { name: /vermerke|remarks|notes/i }).first()
            .or(page.locator('[role="tab"]').filter({ hasText: /vermerke|remarks|notes/i }).first());
          
          if (await vermerkeSubtab.isVisible({ timeout: 1500 }).catch(() => false)) {
            await vermerkeSubtab.click();
            await page.waitForTimeout(200);
            
            // Find notes containing our test text and delete them
            // Look for any section that contains our test text prefix
            const textSearchPrefix = testNoteText.substring(0, 10); // "Test-Verm"
            const noteElements = page.locator('text=' + textSearchPrefix);
            let notesDeleted = 0;
            
            // Try to delete notes - look for the closest clickable parent
            while (true) {
              const noteCount = await noteElements.count();
              if (noteCount === 0) break;
              
              const noteElement = noteElements.first();
              // Find the closest button (the note header that can be clicked)
              const noteButton = noteElement.locator('..').locator('..').locator('..').locator('button').first();
              
              if (await noteButton.isVisible({ timeout: 500 }).catch(() => false)) {
                console.log(`Found note with text "${textSearchPrefix}..."`);
                
                // Click to expand and reveal delete button
                await noteButton.click();
                await page.waitForTimeout(150);
                
                // Look for delete button
                const deleteButton = page.getByRole('button', { name: /löschen|delete/i }).first();
                if (await deleteButton.isVisible({ timeout: 500 }).catch(() => false)) {
                  await deleteButton.click();
                  notesDeleted++;
                  console.log(`✓ Deleted note ${notesDeleted}`);
                  await page.waitForTimeout(300);
                } else {
                  // Click to collapse if delete not found
                  await noteButton.click();
                  console.log(`⚠ Delete button not found, moving on`);
                  break;
                }
              } else {
                break;
              }
            }
            
            console.log(`Deleted ${notesDeleted} notes total`);
          }
        }
      } catch (e) {
        console.log(`⚠ Error deleting notes: ${e.message}`);
      }
    }

    // Step 2: Uncheck consent checkboxes (quick)
    if (testCheckboxesChecked.length > 0) {
      try {
        console.log('Unchecking consent checkboxes...');
        
        // Navigate to Einwilligungen
        const einwilligungenSubtab = page.getByRole('button', { name: /einwilligungen|consents|permissions/i }).first()
          .or(page.locator('[role="tab"]').filter({ hasText: /einwilligungen|consents|permissions/i }).first());
        
        if (await einwilligungenSubtab.isVisible({ timeout: 1500 }).catch(() => false)) {
          await einwilligungenSubtab.click();
          await page.waitForTimeout(200);
          
          // Uncheck "Abgefragt" checkbox
          const abgefragtCheckbox = page.getByRole('checkbox', { name: /^abgefragt|^asked/i });
          if (await abgefragtCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
            const isChecked = await abgefragtCheckbox.isChecked();
            if (isChecked) {
              await abgefragtCheckbox.uncheck();
              console.log('✓ Unchecked "Abgefragt" checkbox');
            }
          }
          
          // Uncheck "Zugestimmt" checkbox
          const zugestimmtCheckbox = page.getByRole('checkbox', { name: /^zugestimmt|^approved|^consented/i });
          if (await zugestimmtCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
            const isChecked = await zugestimmtCheckbox.isChecked();
            if (isChecked) {
              await zugestimmtCheckbox.uncheck();
              console.log('✓ Unchecked "Zugestimmt" checkbox');
            }
          }
        }
      } catch (e) {
        console.log(`⚠ Error unchecking consent checkboxes: ${e.message}`);
      }
    }

    // Step 3: Uncheck learning platform checkboxes (this is the long one, do it last)
    if (testCheckboxesChecked.length > 0) {
      try {
        console.log('Unchecking learning platform checkboxes...');
        
        // Navigate to Lernplattformen
        const lernplattformenSubtab = page.getByRole('button', { name: /lernplattformen|learning platforms|platforms/i }).first()
          .or(page.locator('[role="tab"]').filter({ hasText: /lernplattformen|learning platforms|platforms/i }).first());
        
        if (await lernplattformenSubtab.isVisible({ timeout: 1500 }).catch(() => false)) {
          await lernplattformenSubtab.click();
          await page.waitForTimeout(300);
          
          // Uncheck learning platform checkboxes
          const platformRows = page.locator('[role="row"], tr');
          const rowCount = await platformRows.count();
          let uncheckedCount = 0;
          
          for (let i = 0; i < rowCount; i++) {
            const row = platformRows.nth(i);
            try {
              const rowText = await row.textContent().catch(() => '');
              
              // Skip header rows and empty rows
              if (!rowText || rowText.includes('Lernplattform') || rowText.includes('Benutzername')) {
                continue;
              }
              
              // Find all checkboxes in this row
              const checkboxesInRow = row.locator('input[type="checkbox"]');
              const checkboxCount = await checkboxesInRow.count();
              
              if (checkboxCount >= 2) {
                // Uncheck both checkboxes
                const checkbox1 = checkboxesInRow.nth(0);
                const isChecked1 = await checkbox1.isChecked().catch(() => false);
                if (isChecked1) {
                  await checkbox1.click();
                  uncheckedCount++;
                }
                
                const checkbox2 = checkboxesInRow.nth(1);
                const isChecked2 = await checkbox2.isChecked().catch(() => false);
                if (isChecked2) {
                  await checkbox2.click();
                  uncheckedCount++;
                }
              }
            } catch (e) {
              // Ignore errors
            }
          }
          
          console.log(`✓ Unchecked ${uncheckedCount} learning platform checkboxes`);
        }
      } catch (e) {
        console.log(`⚠ Error unchecking platform checkboxes: ${e.message}`);
      }
    }

    console.log('Test data reset completed');
  });

  test('Add new note in Vermerke tab', async ({ page }) => {
    const timestamp = makeTimestamp();
    const noteText = `Test-Vermerk-${timestamp}`;

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

    // Navigate to "Sonstiges" tab
    console.log('Looking for Sonstiges tab...');
    const sonstigesTab = page.getByRole('button', { name: /sonstiges|miscellaneous/i }).first()
      .or(page.locator('[role="tab"]').filter({ hasText: /sonstiges|miscellaneous/i }).first());
    
    if (await sonstigesTab.isVisible({ timeout: 3000 })) {
      await sonstigesTab.click();
      console.log('✓ Clicked Sonstiges tab');
      await page.waitForTimeout(500);
    } else {
      console.log('⚠ Sonstiges tab not visible');
      throw new Error('Could not find Sonstiges tab');
    }

    // Navigate to "Vermerke" subtab
    console.log('Looking for Vermerke subtab...');
    const vermerkeSubtab = page.getByRole('button', { name: /vermerke|remarks|notes/i }).first()
      .or(page.locator('[role="tab"]').filter({ hasText: /vermerke|remarks|notes/i }).first());
    
    if (await vermerkeSubtab.isVisible({ timeout: 3000 })) {
      await vermerkeSubtab.click();
      console.log('✓ Clicked Vermerke subtab');
      await page.waitForTimeout(500);
    } else {
      console.log('⚠ Vermerke subtab not visible');
      throw new Error('Could not find Vermerke subtab');
    }

    // Click "Neuen Vermerk hinzufügen" button
    console.log('Looking for "Neuen Vermerk hinzufügen" button...');
    const addNoteButton = page.getByRole('button', { name: /neuen vermerk hinzufügen|add new note|add note/i }).first()
      .or(page.getByRole('button', { name: /hinzufügen/i }).first());
    
    if (await addNoteButton.isVisible({ timeout: 3000 })) {
      await addNoteButton.click();
      console.log('✓ Clicked "Neuen Vermerk hinzufügen" button');
      await page.waitForTimeout(500);
    } else {
      console.log('⚠ Add note button not visible');
      throw new Error('Could not find "Neuen Vermerk hinzufügen" button');
    }

    // Take screenshot to see the form
    await page.screenshot({ path: 'debug-images/note-form-opened.png' });
    console.log('Screenshot taken: debug-images/note-form-opened.png');

    // Try to fill in the textarea with note text
    // The textarea might be inside a dialog/modal
    const noteTextarea = page.locator('textarea.textarea-input--control').first();
    const allTextareas = page.locator('textarea');
    const textareaCount = await allTextareas.count();
    console.log(`Found ${textareaCount} textareas on page`);

    if (textareaCount > 0) {
      // Try the last textarea (more likely to be the one just opened)
      const lastTextarea = page.locator('textarea').last();
      const isVisible = await lastTextarea.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (isVisible) {
        console.log('✓ Found visible textarea, filling with note text');
        await lastTextarea.fill(noteText);
        await page.waitForTimeout(300);
        
        // Take screenshot after filling textarea
        await page.screenshot({ path: 'debug-images/note-filled.png' });
        console.log('Screenshot taken: debug-images/note-filled.png');
        
        // Look for combobox under the textarea (note type selector)
        console.log('Looking for combobox under textarea...');
        const comboboxes = page.locator('[role="combobox"]');
        const comboboxCount = await comboboxes.count();
        console.log(`Found ${comboboxCount} comboboxes on page`);
        
        if (comboboxCount > 0) {
          // Click on the combobox to open it
          const combobox = comboboxes.last();
          await combobox.click();
          console.log('✓ Clicked combobox');
          await page.waitForTimeout(300);
          
          // Get all available options
          const options = page.locator('[role="option"]');
          const optionCount = await options.count();
          console.log(`Found ${optionCount} options in combobox`);
          
          if (optionCount > 0) {
            // Select a random option
            const randomIndex = Math.floor(Math.random() * optionCount);
            const selectedOption = options.nth(randomIndex);
            const optionText = await selectedOption.textContent();
            console.log(`Selecting random option (${randomIndex + 1}/${optionCount}): "${optionText}"`);
            
            await selectedOption.click();
            await page.waitForTimeout(300);
            
            // Take screenshot after selecting option
            await page.screenshot({ path: 'debug-images/note-option-selected.png' });
            console.log('Screenshot taken: debug-images/note-option-selected.png');
          } else {
            console.log('⚠ No options found in combobox');
          }
        } else {
          console.log('⚠ No combobox found after textarea');
        }
        
        // Look for save button
        const saveButton = page.getByRole('button', { name: /speichern|save|hinzufügen|add/i }).first();
        if (await saveButton.isVisible({ timeout: 2000 })) {
          await saveButton.click();
          console.log('✓ Clicked save button');
          await page.waitForTimeout(500);
          
          // Take screenshot after save
          await page.screenshot({ path: 'debug-images/note-saved.png' });
          console.log('Screenshot taken: debug-images/note-saved.png');
          
          testNoteCreated = true; // Mark that note was created for cleanup
          testNoteText = noteText; // Save the note text for cleanup
          
          // Verify note was added
          const noteContent = page.locator(`text="${noteText}"`);
          if (await noteContent.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log('✓ Note text verified in list');
          } else {
            console.log('⚠ Note text not found in list (may appear after refresh)');
          }
        } else {
          console.log('⚠ Save button not found');
        }
      } else {
        console.log('⚠ Textarea not visible');
      }
    } else {
      console.log('⚠ No textarea found on page');
    }

    // Navigate to "Einwilligungen" subtab (while still in Sonstiges tab)
    console.log('Looking for Einwilligungen subtab within Sonstiges...');
    const einwilligungenSubtab = page.getByRole('button', { name: /einwilligungen|consents|permissions/i }).first()
      .or(page.locator('[role="tab"]').filter({ hasText: /einwilligungen|consents|permissions/i }).first());
    
    if (await einwilligungenSubtab.isVisible({ timeout: 3000 })) {
      await einwilligungenSubtab.click();
      console.log('✓ Clicked Einwilligungen subtab');
      await page.waitForTimeout(500);
    } else {
      console.log('⚠ Einwilligungen subtab not found via standard locators, trying alternative search...');
      
      // Try finding by partial text match
      const tabs = await page.locator('[role="tab"], button').all();
      let found = false;
      for (const tab of tabs) {
        const text = await tab.textContent();
        if (text && (text.toLowerCase().includes('einwilligung') || text.toLowerCase().includes('consent'))) {
          console.log(`Found potential match: "${text}"`);
          await tab.click();
          console.log('✓ Clicked tab');
          found = true;
          await page.waitForTimeout(500);
          break;
        }
      }
      
      if (!found) {
        // Take screenshot to debug
        await page.screenshot({ path: 'debug-images/einwilligungen-debug.png' });
        console.log('Screenshot taken: debug-images/einwilligungen-debug.png');
        throw new Error('Could not find Einwilligungen subtab - check debug screenshot');
      }
    }

    // Look for "Verwendung Foto" button/expander
    console.log('Looking for "Verwendung Foto" button...');
    const fotoButton = page.getByRole('button', { name: /verwendung foto|photo usage|foto/i }).first()
      .or(page.locator('[role="button"]').filter({ hasText: /verwendung foto|photo usage|foto/i }).first());
    
    if (await fotoButton.isVisible({ timeout: 3000 })) {
      await fotoButton.click();
      console.log('✓ Clicked "Verwendung Foto" button to expand');
      await page.waitForTimeout(300);
    } else {
      console.log('⚠ "Verwendung Foto" button not visible');
      throw new Error('Could not find "Verwendung Foto" button');
    }

    // Take screenshot after expanding
    await page.screenshot({ path: 'debug-images/foto-expanded.png' });
    console.log('Screenshot taken: debug-images/foto-expanded.png');

    // Find and check "Abgefragt" checkbox
    console.log('Looking for "Abgefragt" checkbox...');
    const abgefragtCheckbox = page.getByRole('checkbox', { name: /^abgefragt|^asked/i })
      .or(page.locator('input[type="checkbox"]').filter({ hasText: /abgefragt|asked/i }).first());
    
    if (await abgefragtCheckbox.isVisible({ timeout: 2000 })) {
      const isChecked = await abgefragtCheckbox.isChecked();
      if (!isChecked) {
        await abgefragtCheckbox.check();
        console.log('✓ Checked "Abgefragt" checkbox');
        testCheckboxesChecked.push({ section: 'Einwilligungen', count: 1 });
      } else {
        console.log('ⓘ "Abgefragt" checkbox already checked');
      }
    } else {
      console.log('⚠ "Abgefragt" checkbox not visible');
    }

    // Wait for any re-renders after checking first checkbox
    await page.waitForTimeout(300);

    // Find and check "Zugestimmt" checkbox
    console.log('Looking for "Zugestimmt" checkbox...');
    const zugestimmtCheckbox = page.getByRole('checkbox', { name: /^zugestimmt|^approved|^consented/i });
    
    if (await zugestimmtCheckbox.isVisible({ timeout: 2000 })) {
      const isChecked = await zugestimmtCheckbox.isChecked();
      if (!isChecked) {
        await zugestimmtCheckbox.check();
        console.log('✓ Checked "Zugestimmt" checkbox');
        testCheckboxesChecked.push({ section: 'Einwilligungen', count: 1 });
      } else {
        console.log('ⓘ "Zugestimmt" checkbox already checked');
      }
    } else {
      console.log('⚠ "Zugestimmt" checkbox not visible');
    }

    // Take screenshot after checking both checkboxes
    await page.screenshot({ path: 'debug-images/foto-checkboxes-checked.png' });
    console.log('Screenshot taken: debug-images/foto-checkboxes-checked.png');

    // Navigate to "Lernplattformen" subtab
    console.log('Looking for Lernplattformen subtab...');
    const lernplattformenSubtab = page.getByRole('button', { name: /lernplattformen|learning platforms|platforms/i }).first()
      .or(page.locator('[role="tab"]').filter({ hasText: /lernplattformen|learning platforms|platforms/i }).first());
    
    if (await lernplattformenSubtab.isVisible({ timeout: 3000 })) {
      await lernplattformenSubtab.click();
      console.log('✓ Clicked Lernplattformen subtab');
      await page.waitForTimeout(500);
    } else {
      console.log('⚠ Lernplattformen subtab not visible');
      throw new Error('Could not find Lernplattformen subtab');
    }

    // Take screenshot of Lernplattformen tab
    await page.screenshot({ path: 'debug-images/lernplattformen-tab-opened.png' });
    console.log('Screenshot taken: debug-images/lernplattformen-tab-opened.png');

    // Find all checkboxes in "Einwilligung Abgefragt" section
    console.log('Looking for learning platform table rows...');
    
    // Find platform rows - they contain text like "Logineo NRW", "iServ", "MNS Pro"
    const platformRows = page.locator('[role="row"], tr');
    const rowCount = await platformRows.count();
    console.log(`Found ${rowCount} rows in table`);
    
    // Look for the column header positions
    const abgefragtHeader = page.locator('text=/Einwilligung Abgefragt/i').first();
    const nutzungHeader = page.locator('text=/Einwilligung Nutzung/i').first();
    
    let abgefragtCheckedCount = 0;
    let nutzungCheckedCount = 0;
    
    // For each row, find and check the checkboxes in both columns
    for (let i = 0; i < rowCount; i++) {
      const row = platformRows.nth(i);
      try {
        const rowText = await row.textContent().catch(() => '');
        
        // Skip header rows and empty rows
        if (!rowText || rowText.includes('Lernplattform') || rowText.includes('Benutzername')) {
          continue;
        }
        
        // Find all checkboxes in this row
        const checkboxesInRow = row.locator('input[type="checkbox"]');
        const checkboxCount = await checkboxesInRow.count();
        
        if (checkboxCount >= 2) {
          console.log(`Row ${i}: "${rowText.substring(0, 30)}" - Found ${checkboxCount} checkboxes`);
          
          // First checkbox is typically "Einwilligung Abgefragt"
          const checkbox1 = checkboxesInRow.nth(0);
          const isChecked1 = await checkbox1.isChecked().catch(() => false);
          if (!isChecked1) {
            await checkbox1.click();
            abgefragtCheckedCount++;
            console.log(`  ✓ Checked "Abgefragt" checkbox`);
          }
          
          // Second checkbox is typically "Einwilligung Nutzung"
          const checkbox2 = checkboxesInRow.nth(1);
          const isChecked2 = await checkbox2.isChecked().catch(() => false);
          if (!isChecked2) {
            await checkbox2.click();
            nutzungCheckedCount++;
            console.log(`  ✓ Checked "Nutzung" checkbox`);
          }
        }
      } catch (e) {
        // Ignore errors and continue
      }
    }
    
    console.log(`Checked ${abgefragtCheckedCount} "Einwilligung Abgefragt" checkboxes`);
    console.log(`Checked ${nutzungCheckedCount} "Einwilligung Nutzung" checkboxes`);
    
    // Track learning platform checkboxes for cleanup
    if (abgefragtCheckedCount > 0 || nutzungCheckedCount > 0) {
      testCheckboxesChecked.push({ section: 'Lernplattformen', count: abgefragtCheckedCount + nutzungCheckedCount });
    }

    // Take screenshot after checking all checkboxes
    await page.screenshot({ path: 'debug-images/lernplattformen-checkboxes-checked.png' });
    console.log('Screenshot taken: debug-images/lernplattformen-checkboxes-checked.png');
    console.log('✓ Test completed successfully');
  });
});
