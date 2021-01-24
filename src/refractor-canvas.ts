import { RefractorNode } from "refractor";
import { Options, RefractorTheme } from "./refractor-canvas.types";

export function refractorCanvas(
  tokens: RefractorNode[],
  {
    context,
    theme,
  }: {
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    theme: RefractorTheme;
    width: number;
    height: number;
  }
) {
  context.font = `${theme.fontSize}px ` + theme.text.fontFamily;
  context.fillStyle = 'red';
  context.textBaseline = "middle";

  tokens.reduce(chunk, []).reduce<Options>(render, {
    line: 0,
    char: 0,
    charWidth: context.measureText("a").width,
    lineHeight: theme.lineHeight,
    context,
    theme,
  });
}

function chunk(acc: RefractorNode[], token: RefractorNode): RefractorNode[] {
  if (token.type === "text") {
    if (token.value.includes("\n") && token.value !== "\n") {
      token.value.split("\n").forEach((chunk, i, chunks) => {
        if (i > 0 && i <= chunks.length - 1) {
          acc.push({ type: "text", value: "\n" });
        }
        acc.push({ type: "text", value: chunk });
      });
    } else {
      acc.push(token);
    }
  }

  if (token.type === "element") {
    token.children = token.children.reduce(chunk, []);
    acc.push(token);
  }

  return acc;
}

function render(options: Options, token: RefractorNode) {
  if (token.type === "text") {
    if (token.value === "\n") {
      options.line += 1;
      options.char = 0;
    }

    options.context.fillText(
      token.value,
      options.char * options.charWidth,
      Math.ceil(options.line * options.lineHeight + options.lineHeight / 2) + 1
    );

    if (token.value !== "\n") {
      options.char += token.value.length;
    }

    return options;
  }

  if (token.type === "element") {
    const tokenName =
      token.properties.className[0] === "token"
        ? token.properties.className[1]
        : undefined;
    const style = options.theme.tokens[tokenName] || {};

    options.context.fillStyle = style.color;
    const childrenOptions = token.children.reduce<Options>(render, options);

    options.context.font = options.theme.text.fontFamily;
    options.context.fillStyle = options.theme.text.color;

    return childrenOptions;
  }
}
