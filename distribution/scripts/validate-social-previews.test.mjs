import assert from "node:assert/strict";
import test from "node:test";
import { validateSocialPreviews } from "./validate-social-previews.mjs";

test("validates every checked-in framework social preview", async () => {
  const result = await validateSocialPreviews();
  assert.equal(result.checked, 20);
  assert.deepEqual(result.errors, []);
});
