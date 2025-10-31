import { test } from "./driver.mjs";
import { testFail } from "./driver.mjs";

// https://github.com/tc39/ecma262/pull/1713
testFail("/a+(?<Z>z)?/d", "Invalid regular expression flag (1:1)", { ecmaVersion: 2021 })
test("/a+(?<Z>z)?/d", {}, { ecmaVersion: 2022 })
