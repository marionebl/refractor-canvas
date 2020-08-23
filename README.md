# refractor-canvas

> Render refractor nodes to canvas

## Installation

```sh
yarn add refractor-canvas
```

## Usage

```ts
import refractor from 'refractor/core';
import ts from 'refractor/lang/typescript';
import { refractorCanvas } from 'refractor-canvas';
import theme from "./themes/prism-vsc-dark-plus.json";

refractor.register(ts);

const canvas = document.createElement("canvas");
const context = canvas.getContext('2d');e

const tokens = refractor.highlight(area.textContent, 'ts');refractorCanvas(tokens, { context, theme });

document.body.append(canvas);
```

## License

MIT - Copyright 2020 Mario Nebl <hello@mario-nebl.de>