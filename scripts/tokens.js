#!/usr/bin/env node
const Fs = require("fs");
const Path = require("path");
const css = require("css");

const themesDir = Path.resolve(require.resolve("prism-themes"), "..", "themes");

const tokens = [...new Set(Fs.readdirSync(themesDir)
  .map((fileName) => Fs.readFileSync(Path.join(themesDir, fileName), "utf-8"))
  .map((contents) => css.parse(contents))
  .flatMap(sheet => sheet.stylesheet.rules)
  .flatMap(rule => rule.selectors)
  .filter(Boolean)
  .filter(selector => selector.startsWith('.token'))
  .map(token => token.replace(/^\.token\./, ''))
  .filter(token => !token.includes(' ') && !token.includes('.')))];

tokens.forEach(token =>  console.log(token));