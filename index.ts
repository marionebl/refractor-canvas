import refractor from "refractor/core";
import { refractorCanvas } from "./src/refractor-canvas";
import theme from "./themes/prism-vsc-dark-plus.json";

async function main() {
  const fullTheme = {...theme, fontSize: 20, lineHeight: 30 };

  const area = document.querySelector<HTMLTextAreaElement>(".code");
  area.style.font = theme.text.fontFamily;
  area.style.background = 'black';
  area.style.fontSize = fullTheme.fontSize + 'px';
  area.style.lineHeight = fullTheme.lineHeight + 'px';
  area.style.caretColor = theme.text.color;

  const syntax = await import("refractor/lang/typescript");
  refractor.register(syntax.default);

  const width = document.body.clientWidth;
  const height = document.body.clientHeight;

  const canvas = document.createElement("canvas");
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  canvas.width = Math.floor(width * devicePixelRatio);
  canvas.height = Math.floor(height * devicePixelRatio);

  const context = canvas.getContext("2d");
  context.scale(devicePixelRatio, devicePixelRatio);

  const tokens = refractor.highlight(area.value, "ts");
  refractorCanvas(tokens, { context, theme: fullTheme });

  document.body.append(canvas);

  area.addEventListener("input", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    refractorCanvas(refractor.highlight(area.value, "ts"), { context, theme: fullTheme });
  });
}

document.addEventListener("DOMContentLoaded", main);
