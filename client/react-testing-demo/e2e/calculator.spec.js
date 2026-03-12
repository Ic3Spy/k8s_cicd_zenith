import { test, expect } from '@playwright/test';

// ── Helpers ───────────────────────────────────────────────────
async function clickBtn(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click();
}

async function getDisplay(page) {
  return page.locator('.display-value').textContent();
}

async function clearCalc(page) {
  await clickBtn(page, 'AC');
}

// ── Setup ─────────────────────────────────────────────────────
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Wait for calculator to be visible
  await expect(page.locator('.calculator')).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════
// Display Tests
// ═══════════════════════════════════════════════════════════════
test.describe('Display', () => {

  test('shows 0 on initial load', async ({ page }) => {
    const display = await getDisplay(page);
    expect(display).toBe('0');
  });

  test('shows digit when pressed', async ({ page }) => {
    await clickBtn(page, '5');
    expect(await getDisplay(page)).toBe('5');
  });

  test('appends multiple digits', async ({ page }) => {
    await clickBtn(page, '1');
    await clickBtn(page, '2');
    await clickBtn(page, '3');
    expect(await getDisplay(page)).toBe('123');
  });

  test('AC resets display to 0', async ({ page }) => {
    await clickBtn(page, '9');
    await clickBtn(page, '8');
    await clearCalc(page);
    expect(await getDisplay(page)).toBe('0');
  });

  test('backspace removes last digit', async ({ page }) => {
    await clickBtn(page, '4');
    await clickBtn(page, '2');
    await clickBtn(page, '⌫');
    expect(await getDisplay(page)).toBe('4');
  });

  test('handles decimal input', async ({ page }) => {
    await clickBtn(page, '3');
    await clickBtn(page, '.');
    await clickBtn(page, '1');
    await clickBtn(page, '4');
    expect(await getDisplay(page)).toBe('3.14');
  });

  test('prevents duplicate decimal point', async ({ page }) => {
    await clickBtn(page, '1');
    await clickBtn(page, '.');
    await clickBtn(page, '.');
    expect(await getDisplay(page)).toBe('1.');
  });

});

// ═══════════════════════════════════════════════════════════════
// Arithmetic Tests
// ═══════════════════════════════════════════════════════════════
test.describe('Arithmetic', () => {

  test('adds two numbers', async ({ page }) => {
    await clickBtn(page, '3');
    await clickBtn(page, '+');
    await clickBtn(page, '4');
    await clickBtn(page, '=');
    expect(await getDisplay(page)).toBe('7');
  });

  test('subtracts two numbers', async ({ page }) => {
    await clickBtn(page, '9');
    await clickBtn(page, '−');
    await clickBtn(page, '3');
    await clickBtn(page, '=');
    expect(await getDisplay(page)).toBe('6');
  });

  test('multiplies two numbers', async ({ page }) => {
    await clickBtn(page, '6');
    await clickBtn(page, '×');
    await clickBtn(page, '7');
    await clickBtn(page, '=');
    expect(await getDisplay(page)).toBe('42');
  });

  test('divides two numbers', async ({ page }) => {
    await clickBtn(page, '8');
    await clickBtn(page, '÷');
    await clickBtn(page, '4');
    await clickBtn(page, '=');
    expect(await getDisplay(page)).toBe('2');
  });

  test('chains multiple operations', async ({ page }) => {
    await clickBtn(page, '2');
    await clickBtn(page, '+');
    await clickBtn(page, '3');
    await clickBtn(page, '+');
    await clickBtn(page, '4');
    await clickBtn(page, '=');
    expect(await getDisplay(page)).toBe('9');
  });

  test('handles division by zero', async ({ page }) => {
    await clickBtn(page, '5');
    await clickBtn(page, '÷');
    await clickBtn(page, '0');
    await clickBtn(page, '=');
    expect(await getDisplay(page)).toBe('Div/0');
  });

  test('percentage converts correctly', async ({ page }) => {
    await clickBtn(page, '5');
    await clickBtn(page, '0');
    await clickBtn(page, '%');
    expect(await getDisplay(page)).toBe('0.5');
  });

  test('toggles negative sign', async ({ page }) => {
    await clickBtn(page, '8');
    await clickBtn(page, '+/−');
    expect(await getDisplay(page)).toBe('-8');
  });

});

// ═══════════════════════════════════════════════════════════════
// Keyboard Tests
// ═══════════════════════════════════════════════════════════════
test.describe('Keyboard Support', () => {

  test('types digits via keyboard', async ({ page }) => {
    await page.keyboard.press('4');
    await page.keyboard.press('2');
    expect(await getDisplay(page)).toBe('42');
  });

  test('calculates via Enter key', async ({ page }) => {
    await page.keyboard.press('3');
    await page.keyboard.press('+');
    await page.keyboard.press('5');
    await page.keyboard.press('Enter');
    expect(await getDisplay(page)).toBe('8');
  });

  test('clears via Escape key', async ({ page }) => {
    await page.keyboard.press('9');
    await page.keyboard.press('Escape');
    expect(await getDisplay(page)).toBe('0');
  });

  test('backspace via Backspace key', async ({ page }) => {
    await page.keyboard.press('7');
    await page.keyboard.press('8');
    await page.keyboard.press('Backspace');
    expect(await getDisplay(page)).toBe('7');
  });

});

// ═══════════════════════════════════════════════════════════════
// History Tests
// ═══════════════════════════════════════════════════════════════
test.describe('History', () => {

  test('opens history panel', async ({ page }) => {
    await page.getByTitle('History').click();
    await expect(page.locator('.hist-panel')).toBeVisible();
  });

  test('records calculation in history', async ({ page }) => {
    await clickBtn(page, '5');
    await clickBtn(page, '+');
    await clickBtn(page, '3');
    await clickBtn(page, '=');
    await page.getByTitle('History').click();
    await expect(page.locator('.hist-result').first()).toContainText('8');
  });

  test('recalls result from history', async ({ page }) => {
    await clickBtn(page, '6');
    await clickBtn(page, '×');
    await clickBtn(page, '7');
    await clickBtn(page, '=');
    await page.getByTitle('History').click();
    await page.locator('.hist-item').first().click();
    expect(await getDisplay(page)).toBe('42');
  });

  test('clears history', async ({ page }) => {
    await clickBtn(page, '2');
    await clickBtn(page, '+');
    await clickBtn(page, '3');
    await clickBtn(page, '=');
    await page.getByTitle('History').click();
    await page.getByText('Clear history').click();
    await expect(page.getByText('No history yet')).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════════
// Visual / UI Tests
// ═══════════════════════════════════════════════════════════════
test.describe('UI', () => {

  test('calculator is visible on load', async ({ page }) => {
    await expect(page.locator('.calculator')).toBeVisible();
  });

  test('all number buttons are visible', async ({ page }) => {
    for (const num of ['0','1','2','3','4','5','6','7','8','9']) {
      await expect(page.getByRole('button', { name: num, exact: true })).toBeVisible();
    }
  });

  test('all operator buttons are visible', async ({ page }) => {
    for (const op of ['+', '−', '×', '÷', '=']) {
      await expect(page.getByRole('button', { name: op, exact: true })).toBeVisible();
    }
  });

  test('display updates color on error', async ({ page }) => {
    await clickBtn(page, '5');
    await clickBtn(page, '÷');
    await clickBtn(page, '0');
    await clickBtn(page, '=');
    await expect(page.locator('.display')).toHaveClass(/error/);
  });
});
