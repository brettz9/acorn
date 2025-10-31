import * as driver from "./driver.mjs"
import "./tests.mjs";
import "./tests-harmony.mjs";
import "./tests-es7.mjs";
import "./tests-asyncawait.mjs";
import "./tests-await-top-level.mjs";
import "./tests-trailing-commas-in-func.mjs";
import "./tests-template-literal-revision.mjs";
import "./tests-directive.mjs";
import "./tests-rest-spread-properties.mjs";
import "./tests-async-iteration.mjs";
import "./tests-regexp.mjs";
import "./tests-regexp-2018.mjs";
import "./tests-regexp-2020.mjs";
import "./tests-regexp-2022.mjs";
import "./tests-regexp-2024.mjs";
import "./tests-regexp-2025.mjs";
import "./tests-json-superset.mjs";
import "./tests-optional-catch-binding.mjs";
import "./tests-bigint.mjs";
import "./tests-dynamic-import.mjs";
import "./tests-export-named.mjs";
import "./tests-export-all-as-ns-from-source.mjs";
import "./tests-import-meta.mjs";
import "./tests-nullish-coalescing.mjs";
import "./tests-optional-chaining.mjs";
import "./tests-logical-assignment-operators.mjs";
import "./tests-numeric-separators.mjs";
import "./tests-class-features-2022.mjs";
import "./tests-module-string-names.mjs";
import "./tests-import-attributes.mjs";
import "./tests-using.mjs";
import "./tests-commonjs.mjs";
import * as acorn from "../acorn/src/index.js";
import * as acorn_loose from "../acorn-loose/src/index.js";

var htmlLog = typeof document === "object" && document.getElementById('log');
var htmlGroup = htmlLog;

function group(name) {
  if (htmlGroup) {
    var parentGroup = htmlGroup;
    htmlGroup = document.createElement("ul");
    var item = document.createElement("li");
    item.textContent = name;
    item.appendChild(htmlGroup);
    parentGroup.appendChild(item);
  }
  if (typeof console === "object" && console.group) {
    console.group(name);
  }
}

function groupEnd() {
  if (htmlGroup) {
    htmlGroup = htmlGroup.parentElement.parentElement;
  }
  if (typeof console === "object" && console.groupEnd) {
    console.groupEnd(name);
  }
}

function log(title, message) {
  if (htmlGroup) {
    var elem = document.createElement("li");
    elem.innerHTML = "<b>" + title + "</b> " + message;
    htmlGroup.appendChild(elem);
  }
  if (typeof console === "object") console.log(title, message);
}

var stats, modes = {
  Normal: {
    config: {
      parse: acorn.parse
    }
  },
  Loose: {
    config: {
      parse: acorn_loose.parse,
      loose: true,
      filter: function (test) {
        var opts = test.options || {};
        return opts.loose !== false;
      }
    }
  },

  // Test whether the test for `sourceType: 'script'` produces the same result for `'commonjs'`.
  'Normal with sourceType: commonjs': {
    config: {
      parse: (code, option) => acorn.parse(code, Object.assign({}, option, { sourceType: 'commonjs' })),
      filter: function (test) {
        var opts = test.options || {};
        return opts.commonjs !== false && !opts.allowAwaitOutsideFunction && (!opts.sourceType || opts.sourceType === 'script');
      }
    }
  },
  'Loose with sourceType: commonjs': {
    config: {
      parse: (code, option) => acorn_loose.parse(code, Object.assign({}, option, { sourceType: 'commonjs' })),
      loose: true,
      filter: function (test) {
        var opts = test.options || {};
        if (opts.loose === false) return false;
        return opts.commonjs !== false && !opts.allowAwaitOutsideFunction && (!opts.sourceType || opts.sourceType === 'script');
      }
    }
  }
};

function report(state, code, message) {
  if (state !== "ok") {++stats.failed; log(code, message);}
  ++stats.testsRun;
}

group("Errors");

for (var name in modes) {
  group(name);
  var mode = modes[name];
  stats = mode.stats = {testsRun: 0, failed: 0};
  var t0 = +new Date;
  driver.runTests(mode.config, report);
  mode.stats.duration = +new Date - t0;
  groupEnd();
}

groupEnd();

function outputStats(name, stats) {
  log(name + ":", stats.testsRun + " tests run in " + stats.duration + "ms; " +
    (stats.failed ? stats.failed + " failures." : "all passed."));
}

var total = {testsRun: 0, failed: 0, duration: 0};

group("Stats");

for (var name in modes) {
  var stats = modes[name].stats;
  outputStats(name + " parser", stats);
  for (var key in stats) total[key] += stats[key];
}

outputStats("Total", total);

groupEnd();

if (total.failed && typeof process === "object") {
  process.stdout.write("", function() {
    process.exit(1);
  });
}
