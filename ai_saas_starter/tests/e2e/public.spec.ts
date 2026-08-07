import { expect, test } from "@playwright/test";

test("public product and pricing pages are deployable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /trusted workspace/i })).toBeVisible();
  await expect(page.getByText("Apache-2.0")).toBeVisible();
  await page.goto("/pricing");
  await expect(page.getByRole("heading", { name: /scale deliberately/i })).toBeVisible();
});

test("unprovisioned protected routes fail closed with a useful message", async ({ page }) => {
  await page.goto("/workspace");
  await expect(page.getByRole("heading", { name: "Sign in to continue" })).toBeVisible();
  await expect(page.getByText(/issuer is not provisioned/i)).toBeVisible();
});
