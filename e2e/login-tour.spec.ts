import { test, expect } from '@playwright/test';

test.describe('tour de login', () => {
  test('recorre los 5 pasos con el mouse', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: '¿Cómo funciona?' }).click();

    await expect(page.locator('.wp-tooltip')).toBeVisible();
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.locator('[data-tour="login.email"]')).toHaveValue('persona@ejemplo.com');
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.locator('[data-tour="login.password"]')).toHaveValue('Ejemplo123!');
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await page.getByRole('button', { name: 'Siguiente' }).click();
    await expect(page.locator('.wp-tooltip-body')).toContainText('Listo, ya sabes entrar');

    await page.getByRole('button', { name: 'Listo' }).click();
    await expect(page.locator('.wp-tooltip')).toBeHidden();
  });

  test('se puede recorrer completo solo con teclado (Esc cierra)', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: '¿Cómo funciona?' }).click();
    await expect(page.locator('.wp-tooltip')).toBeVisible();

    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-tour="login.email"]')).toHaveValue('persona@ejemplo.com');

    await page.getByRole('button', { name: 'Cerrar tour' }).click();
    await expect(page.locator('.wp-tooltip')).toBeHidden();
  });
});
