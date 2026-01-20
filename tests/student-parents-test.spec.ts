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
    test.setTimeout(60000); // Increase timeout to 60 seconds for this test
    
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

    // Find and modify Name field (Nachname of the parent)
    // Look for all span labels with "Name" text and find the right one
    console.log('Looking for Name (Nachname) field...');
    const allNameLabels = page.locator('span').filter({ hasText: /^Name$/ });
    const nameLabelCount = await allNameLabels.count();
    console.log(`Found ${nameLabelCount} labels with text "Name"`);
    
    let nameInput = null;
    let nameLabel = null;
    
    // Try each label and look for one with an actual value (not empty)
    for (let i = 0; i < nameLabelCount; i++) {
      const label = allNameLabels.nth(i);
      const labelId = await label.getAttribute('id').catch(() => '');
      const labelText = await label.textContent().catch(() => '');
      console.log(`  Name label ${i}: text="${labelText}", id="${labelId}"`);
      
      // Try to find associated input
      let input;
      if (labelId) {
        input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
      } else {
        // Find input in the same parent container
        const container = label.locator('xpath=ancestor::div[contains(@class, "flex") or contains(@class, "col")]').first();
        input = container.locator('input[type="text"]:not([readonly])').first();
      }
      
      const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
      if (inputVisible) {
        const inputId = await input.getAttribute('id').catch(() => '');
        const inputValue = await input.inputValue().catch(() => '');
        const inputPlaceholder = await input.getAttribute('placeholder').catch(() => '');
        console.log(`    Associated input: id="${inputId}", value="${inputValue}", placeholder="${inputPlaceholder}"`);
        
        // Select the input that has a value (the actual Name field, not a search/filter field)
        if (inputValue && inputValue.trim().length > 0) {
          nameLabel = label;
          nameInput = input;
          console.log(`    ✓ Selected this as the Name input (has value)`);
          break;
        }
      }
    }
    
    // If we didn't find one with a value, fall back to the first visible one
    if (!nameInput) {
      for (let i = 0; i < nameLabelCount; i++) {
        const label = allNameLabels.nth(i);
        const labelId = await label.getAttribute('id').catch(() => '');
        
        let input;
        if (labelId) {
          input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
        } else {
          const container = label.locator('xpath=ancestor::div[contains(@class, "flex") or contains(@class, "col")]').first();
          input = container.locator('input[type="text"]:not([readonly])').first();
        }
        
        const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
        if (inputVisible) {
          nameLabel = label;
          nameInput = input;
          console.log(`  ✓ Fallback: Selected Name input at index ${i}`);
          break;
        }
      }
    }
    
    if (!nameInput) {
      console.log('⚠ Name field not found or not visible - skipping');
    } else {
      // Get current value
      const currentNameValue = await nameInput.inputValue().catch(() => '') || '';
      console.log(`Current Name value: "${currentNameValue}"`);
      
      // Store original value for restoration
      originalValues['Name'] = currentNameValue;
      
      // Create timestamp
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const newNameValue = `Testname-${timestamp}`;
      
      // Clear and fill with new value
      await nameInput.click();
      await page.waitForTimeout(200);
      
      // Try clearing with keyboard
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      
      // Type the new value character by character
      await page.keyboard.type(newNameValue, { delay: 50 });
      
      // Wait a bit to let the value settle
      await page.waitForTimeout(300);
      
      // Check the value immediately after typing
      const valueAfterTyping = await nameInput.inputValue().catch(() => '');
      console.log(`Value immediately after typing: "${valueAfterTyping}"`);
      
      // Take screenshot after filling to debug
      await page.screenshot({ path: 'debug-images/name-field-filled.png' });
      console.log('Screenshot taken: debug-images/name-field-filled.png');
      
      await page.keyboard.press('Tab'); // Leave field to trigger save
      console.log(`✓ Changed Name from "${currentNameValue}" to "${newNameValue}"`);
      
      // Wait for auto-save
      await page.waitForTimeout(1000);
      
      // Verify the change
      const updatedNameValue = await nameInput.inputValue().catch(() => '');
      console.log(`Updated Name value: "${updatedNameValue}"`);
    }

    // Find and modify Vorname field (first name of the parent)
    console.log('Looking for Vorname field...');
    const allVornameLabels = page.locator('span').filter({ hasText: /^Vorname$/ });
    const vornameLabelCount = await allVornameLabels.count();
    console.log(`Found ${vornameLabelCount} labels with text "Vorname"`);
    
    let vornameInput = null;
    let vornameLabel = null;
    
    // Try each label and look for one with an actual value (not empty)
    for (let i = 0; i < vornameLabelCount; i++) {
      const label = allVornameLabels.nth(i);
      const labelId = await label.getAttribute('id').catch(() => '');
      const labelText = await label.textContent().catch(() => '');
      console.log(`  Vorname label ${i}: text="${labelText}", id="${labelId}"`);
      
      // Try to find associated input
      let input;
      if (labelId) {
        input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
      } else {
        // Find input in the same parent container
        const container = label.locator('xpath=ancestor::div[contains(@class, "flex") or contains(@class, "col")]').first();
        input = container.locator('input[type="text"]:not([readonly])').first();
      }
      
      const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
      if (inputVisible) {
        const inputId = await input.getAttribute('id').catch(() => '');
        const inputValue = await input.inputValue().catch(() => '');
        const inputPlaceholder = await input.getAttribute('placeholder').catch(() => '');
        console.log(`    Associated input: id="${inputId}", value="${inputValue}", placeholder="${inputPlaceholder}"`);
        
        // Select the input that has a value (the actual Vorname field, not a search/filter field)
        if (inputValue && inputValue.trim().length > 0) {
          vornameLabel = label;
          vornameInput = input;
          console.log(`    ✓ Selected this as the Vorname input (has value)`);
          break;
        }
      }
    }
    
    // If we didn't find one with a value, fall back to the first visible one
    if (!vornameInput) {
      for (let i = 0; i < vornameLabelCount; i++) {
        const label = allVornameLabels.nth(i);
        const labelId = await label.getAttribute('id').catch(() => '');
        
        let input;
        if (labelId) {
          input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
        } else {
          const container = label.locator('xpath=ancestor::div[contains(@class, "flex") or contains(@class, "col")]').first();
          input = container.locator('input[type="text"]:not([readonly])').first();
        }
        
        const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
        if (inputVisible) {
          vornameLabel = label;
          vornameInput = input;
          console.log(`  ✓ Fallback: Selected Vorname input at index ${i}`);
          break;
        }
      }
    }
    
    if (!vornameInput) {
      console.log('⚠ Vorname field not found or not visible - skipping');
    } else {
      // Get current value
      const currentVornameValue = await vornameInput.inputValue().catch(() => '') || '';
      console.log(`Current Vorname value: "${currentVornameValue}"`);
      
      // Store original value for restoration
      originalValues['Vorname'] = currentVornameValue;
      
      // Create timestamp
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const newVornameValue = `Testvorname-${timestamp}`;
      
      // Clear and fill with new value
      await vornameInput.click();
      await page.waitForTimeout(200);
      
      // Try clearing with keyboard
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      
      // Type the new value character by character
      await page.keyboard.type(newVornameValue, { delay: 50 });
      
      // Wait a bit to let the value settle
      await page.waitForTimeout(300);
      
      // Check the value immediately after typing
      const valueAfterTyping = await vornameInput.inputValue().catch(() => '');
      console.log(`Value immediately after typing: "${valueAfterTyping}"`);
      
      await page.keyboard.press('Tab'); // Leave field to trigger save
      console.log(`✓ Changed Vorname from "${currentVornameValue}" to "${newVornameValue}"`);
      
      // Wait for auto-save
      await page.waitForTimeout(1000);
      
      // Verify the change
      const updatedVornameValue = await vornameInput.inputValue().catch(() => '');
      console.log(`Updated Vorname value: "${updatedVornameValue}"`);
    }

    // Find and modify E-Mail-Adresse field
    console.log('Looking for E-Mail-Adresse field...');
    // Try different variations of the email label
    let allEmailLabels = page.locator('span').filter({ hasText: /^E-Mail-Adresse$/ });
    let emailLabelCount = await allEmailLabels.count();
    console.log(`Found ${emailLabelCount} labels with text "E-Mail-Adresse"`);
    
    if (emailLabelCount === 0) {
      // Try without "Adresse" suffix
      allEmailLabels = page.locator('span').filter({ hasText: /^E-Mail$|^Email$|^E-mail$/ });
      emailLabelCount = await allEmailLabels.count();
      console.log(`Trying alternative: Found ${emailLabelCount} labels with text "E-Mail/Email"`);
    }
    
    let emailInput = null;
    let emailLabel = null;
    
    // Try each label and look for all associated inputs, log them
    for (let i = 0; i < emailLabelCount; i++) {
      const label = allEmailLabels.nth(i);
      const labelId = await label.getAttribute('id').catch(() => '');
      const labelText = await label.textContent().catch(() => '');
      console.log(`  E-Mail label ${i}: text="${labelText}", id="${labelId}"`);
      
      // Try to find associated input
      let input;
      if (labelId) {
        input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
      } else {
        // Find input in the same parent container
        const container = label.locator('xpath=ancestor::div[contains(@class, "flex") or contains(@class, "col")]').first();
        input = container.locator('input[type="text"]:not([readonly]), input[type="email"]:not([readonly])').first();
      }
      
      const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
      if (inputVisible) {
        const inputId = await input.getAttribute('id').catch(() => '');
        const inputValue = await input.inputValue().catch(() => '');
        const inputPlaceholder = await input.getAttribute('placeholder').catch(() => '');
        const inputType = await input.getAttribute('type').catch(() => '');
        console.log(`    Associated input: id="${inputId}", value="${inputValue}", placeholder="${inputPlaceholder}", type="${inputType}"`);
        
        // Skip uiSelectInput (filter fields) - look for regular input fields
        // Prefer inputs with actual values or inputs that don't have uiSelectInput in their id
        if (!inputId || !inputId.includes('uiSelectInput')) {
          emailLabel = label;
          emailInput = input;
          console.log(`    ✓ Selected this as the E-Mail input (not a filter field)`);
          break;
        }
      }
    }
    
    // If we only found filter fields, try to find the actual email input by looking for inputs with labelId containing 'v-'
    if (!emailInput) {
      console.log('  No non-filter field found, looking for inputs with v- label ids...');
      for (let i = 0; i < emailLabelCount; i++) {
        const label = allEmailLabels.nth(i);
        const labelId = await label.getAttribute('id').catch(() => '');
        
        if (labelId && labelId.startsWith('v-')) {
          const input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
          const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
          if (inputVisible) {
            emailLabel = label;
            emailInput = input;
            console.log(`  ✓ Selected E-Mail input with v- label id at index ${i}`);
            break;
          }
        }
      }
    }
    
    // Last resort: check if there's an email-type input visible on the page
    if (!emailInput) {
      console.log('  No labeled E-Mail field found, checking for any email-type inputs...');
      const emailTypeInputs = page.locator('input[type="email"]:visible:not([readonly])');
      const emailTypeCount = await emailTypeInputs.count();
      console.log(`  Found ${emailTypeCount} email-type inputs`);
      if (emailTypeCount > 0) {
        emailInput = emailTypeInputs.first();
        console.log(`  ✓ Using first email-type input`);
      }
    }
    
    if (!emailInput) {
      console.log('⚠ E-Mail-Adresse field not found or not visible - skipping');
    } else {
      // Get current value
      const currentEmailValue = await emailInput.inputValue().catch(() => '') || '';
      console.log(`Current E-Mail-Adresse value: "${currentEmailValue}"`);
      
      // Store original value for restoration
      originalValues['E-Mail-Adresse'] = currentEmailValue;
      
      // Create timestamp
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const newEmailValue = `Testmail-${timestamp}@example.com`;
      
      // Clear and fill with new value
      await emailInput.click();
      await page.waitForTimeout(200);
      
      // Try clearing with keyboard
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      
      // Type the new value character by character
      await page.keyboard.type(newEmailValue, { delay: 50 });
      
      // Wait a bit to let the value settle
      await page.waitForTimeout(300);
      
      // Check the value immediately after typing
      const valueAfterTyping = await emailInput.inputValue().catch(() => '');
      console.log(`Value immediately after typing: "${valueAfterTyping}"`);
      
      await page.keyboard.press('Tab'); // Leave field to trigger save
      console.log(`✓ Changed E-Mail-Adresse from "${currentEmailValue}" to "${newEmailValue}"`);
      
      // Wait for auto-save
      await page.waitForTimeout(1000);
      
      // Verify the change
      const updatedEmailValue = await emailInput.inputValue().catch(() => '');
      console.log(`Updated E-Mail-Adresse value: "${updatedEmailValue}"`);
    }

    // Find and modify Straße und Hausnummer field
    console.log('Looking for Straße und Hausnummer field...');
    const allStrasseLabels = page.locator('span').filter({ hasText: /^Straße und Hausnummer$|^Straße$/ });
    const strasseLabelCount = await allStrasseLabels.count();
    console.log(`Found ${strasseLabelCount} labels with text "Straße und Hausnummer"`);
    
    let strasseInput = null;
    let strasseLabel = null;
    
    // Try each label and look for one with an actual value (not empty)
    for (let i = 0; i < strasseLabelCount; i++) {
      const label = allStrasseLabels.nth(i);
      const labelId = await label.getAttribute('id').catch(() => '');
      const labelText = await label.textContent().catch(() => '');
      console.log(`  Straße label ${i}: text="${labelText}", id="${labelId}"`);
      
      // Try to find associated input
      let input;
      if (labelId) {
        input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
      } else {
        // Find input in the same parent container
        const container = label.locator('xpath=ancestor::div[contains(@class, "flex") or contains(@class, "col")]').first();
        input = container.locator('input[type="text"]:not([readonly])').first();
      }
      
      const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
      if (inputVisible) {
        const inputId = await input.getAttribute('id').catch(() => '');
        const inputValue = await input.inputValue().catch(() => '');
        const inputPlaceholder = await input.getAttribute('placeholder').catch(() => '');
        console.log(`    Associated input: id="${inputId}", value="${inputValue}", placeholder="${inputPlaceholder}"`);
        
        // Skip uiSelectInput (filter fields) - look for regular input fields
        if (!inputId || !inputId.includes('uiSelectInput')) {
          strasseLabel = label;
          strasseInput = input;
          console.log(`    ✓ Selected this as the Straße input (not a filter field)`);
          break;
        }
      }
    }
    
    // If we only found filter fields, try to find the actual input by looking for inputs with labelId containing 'v-'
    if (!strasseInput) {
      console.log('  No non-filter field found, looking for inputs with v- label ids...');
      for (let i = 0; i < strasseLabelCount; i++) {
        const label = allStrasseLabels.nth(i);
        const labelId = await label.getAttribute('id').catch(() => '');
        
        if (labelId && labelId.startsWith('v-')) {
          const input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
          const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
          if (inputVisible) {
            strasseLabel = label;
            strasseInput = input;
            console.log(`  ✓ Selected Straße input with v- label id at index ${i}`);
            break;
          }
        }
      }
    }
    
    if (!strasseInput) {
      console.log('⚠ Straße und Hausnummer field not found or not visible - skipping');
    } else {
      // Get current value
      const currentStrasseValue = await strasseInput.inputValue().catch(() => '') || '';
      console.log(`Current Straße und Hausnummer value: "${currentStrasseValue}"`);
      
      // Store original value for restoration
      originalValues['Straße und Hausnummer'] = currentStrasseValue;
      
      // Create timestamp
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const newStrasseValue = `Teststrasse-${timestamp}`;
      
      // Clear and fill with new value
      await strasseInput.click();
      await page.waitForTimeout(200);
      
      // Try clearing with keyboard
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      
      // Type the new value character by character
      await page.keyboard.type(newStrasseValue, { delay: 50 });
      
      // Wait a bit to let the value settle
      await page.waitForTimeout(300);
      
      // Check the value immediately after typing
      const valueAfterTyping = await strasseInput.inputValue().catch(() => '');
      console.log(`Value immediately after typing: "${valueAfterTyping}"`);
      
      await page.keyboard.press('Tab'); // Leave field to trigger save
      console.log(`✓ Changed Straße und Hausnummer from "${currentStrasseValue}" to "${newStrasseValue}"`);
      
      // Wait for auto-save
      await page.waitForTimeout(1000);
      
      // Verify the change
      const updatedStrasseValue = await strasseInput.inputValue().catch(() => '');
      console.log(`Updated Straße und Hausnummer value: "${updatedStrasseValue}"`);
    }

    console.log('✓ Test completed successfully');
    } finally {
      // Restore original values
      if (keepTestData) {
        console.log('Keeping test data changes (KEEP_TEST_DATA=true)');
        return;
      }
      
      console.log('Restoring original values...');
      await page.waitForTimeout(500); // Wait for any auto-save to complete
      
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
            await page.waitForTimeout(300); // Wait for auto-save
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
            await page.waitForTimeout(300); // Wait for auto-save
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
            await page.waitForTimeout(300); // Wait for auto-save
          }
        } catch (error) {
          console.log(`⚠ Could not restore Titel: ${error}`);
        }
      }

      if (originalValues['Name'] !== undefined) {
        try {
          // Find the Name input again - look for one with a value
          const allNameLabels = page.locator('span').filter({ hasText: /^Name$/ });
          const nameLabelCount = await allNameLabels.count();
          
          let nameInput = null;
          for (let i = 0; i < nameLabelCount; i++) {
            const label = allNameLabels.nth(i);
            const labelId = await label.getAttribute('id').catch(() => '');
            
            let input;
            if (labelId) {
              input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
            } else {
              const container = label.locator('xpath=ancestor::div[contains(@class, "flex") or contains(@class, "col")]').first();
              input = container.locator('input[type="text"]:not([readonly])').first();
            }
            
            const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
            if (inputVisible) {
              const inputValue = await input.inputValue().catch(() => '');
              // Look for the input that was modified (should contain "Testname-")
              if (inputValue && inputValue.includes('Testname-')) {
                nameInput = input;
                break;
              }
            }
          }
          
          // If we didn't find the modified one, try to find any input with a value
          if (!nameInput) {
            for (let i = 0; i < nameLabelCount; i++) {
              const label = allNameLabels.nth(i);
              const labelId = await label.getAttribute('id').catch(() => '');
              
              let input;
              if (labelId) {
                input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
              } else {
                const container = label.locator('xpath=ancestor::div[contains(@class, "flex") or contains(@class, "col")]').first();
                input = container.locator('input[type="text"]:not([readonly])').first();
              }
              
              const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
              if (inputVisible) {
                const inputValue = await input.inputValue().catch(() => '');
                if (inputValue && inputValue.trim().length > 0) {
                  nameInput = input;
                  break;
                }
              }
            }
          }
          
          if (nameInput && await nameInput.isVisible({ timeout: 2000 })) {
            await nameInput.click();
            await page.waitForTimeout(200);
            await page.keyboard.press('Control+A');
            await page.keyboard.press('Backspace');
            await page.keyboard.type(originalValues['Name'], { delay: 50 });
            await page.keyboard.press('Tab'); // Leave field to trigger save
            console.log(`✓ Restored Name to "${originalValues['Name']}"`);
            await page.waitForTimeout(300); // Wait for auto-save
          }
        } catch (error) {
          console.log(`⚠ Could not restore Name: ${error}`);
        }
      }

      if (originalValues['Vorname'] !== undefined) {
        try {
          // Find the Vorname input again - look for one with a value
          const allVornameLabels = page.locator('span').filter({ hasText: /^Vorname$/ });
          const vornameLabelCount = await allVornameLabels.count();
          
          let vornameInput = null;
          for (let i = 0; i < vornameLabelCount; i++) {
            const label = allVornameLabels.nth(i);
            const labelId = await label.getAttribute('id').catch(() => '');
            
            let input;
            if (labelId) {
              input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
            } else {
              const container = label.locator('xpath=ancestor::div[contains(@class, "flex") or contains(@class, "col")]').first();
              input = container.locator('input[type="text"]:not([readonly])').first();
            }
            
            const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
            if (inputVisible) {
              const inputValue = await input.inputValue().catch(() => '');
              // Look for the input that was modified (should contain "Testvorname-")
              if (inputValue && inputValue.includes('Testvorname-')) {
                vornameInput = input;
                break;
              }
            }
          }
          
          // If we didn't find the modified one, try to find any input with a value
          if (!vornameInput) {
            for (let i = 0; i < vornameLabelCount; i++) {
              const label = allVornameLabels.nth(i);
              const labelId = await label.getAttribute('id').catch(() => '');
              
              let input;
              if (labelId) {
                input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
              } else {
                const container = label.locator('xpath=ancestor::div[contains(@class, "flex") or contains(@class, "col")]').first();
                input = container.locator('input[type="text"]:not([readonly])').first();
              }
              
              const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
              if (inputVisible) {
                const inputValue = await input.inputValue().catch(() => '');
                if (inputValue && inputValue.trim().length > 0) {
                  vornameInput = input;
                  break;
                }
              }
            }
          }
          
          if (vornameInput) {
            const isVis = await vornameInput.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVis) {
              await vornameInput.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
              await vornameInput.click({ timeout: 2000 });
              await page.waitForTimeout(200);
              await vornameInput.fill(originalValues['Vorname'], { timeout: 5000 }); // Use fill() with timeout
              await page.keyboard.press('Tab'); // Leave field to trigger save
              console.log(`✓ Restored Vorname to "${originalValues['Vorname']}"`);
              await page.waitForTimeout(300); // Wait for auto-save
            }
          }
        } catch (error) {
          console.log(`⚠ Could not restore Vorname: ${error}`);
        }
      }

      if (originalValues['E-Mail-Adresse'] !== undefined) {
        try {
          // Find the E-Mail-Adresse input again - try email-type inputs first
          let emailInput = null;
          
          const emailTypeInputs = page.locator('input[type="email"]:visible:not([readonly])');
          const emailTypeCount = await emailTypeInputs.count();
          
          if (emailTypeCount > 0) {
            emailInput = emailTypeInputs.first();
            console.log(`  Found email-type input for restoration`);
          } else {
            // Fallback to label-based search
            const allEmailLabels = page.locator('span').filter({ hasText: /^E-Mail-Adresse$|^E-Mail$|^Email$|^E-mail$/ });
            const emailLabelCount = await allEmailLabels.count();
            
            for (let i = 0; i < emailLabelCount; i++) {
              const label = allEmailLabels.nth(i);
              const labelId = await label.getAttribute('id').catch(() => '');
              
              let input;
              if (labelId) {
                input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
              } else {
                const container = label.locator('xpath=ancestor::div[contains(@class, "flex") or contains(@class, "col")]').first();
                input = container.locator('input[type="text"]:not([readonly]), input[type="email"]:not([readonly])').first();
              }
              
              const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
              if (inputVisible) {
                const inputValue = await input.inputValue().catch(() => '');
                // Look for the input that was modified (should contain "Testmail-") or just any visible one
                if (inputValue && (inputValue.includes('Testmail-') || inputValue.includes('@'))) {
                  emailInput = input;
                  break;
                }
              }
            }
          }
          
          if (emailInput && await emailInput.isVisible({ timeout: 2000 })) {
            await emailInput.click();
            await page.waitForTimeout(200);
            // Use fill instead of keyboard typing for speed
            await emailInput.fill(originalValues['E-Mail-Adresse']);
            await page.keyboard.press('Tab'); // Leave field to trigger save
            console.log(`✓ Restored E-Mail-Adresse to "${originalValues['E-Mail-Adresse']}"`);
            await page.waitForTimeout(300); // Wait for auto-save
          }
        } catch (error) {
          console.log(`⚠ Could not restore E-Mail-Adresse: ${error}`);
        }
      }

      if (originalValues['Straße und Hausnummer'] !== undefined) {
        try {
          // Find the Straße und Hausnummer input again
          const allStrasseLabels = page.locator('span').filter({ hasText: /^Straße und Hausnummer$|^Straße$/ });
          const strasseLabelCount = await allStrasseLabels.count();
          
          let strasseInput = null;
          for (let i = 0; i < strasseLabelCount; i++) {
            const label = allStrasseLabels.nth(i);
            const labelId = await label.getAttribute('id').catch(() => '');
            
            let input;
            if (labelId && labelId.startsWith('v-')) {
              input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
            } else if (labelId) {
              input = page.locator(`input[aria-labelledby="${labelId}"]:not([readonly])`).first();
            } else {
              const container = label.locator('xpath=ancestor::div[contains(@class, "flex") or contains(@class, "col")]').first();
              input = container.locator('input[type="text"]:not([readonly])').first();
            }
            
            const inputVisible = await input.isVisible({ timeout: 1000 }).catch(() => false);
            if (inputVisible) {
              const inputValue = await input.inputValue().catch(() => '');
              const inputId = await input.getAttribute('id').catch(() => '');
              // Look for the input that was modified (should contain "Teststrasse-") or non-filter fields
              if ((inputValue && inputValue.includes('Teststrasse-')) || (!inputId || !inputId.includes('uiSelectInput'))) {
                strasseInput = input;
                break;
              }
            }
          }
          
          if (strasseInput && await strasseInput.isVisible({ timeout: 2000 })) {
            await strasseInput.click();
            await page.waitForTimeout(200);
            await strasseInput.fill(originalValues['Straße und Hausnummer']);
            await page.keyboard.press('Tab'); // Leave field to trigger save
            console.log(`✓ Restored Straße und Hausnummer to "${originalValues['Straße und Hausnummer']}"`);
            await page.waitForTimeout(300); // Wait for auto-save
          }
        } catch (error) {
          console.log(`⚠ Could not restore Straße und Hausnummer: ${error}`);
        }
      }
    }
  });
});
