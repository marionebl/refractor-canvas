#!/usr/bin/env node
const Fs = require("fs");
const Path = require("path");
const css = require("css");
const scalpel = require("scalpel");
const { isToken } = require("typescript");

const themesDir = Path.resolve(require.resolve("prism-themes"), "..", "themes");
const selectorParser = scalpel.createParser();

const PROPERTIES = [
  "color",
  "background",
  "font-style",
  "font-weight",
  "text-decoration",
  "opacity",
  "border-bottom",
  "text-shadow",
  "font-family",
];

const camelCase = (input) =>
  (input.slice(0, 1).toLowerCase() + input.slice(1))
    .replace(/([-_ ]){1,}/g, " ")
    .split(/[-_ ]/)
    .reduce((cur, acc) => cur + acc[0].toUpperCase() + acc.substring(1));

const parseSelector = (s) => {
  try {
    return selectorParser.parse(s);
  } catch (err) {
    return undefined;
  }
};

const isTokenSelector = (selector) => {
  const first = selector.find((s) => s.type === "selector");
  const maybeTokenClass = first ? first.body[0] : undefined;
  const maybeTokenName = first ? first.body[1] : undefined;

  if (
    !maybeTokenClass ||
    maybeTokenClass.type !== "classSelector" ||
    maybeTokenClass.name !== "token"
  ) {
    return false;
  }

  if (!maybeTokenName || maybeTokenName.type !== "classSelector") {
    return false;
  }

  return true;
};

const isOverrideSelector = (selector) => {
  const first = selector.find((s) => s.type === "selector");
  const last = selector[selector.length - 1];
  const maybeLanguageName = first ? first.body[0] : undefined;

  if (maybeLanguageName && maybeLanguageName.type === "typeSelector") {
    return isOverrideSelector([
      { ...first, body: first.body.slice(1) },
      ...selector.slice(1),
    ]);
  }

  if (
    last &&
    maybeLanguageName &&
    maybeLanguageName.type === "classSelector" &&
    maybeLanguageName.name.startsWith("language-")
  ) {
    return isTokenSelector([last]);
  }

  if (
    last &&
    maybeLanguageName &&
    maybeLanguageName.type === "attributeValueSelector" &&
    maybeLanguageName.name === "class" &&
    maybeLanguageName.value.startsWith("language-")
  ) {
    return isTokenSelector([last]);
  }

  return false;
};

const getOverrides = (selector) => {
  const first = selector.find((s) => s.type === "selector");
  const maybeLanguageName = first ? first.body[0] : undefined;

  if (maybeLanguageName && maybeLanguageName.type === "typeSelector") {
    return getOverrides([
      { ...first, body: first.body.slice(1) },
      ...selector.slice(1),
    ]);
  }

  if (
    maybeLanguageName &&
    maybeLanguageName.type === "classSelector" &&
    maybeLanguageName.name.startsWith("language-")
  ) {
    return [
      {
        type: "language",
        value: maybeLanguageName.name.replace(/^language-/, ""),
      },
      ...getOverrides(selector.slice(selector.indexOf(first) + 1)),
    ];
  }

  if (first && isTokenSelector([first])) {
    return [
      {
        type: "token",
        value: getTokenName([first]),
      },
      ...getOverrides(selector.slice(selector.indexOf(first) + 1)),
    ];
  }

  return [];
};

const getTokenName = (selector) => {
  const first = selector.find((s) => s.type === "selector");
  const maybeTokenClass = first ? first.body[0] : undefined;
  const maybeTokenName = first ? first.body[1] : undefined;

  if (
    !maybeTokenClass ||
    maybeTokenClass.type !== "classSelector" ||
    maybeTokenClass.name !== "token"
  ) {
    return getTokenName(selector.slice(1));
  }

  if (!maybeTokenName || maybeTokenName.type !== "classSelector") {
    return;
  }

  return maybeTokenName.name;
};

const getStyles = (rule) => {
  return rule.declarations
    .filter((d) => d.type === "declaration")
    .reduce((acc, declaration) => {
      if (PROPERTIES.includes(declaration.property)) {
        acc[camelCase(declaration.property)] = declaration.value;
      }
      return acc;
    }, {});
};

Fs.readdirSync(themesDir)
  .map((fileName) => ({
    theme: Path.basename(fileName, Path.extname(fileName)),
    source: css.parse(Fs.readFileSync(Path.join(themesDir, fileName), "utf-8"))
      .stylesheet.rules,
  }))
  .map((data) => {
    const result = data.source
      .filter((rule) => rule.type === "rule")
      .reduce(
        (acc, rule) => {
          // code[class*="language-"],
          // pre[class*="language-"]
          if (
            rule.selectors.includes('code[class*="language-"]') &&
            rule.selectors.includes('code[class*="language-"]')
          ) {
            acc.text = getStyles(rule);
            return acc;
          }

          rule.selectors
            .map(parseSelector)
            .filter(Boolean)
            .forEach((selector, i) => {
              // token.$name
              if (isTokenSelector(selector)) {
                const tokenName = getTokenName(selector);
                const tokenStyles = getStyles(rule);
                acc.tokens[tokenName] = tokenStyles;
              } else if (isOverrideSelector(selector)) {
                const tokenName = getTokenName(selector);
                const overrides = getOverrides(selector);
                const style = getStyles(rule);
                acc.overrides[tokenName] = {
                  overrides,
                  style,
                };
              }

              return acc;
            }, {});

          return acc;
        },
        { tokens: {}, overrides: {} }
      );

    return { ...data, result };
  })
  .map((data) => {
    Fs.writeFileSync(
      `./themes/${data.theme}.json`,
      JSON.stringify(data.result, null, "  ")
    );
  });
