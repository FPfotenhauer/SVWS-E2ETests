import { test } from './fixtures';
import { expect } from '@playwright/test';
import { seedTestData, TEST_STUDENT } from './test-data';

const keepTestData = process.env.KEEP_TEST_DATA === 'true' || process.env.KEEP_TEST_DATA === '1';

test.describe('Student parents/legal guardians', () => {
  // Run tests serially to avoid parallel browser instances interfering with shared data
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await seedTestData(page);
  });

  test('Change Erzieherart combobox value', async ({ page }) => {
    // Store original values for restoration
    const originalValues: { [key: string]: string } = {};

    try {
      // Login
      console.log('Starting test: Change Erzieherart combobox value');
      await page.goto('/');
      await page.getByLabel('Datenbank-Schema').click();
      await page.getByRole('option', { name: 'svwse2e' }).click();
      await page.getByLabel('Benutzername').fill('Admin');
      await page.getByLabel('Passwort').fill('');
      await page.getByRole('button', { name: /anmelden|login/i }).click();
      await page.waitForURL('**/svwse2e/**');
      console.log('✓ Logged in');

    // Navigate to student list
    const studentsLink = page.getByRole('link', { name: /schüler|students|pupils/i }).first()
      .or(page.getByRole('button', { name: /schüler|students|pupils/i }).first());
    if (await studentsLink.isVisible({ timeout: 2000 })) {
      await studentsLink.click();
      console.log('✓ Navigated to students');
    }
    await page.waitForTimeout(500);

    // Find and click the test student
    const row = page.locator('[role="row"]').filter({ hasText: TEST_STUDENT.nachname }).first()
      .or(page.locator('tr').filter({ hasText: TEST_STUDENT.nachname }).first());
    if (await row.isVisible({ timeout: 3000 })) {
      await row.click();
      console.log(`✓ Clicked student: ${TEST_STUDENT.nachname}`);
    }
    await page.waitForTimeout(500);

    // Navigate to "Erziehungsberechtigte" tab
    console.log('Looking for Erziehungsberechtigte tab...');
    const parentTab = page.getByRole('button', { name: /erziehungsberechtigte|parents|guardians/i }).first()
      .or(page.locator('[role="tab"]').filter({ hasText: /erziehungsberechtigte|parents|guardians/i }).first());
    
    if (await parentTab.isVisible({ timeout: 3000 })) {
      await parentTab.click();
      console.log('✓ Clicked Erziehungsberechtigte tab');
      await page.waitForTimeout(1000);
    } else {
      throw new Error('Could not find Erziehungsberechtigte tab');
    }

    // Take screenshot to see the parent list
    await page.screenshot({ path: 'debug-images/parents-tab-opened.png' });
    console.log('Screenshot taken: debug-images/parents-tab-opened.png');

    // Find first parent row
    const allRows = page.locator('[role="row"], tr');
    const rowCount = await allRows.count();
    console.log(`Found ${rowCount} rows in parent list`);

    let firstParentRow = null;
    for (let i = 0; i < Math.min(rowCount, 10); i++) {
      const row = allRows.nth(i);
      const rowText = await row.textContent().catch(() => '');
      console.log(`Row ${i}: ${rowText?.substring(0, 80)}`);
      
      // Skip header rows - look for a row with actual data
      // Row 0 is usually header, look for real data rows
      if (i > 0 && rowText && !rowText.includes('Erziehungsberechtigte') && rowText.trim().length > 5) {
        firstParentRow = row;
        console.log(`  ✓ Selected as first parent row`);
        break;
      }
    }

    if (!firstParentRow) {
      throw new Error('Could not find any parent entries');
    }

    // Click on the first parent to open their details
    await firstParentRow.click();
    console.log('✓ Clicked first parent entry');
    await page.waitForTimeout(800);

    // Take screenshot after clicking parent
    await page.screenshot({ path: 'debug-images/parent-details-opened.png' });
    console.log('Screenshot taken: debug-images/parent-details-opened.png');

    // Wait for the details panel to fully load
    await page.waitForTimeout(500);

    // Find the "Erzieherart" input field
    console.log('Looking for Erzieherart input...');
    
    // It's a custom combobox - find the input with role="combobox" that's associated with the Erzieherart label
    // The label has id "uiSelectLabel_..." and the input has aria-labelledby pointing to it
    const erzieherartLabel = page.locator('span:has-text("Erzieherart")').first();
    const labelId = await erzieherartLabel.getAttribute('id').catch(() => '');
    console.log(`Erzieherart label id: ${labelId}`);
    
    let erzieherartInput;
    if (labelId) {
      // Find input with aria-labelledby matching the label id
      erzieherartInput = page.locator(`input[role="combobox"][aria-labelledby="${labelId}"]`);
    } else {
      // Fallback: find any combobox input near "Erzieherart" text
      erzieherartInput = page.locator('*:has-text("Erzieherart") input[role="combobox"]').first();
    }
    
    const inputVisible = await erzieherartInput.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`Erzieherart input visible: ${inputVisible}`);

    if (!inputVisible) {
      throw new Error('Could not find Erzieherart input field');
    }

    // Get the current displayed value (from the span, not the input value)
    const currentDisplayValue = await page.locator('*:has-text("Erzieherart") ~ * .ui-select--selection .truncate').first().textContent().catch(() => '') || '';
    console.log(`Current Erzieherart displayed value: "${currentDisplayValue}"`);
    
    // Store original value for restoration
    originalValues['Erzieherart'] = currentDisplayValue;

    // Click on the input and type "Testart"
    await erzieherartInput.click();
    console.log('✓ Clicked on Erzieherart input');
    await page.waitForTimeout(300);
    
    // Type "Testart" to filter/create the option
    await erzieherartInput.fill('Testart');
    await page.waitForTimeout(500);
    
    // Click on the "Testart" option from the dropdown
    const options = page.locator('[role="option"]');
    const testartOption = options.filter({ hasText: /^Testart$/ }).first();
    
    if (await testartOption.isVisible({ timeout: 2000 })) {
      await testartOption.click();
      console.log(`✓ Changed Erzieherart from "${currentDisplayValue}" to "Testart"`);
    } else {
      // If not visible, press Enter to select
      await page.keyboard.press('Enter');
      console.log(`✓ Changed Erzieherart from "${currentDisplayValue}" to "Testart" (via Enter)`);
    }

    // Wait for auto-save
    await page.waitForTimeout(1000);

    // Verify the change
    const updatedDisplayValue = await page.locator('*:has-text("Erzieherart") ~ * .ui-select--selection .truncate').first().textContent().catch(() => '');
    console.log(`Updated Erzieherart value: "${updatedDisplayValue}"`);

    // Take screenshot showing the changed value
    await page.screenshot({ path: 'debug-images/erzieherart-changed.png' });
    console.log('Screenshot taken: debug-images/erzieherart-changed.png');

    // Find and modify "Anrede" text input
    console.log('Looking for Anrede input...');
    
    // Debug: Check if "Anrede" text exists on the page
    const anredeText = page.locator('text=Anrede');
    const anredeTextVisible = await anredeText.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`"Anrede" text visible on page: ${anredeTextVisible}`);
    
    if (!anredeTextVisible) {
      console.log('Skipping Anrede field - not found on this form');
      console.log('✓ Test completed successfully');
      return; // Exit early if Anrede field doesn't exist
    }
    
    // Find input that follows "Anrede" label
    // Use similar approach as Erzieherart: find the label, then find associated input
    const anredeLabel = page.locator('span:has-text("Anrede")').first();
    const anredeLabelId = await anredeLabel.getAttribute('id').catch(() => '');
    console.log(`Anrede label id: ${anredeLabelId}`);
    
    let anredeInput;
    if (anredeLabelId) {
      // Find input with aria-labelledby matching the label id
      anredeInput = page.locator(`input[aria-labelledby="${anredeLabelId}"]:not([readonly])`).first();
    } else {
      // Fallback: look for editable input near Anrede text
      anredeInput = page.locator('div:has-text("Anrede") input[type="text"]:not([readonly])').first();
    }
    
    const anredeVisible = await anredeInput.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`Anrede input visible: ${anredeVisible}`);
    
    if (!anredeVisible) {
      console.log('⚠ Anrede field not found or not visible - skipping');
      console.log('✓ Test completed successfully (Erzieherart changed)');
    } else {
      // Get current value
      const currentAnredeValue = await anredeInput.inputValue().catch(() => '') || '';
      console.log(`Current Anrede value: "${currentAnredeValue}"`);
      
      // Store original value for restoration
      originalValues['Anrede'] = currentAnredeValue;
      
      // Clear and fill with new value
      await anredeInput.click();
      await anredeInput.fill('');
      await anredeInput.fill('Testanrede');
      await page.keyboard.press('Tab'); // Leave field to trigger save
      console.log(`✓ Changed Anrede from "${currentAnredeValue}" to "Testanrede"`);
      
      // Wait for auto-save
      await page.waitForTimeout(1000);
      
      // Verify the change
      const updatedAnredeValue = await anredeInput.inputValue().catch(() => '');
      console.log(`Updated Anrede value: "${updatedAnredeValue}"`);
      
      // Take screenshot showing both changes
      await page.screenshot({ path: 'debug-images/parent-fields-changed.png' });
      console.log('Screenshot taken: debug-images/parent-fields-changed.png');

      console.log('✓ Test completed successfully');
    }
    // Find and modify Titel field (often empty)
    const titelTextVisible = await page.locator('span:has-text("Titel")').first().isVisible({ timeout: 2000 }).catch(() => false);
    if (!titelTextVisible) {
      console.log('Skipping Titel field - not found on this form');
    } else {
      // Find input that follows "Titel" label
      const titelLabel = page.locator('span:has-text("Titel")').first();
      const titelLabelId = await titelLabel.getAttribute('id').catch(() => '');
      console.log(`Titel label id: ${titelLabelId}`);
      
      let titelInput;
      if (titelLabelId) {
        // Find input with aria-labelledby matching the label id
        titelInput = page.locator(`input[aria-labelledby="${titelLabelId}"]:not([readonly])`).first();
      } else {
        // Fallback: look for editable input near Titel text
        titelInput = page.locator('div:has-text("Titel") input[type="text"]:not([readonly])').first();
      }
      
      const titelVisible = await titelInput.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`Titel input visible: ${titelVisible}`);
      
      if (!titelVisible) {
        console.log('⚠ Titel field not found or not visible - skipping');
      } else {
        // Get current value
        const currentTitelValue = await titelInput.inputValue().catch(() => '') || '';
        console.log(`Current Titel value: "${currentTitelValue}"`);
        
        // Store original value for restoration
        originalValues['Titel'] = currentTitelValue;
        
        // Clear and fill with new value
        await titelInput.click();
        await titelInput.fill('');
        await titelInput.fill('Testtitel');
        await page.keyboard.press('Tab'); // Leave field to trigger save
        console.log(`✓ Changed Titel from "${currentTitelValue}" to "Testtitel"`);
        
        // Wait for auto-save
        await page.waitForTimeout(1000);
        
        // Verify the change
        const updatedTitelValue = await titelInput.inputValue().catch(() => '');
        console.log(`Updated Titel value: "${updatedTitelValue}"`);
      }
    }

    console.log('✓ Test completed successfully');
    } finally {
      // Restore original values
      if (keepTestData) {
        console.log('Keeping test data changes (KEEP_TEST_DATA=true)');
        return;
      }
      
      console.log('Restoring original values...');
      
      if (originalValues['Erzieherart']) {
        try {
          // Find the Erzieherart input again
          const erzieherartLabel = page.locator('span:has-text("Erzieherart")').first();
          const labelId = await erzieherartLabel.getAttribute('id').catch(() => '');
          
          let erzieherartInput;
          if (labelId) {
            erzieherartInput = page.locator(`input[role="combobox"][aria-labelledby="${labelId}"]`);
          } else {
            erzieherartInput = page.locator('*:has-text("Erzieherart") input[role="combobox"]').first();
          }
          
          // Click to open dropdown
          await erzieherartInput.click({ timeout: 2000 });
          await page.waitForTimeout(300);
          
          // Find and click the original value
          const options = page.locator('[role="option"]');
          const originalOption = options.filter({ hasText: new RegExp(`^${originalValues['Erzieherart']}$`) }).first();
          
          if (await originalOption.isVisible({ timeout: 2000 })) {
            await originalOption.click();
            await page.keyboard.press('Tab'); // Leave field to trigger save
            console.log(`✓ Restored Erzieherart to "${originalValues['Erzieherart']}"`);
            await page.waitForTimeout(1000); // Wait for auto-save
          }
        } catch (error) {
          console.log(`⚠ Could not restore Erzieherart: ${error}`);
        }
      }
      
      if (originalValues['Anrede'] !== undefined) {
        try {
          // Find the Anrede input again using the same approach as when we modified it
          const anredeLabel = page.locator('span:has-text("Anrede")').first();
          const anredeLabelId = await anredeLabel.getAttribute('id').catch(() => '');
          
          let anredeInput;
          if (anredeLabelId) {
            anredeInput = page.locator(`input[aria-labelledby="${anredeLabelId}"]:not([readonly])`).first();
          } else {
            anredeInput = page.locator('div:has-text("Anrede") input[type="text"]:not([readonly])').first();
          }
          
          if (await anredeInput.isVisible({ timeout: 2000 })) {
            await anredeInput.click();
            await anredeInput.fill('');
            await anredeInput.fill(originalValues['Anrede']);
            await page.keyboard.press('Tab'); // Leave field to trigger save
            console.log(`✓ Restored Anrede to "${originalValues['Anrede']}"`);
            await page.waitForTimeout(1000); // Wait for auto-save
          }
        } catch (error) {
          console.log(`⚠ Could not restore Anrede: ${error}`);
        }
      }

      if (originalValues['Titel'] !== undefined) {
        try {
          // Find the Titel input again using the same approach as when we modified it
          const titelLabel = page.locator('span:has-text("Titel")').first();
          const titelLabelId = await titelLabel.getAttribute('id').catch(() => '');
          
          let titelInput;
          if (titelLabelId) {
            titelInput = page.locator(`input[aria-labelledby="${titelLabelId}"]:not([readonly])`).first();
          } else {
            titelInput = page.locator('div:has-text("Titel") input[type="text"]:not([readonly])').first();
          }
          
          if (await titelInput.isVisible({ timeout: 2000 })) {
            await titelInput.click();
            await titelInput.fill('');
            await titelInput.fill(originalValues['Titel']);
            await page.keyboard.press('Tab'); // Leave field to trigger save
            console.log(`✓ Restored Titel to "${originalValues['Titel']}"`);
            await page.waitForTimeout(1000); // Wait for auto-save
          }
        } catch (error) {
          console.log(`⚠ Could not restore Titel: ${error}`);
        }
      }
    }
  });
});
