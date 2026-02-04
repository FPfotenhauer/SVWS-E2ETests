import { test } from './fixtures';
import { expect } from '@playwright/test';
import { seedTestData, TEST_STUDENT } from './test-data';

const keepTestData = process.env.KEEP_TEST_DATA === 'true' || process.env.KEEP_TEST_DATA === '1';

test.describe('Add Parent Test', () => {
    test.beforeEach(async ({ page }) => {
        await seedTestData(page);
    });

    // Note: Marked as fixme due to application bug where Save button remains disabled
    test('Add a new parent to student', async ({ page }) => {
        test.setTimeout(60000);
        // 1. Login
        await page.goto('/');
        await page.getByLabel('Datenbank-Schema').click();
        await page.getByRole('option', { name: 'svwse2e' }).click();
        await page.getByLabel('Benutzername').fill('Admin');
        await page.getByLabel('Passwort').fill('');
        await page.getByRole('button', { name: /anmelden|login/i }).click();
        await page.waitForURL('**/svwse2e/**');

        // 2. Navigate to student list
        const studentsLink = page.getByRole('link', { name: /schüler|students|pupils/i }).first()
            .or(page.getByRole('button', { name: /schüler|students|pupils/i }).first());
        
        await expect(studentsLink).toBeVisible({ timeout: 10000 });
        await studentsLink.click();
        await page.waitForTimeout(1000); // Wait for list to load

        // 3. Select student
        // Wait for at least one row to be present
        await page.locator('[role="row"], tr').first().waitFor({ timeout: 10000 });

        const testStudentName = TEST_STUDENT.nachname;
        
        const row = page.locator('[role="row"]').filter({ hasText: testStudentName }).first()
            .or(page.locator('tr').filter({ hasText: testStudentName }).first());
        
        if (await row.isVisible({ timeout: 5000 })) {
             await row.click();
        } else {
             const fallbackRow = page.locator('[role="row"]').nth(1).first() // Skip header if possible
                  .or(page.locator('tr').nth(1).first());
             
             if (await fallbackRow.count() === 0) {
                 // Try nth(0) if nth(1) failed (maybe only one row or no header)
                 await page.locator('[role="row"]').first()
                    .or(page.locator('tr').filter({ hasText: /^[A-Z]/ }).first()).click();
             } else {
                 await fallbackRow.click();
             }
        }
        
        // Wait for student details to load
        await page.waitForURL('**/schueler/**/daten', { timeout: 10000 }).catch(() => {});
        
        // 4. Navigate to "Erziehungsberechtigte" tab
        const parentTab = page.getByRole('button', { name: /erziehungsberechtigte|parents|guardians/i }).first()
            .or(page.locator('[role="tab"]').filter({ hasText: /erziehungsberechtigte|parents|guardians/i }).first());
        await parentTab.click();
        await page.waitForTimeout(500);

        // 5. Click "+" icon below the table
        // Target the specific add button by title
        const addButton = page.locator('button[title="Erziehungsberechtigten hinzufügen"]');
        
        await addButton.click();

        // 6. Modal open, fill in testdata
        const modal = page.locator('.modal, [role="dialog"]').last(); // Use last() in case multiple dialogs/layers, or specifically the top one
        await expect(modal).toBeVisible();

        const timestamp = Date.now();
        const testParent = {
            nachname: `ElternteilNachname${timestamp}`,
            vorname: `ElternteilVorname${timestamp}`,
            anrede: 'Herr',
            erzieherart: 'Vater',
            titel: 'Dr.',
            email: 'vater@example.com',
            strasse: 'Teststraße 99',
            plzOrt: '42287 Wuppertal',
            ortsteil: 'Barmen',
            staatsangehoerigkeit: 'Afghanistan',
            bemerkungen: `Testbemerkung-${timestamp}`
        };

        // Helper for Combobox filling
        const fillCombobox = async (labelPattern: RegExp | string, value: string) => {
             console.log(`Filling Combobox '${labelPattern}' with '${value}'...`);
             
             // 1. Find the input element
             // Priority 1: Native label association
             let input = modal.getByLabel(labelPattern).first();
             
             // Priority 2: Label text proximity (for custom controls)
             if (await input.count() === 0 || !(await input.isVisible())) {
                 const label = modal.locator('label, span').filter({ hasText: labelPattern }).first();
                 if (await label.isVisible()) {
                      // Try finding input with role="combobox" nearby
                      // 1. Inside the label container
                      let candidate = label.locator('input[role="combobox"]').first();
                      // 2. Next sibling or in parent
                      if (await candidate.count() === 0) {
                          candidate = label.locator('..').locator('input[role="combobox"]').first();
                      }
                      if (await candidate.count() > 0) input = candidate;
                 }
             }

             // Priority 3: Fallback specific for Erzieherart which we know works via specific locator if general fails
             if ((await input.count() === 0 || !(await input.isVisible())) && labelPattern.toString().includes('erzieherart')) {
                 input = modal.locator('input[role="combobox"][aria-label*="Erzieherart"]').first()
                      .or(modal.locator('*:has-text("Erzieherart") input[role="combobox"]').first());
             }

             if (await input.count() === 0) throw new Error(`Could not find combobox input for ${labelPattern}`);
             
             // Ensure we are targeting the input tag
             let tagName = await input.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
             if (tagName !== 'input') {
                 // Check if disabled (including class check for custom controls)
                 const isEnabled = await input.isEnabled().catch(() => false);
                 const classAttr = await input.getAttribute('class').catch(() => '');
                 const isDisabled = !isEnabled || (classAttr && classAttr.includes('cursor-not-allowed'));

                 if (isDisabled) {
                     console.log(`Field '${labelPattern}' appears disabled. Waiting for it to become enabled...`);
                     try {
                         await expect(input).not.toHaveClass(/cursor-not-allowed/, { timeout: 5000 });
                         // Also check standard enabled
                         await expect(input).toBeEnabled({ timeout: 5000 });
                     } catch (e) {
                         console.log(`Field '${labelPattern}' remained disabled.`);
                     }
                 }

                 const inner = input.locator('input').first();
                 if (await inner.count() > 0) input = inner;
                 
                 // Re-check tag
                 tagName = await input.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
                 if (tagName !== 'input') {
                      console.log(`could not drill down to input for ${labelPattern}`);
                 }
             }

             // 2. Interact
             
             await input.click({ force: true });
             
             // Use pressSequentially to simulate real typing (triggers dropdowns better)
             // Clear first if needed
             await input.clear().catch(() => {}); 
             await input.pressSequentially(value, { delay: 100 });
             
             // Wait for dropdown list to appear
             // Use pseudo-class :visible to find the currently open dropdown (ignoring hidden ones in DOM)
             const listbox = page.locator('.ui-select--dropdown:visible, [role="listbox"]:visible').first();
             await expect(listbox).toBeVisible({ timeout: 4000 }).catch(() => console.log(`Dropdown for ${labelPattern} didn't open or was slow.`));

             // Strategy: CLICK the option if visible (most reliable). Fallback to Keyboard.
             const option = listbox.locator('.ui-select-option, [role="option"]').filter({ hasText: value }).first();
             
             if (await listbox.isVisible() && await option.isVisible()) {
                 console.log(`Clicking option for '${value}'...`);
                 await option.click();
             } else {
                 console.log(`Option '${value}' not visible explicitly. Using ArrowDown + Enter.`);
                 if (await listbox.isVisible()) {
                      await page.keyboard.press('ArrowDown');
                      await page.keyboard.press('Enter'); 
                 } else {
                      // Blind navigation if list didn't open (e.g. invalid locator or super fast)
                      await page.keyboard.press('Tab');
                      await page.keyboard.press('Tab');
                 }
             }

             await page.waitForTimeout(500);
        };

        // Fill "Erzieherart" (Combobox)
        await fillCombobox(/erzieherart/i, testParent.erzieherart);

        // Fill "Anrede" (Text Input usually, but could be combobox - adhering to user instruction 'Rest is textinput' except specified)
        // User said: "Staatsangehörigkeit, Wohnort, Ortsteil are Comboboxes" implies Anrede is text here, or user forgot it. 
        // In previous code we treated Anrede as text. Let's fill it.
        await modal.getByLabel(/anrede/i).fill(testParent.anrede);
        
        // Fill "Titel"
        await modal.getByLabel(/titel/i).fill(testParent.titel);

        // Fill Name fields
        await modal.getByLabel(/nachname/i).first().fill(testParent.nachname);
        await modal.getByLabel(/rufname/i).first().fill(testParent.vorname);

        // Fill E-Mail
        await modal.getByLabel(/e-mail adresse/i).fill(testParent.email);

        // Fill Staatsangehörigkeit (Combobox)
        await fillCombobox(/staatsangehörigkeit/i, testParent.staatsangehoerigkeit);

        // Fill Straße
        await modal.getByLabel(/straße und hausnummer/i).fill(testParent.strasse);

        // Fill Wohnort (Combobox) - Important: Trigger for Ortsteil
        await fillCombobox(/wohnort/i, testParent.plzOrt);
        
        // Wait for Ortsteil to likely populate or enable
        await page.waitForTimeout(500);

        // Fill Ortsteil (Combobox)
        await fillCombobox(/ortsteil/i, testParent.ortsteil);

        // Fill Bemerkungen
        await modal.getByLabel(/bemerkungen/i).fill(testParent.bemerkungen);
        
        // Tab out of the last field to trigger validation/update
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);

        // 7. Click on "Speichern"
        const saveButton = modal.getByRole('button', { name: /speichern|save/i });
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        // Optional: Verify success (modal closes or toast appears or entry appears in list)
        await expect(modal).not.toBeVisible();
        
        // Wait for the new entry to appear in the table
        const newParentRow = page.locator('[role="row"], tr').filter({ hasText: testParent.nachname }).first();
        await expect(newParentRow).toBeVisible();

        // 8. Cleanup (if keepTestData is false)
        if (!keepTestData) {
            console.log('Cleaning up: Deleting created parent...');
            
            // Wait a moment for UI to settle
            await page.waitForTimeout(500);

            // 1. Click the checkbox in table on the left side of the new data
            const checkbox = newParentRow.locator('input[type="checkbox"], .svws-ui-checkbox, [role="checkbox"]').first();
            await expect(checkbox).toBeVisible();
            await checkbox.click({ force: true });
            
            // Wait for UI update (selection count to update)
            await page.waitForTimeout(500);

            // 2. Click on the trashcan icon at the bottom of the table
            console.log('Searching for delete button...');
            
            // Using the specific class name provided: button--trash
            // Also keeping fallback to generic trash icon just in case
            const deleteButton = page.locator('.svws-ui-button--trash, .button--trash').first()
                .or(page.locator('button').filter({ has: page.locator('.fa-trash-can, .fa-trash') }).last());

            await expect(deleteButton).toBeVisible();
            console.log('Clicking delete button...');
            await deleteButton.click();

            // Confirm deletion in modal if it appears
            // It almost certainly appears for deletions
            const deleteModal = page.locator('.modal, [role="dialog"]').last();
            await deleteModal.waitFor({ state: 'visible', timeout: 5000 }).catch(() => console.log('Delete modal did not appear or was not detected.'));
            
            if (await deleteModal.isVisible()) {
                await deleteModal.getByRole('button', { name: /löschen|delete|ja|yes/i }).click();
            }
            
            // Verify deletion with longer timeout
            await expect(newParentRow).not.toBeVisible({ timeout: 10000 });
            console.log('Cleanup successful.');
        } else {
            console.log('Skipping cleanup (KEEP_TEST_DATA active)');
        }
    });
});
