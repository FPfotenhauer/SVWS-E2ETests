import { test as base } from '@playwright/test';

type TestFixtures = {
  // Add custom fixtures here if needed
};

export const test = base.extend<TestFixtures>({
  // Example fixture for authenticated page
  // authenticatedPage: async ({ page }, use) => {
  //   await page.goto('/');
  //   await page.getByLabel('Datenbank-Schema').click();
  //   await page.getByRole('option', { name: 'svwse2e' }).click();
  //   await page.getByLabel('Username').fill('Admin');
  //   await page.getByLabel('Password').fill('');
  //   await page.getByRole('button', { name: 'Login' }).click();
  //   await page.waitForURL('**/svwse2e/**'); // Adjust URL as needed
  //   await use(page);
  // },
});

// Helper function to login
export async function loginAsAdmin(page: any) {
  await page.goto('/');
  // Select database schema - it's a combobox, not a select element
  await page.getByLabel('Datenbank-Schema').click();
  await page.getByRole('option', { name: 'svwse2e' }).click();
  await page.getByLabel('Benutzername').fill('Admin'); // Assuming German labels
  await page.getByLabel('Passwort').fill('');
  await page.getByRole('button', { name: /anmelden|login/i }).click();
  await page.waitForURL('**/svwse2e/**'); // Adjust based on actual redirect
}

// TODO: Add test data seeding for database "svwse2e"
// This could involve API calls to create test students or direct DB setup
// Example: await seedTestStudent({ name: 'Test Student', ... });