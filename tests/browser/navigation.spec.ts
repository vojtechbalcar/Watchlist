import { test, expect } from "@playwright/test";

test("navigation remains mounted and marks the current route", async ({ page }) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Primary" });
  await expect(navigation).toBeVisible();
  await navigation.evaluate(element => element.setAttribute("data-persistent-test", "true"));
  await navigation.getByRole("link", { name: "Explore", exact: true }).click();
  await expect(page.getByRole("heading", { name: /^Explore/ })).toBeVisible();
  await expect(navigation).toHaveAttribute("data-persistent-test", "true");
  await expect(navigation.getByRole("link", { name: "Explore", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.locator("header.site-header")).toHaveCount(1);
});

test("slow navigation announces progress without disabling other links", async ({ page }) => {
  await page.goto("/");
  let release: () => void = () => {};
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/compare?**", async route => { await held; await route.continue(); });
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Compare", exact: true }).click();
  await expect(page.getByText("Opening page…")).toBeAttached();
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Watchlist", exact: true })).toBeVisible();
  release();
  await expect(page.getByRole("heading", { name: /^Compare/ })).toBeVisible();
});
