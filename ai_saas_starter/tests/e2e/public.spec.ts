import { expect, test } from "@playwright/test";

test("public product and pricing pages are deployable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /trusted workspace/i })).toBeVisible();
  await expect(page.getByText("Apache-2.0")).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore the product demo" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Set up Tuurio ID" }).first()).toBeVisible();
  await page.goto("/pricing");
  await expect(page.getByRole("heading", { name: /scale deliberately/i })).toBeVisible();
});

test("unprovisioned protected routes fail closed with a useful message", async ({ page }) => {
  await page.goto("/workspace");
  await expect(page.getByRole("heading", { name: "Connect your own Tuurio ID client" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open setup guide" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore the local demo" })).toBeVisible();
});

test("setup guide generates a pinned command for the current origin", async ({ page }) => {
  await page.goto("/setup");
  await expect(page.getByRole("heading", { name: /connect this installation/i })).toBeVisible();
  await expect(page.getByText(/npx manage-tuurio-id@1\.1\.6 init/)).toBeVisible();
  await expect(page.getByText(/--base-url http:\/\/127\.0\.0\.1:3000/)).toBeVisible();
});

test("local demo is interactive and explicitly unauthenticated", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByText("Local product preview")).toBeVisible();
  await expect(page.getByText(/No authentication/)).toBeVisible();
  await page.getByRole("textbox", { name: "Demo message" }).fill("What should we validate first?");
  await page.getByRole("button", { name: "Send demo message" }).click();
  await expect(page.getByText(/one-week experiment/)).toBeVisible();
  await page.getByRole("button", { name: "Admin" }).click();
  await expect(page.getByRole("heading", { name: "People and recent activity" })).toBeVisible();
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Safe defaults, visible tradeoffs" })).toBeVisible();
});

test("runtime deployment details require a validated bearer token", async ({ request }) => {
  const response = await request.get("/api/config");
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual({ error: "A valid bearer token is required" });
});
