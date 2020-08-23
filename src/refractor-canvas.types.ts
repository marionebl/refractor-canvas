export interface Options {
  line: number;
  char: number;
  charWidth: number;
  lineHeight: number;
  theme: RefractorTheme;
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
}

export interface RefractorTokenStyle {
  background?: string;
  borderBottom?: string;
  color?: string;
  fontFamily?: string;
  fontStyle?: string;
  fontWeight?: string;
  opacity?: string;
  textDecoration?: string;
  textShadow?: string;
}

export type RefractorToken =
  | "comment"
  | "prolog"
  | "doctype"
  | "cdata"
  | "punctuation"
  | "property"
  | "tag"
  | "constant"
  | "symbol"
  | "deleted"
  | "boolean"
  | "number"
  | "selector"
  | "attr-name"
  | "string"
  | "char"
  | "builtin"
  | "inserted"
  | "operator"
  | "entity"
  | "url"
  | "variable"
  | "atrule"
  | "attr-value"
  | "function"
  | "keyword"
  | "regex"
  | "important"
  | "bold"
  | "italic"
  | "class-name"
  | "namespace"
  | "control"
  | "directive"
  | "unit"
  | "statement"
  | "placeholder"
  | "hex"
  | "deliminator"
  | "delimiter"
  | "tag-id"
  | "atrule-id"
  | "null"
  | "attribute"
  | "class"
  | "hexcode"
  | "id"
  | "pseudo-class"
  | "pseudo-element"
  | "color"
  | "block-comment"
  | "function-name"
  | "parameter"
  | "interpolation";


export type Override = { type: string; value: string; };

export type RefractorTheme = {
  fontSize: number;
  lineHeight: number;
  text: RefractorTokenStyle;
  tokens: Partial<Record<RefractorToken, RefractorTokenStyle>>;
  overrides: Partial<Record<RefractorToken, { overrides: Override[]; style: RefractorTokenStyle }>>;
};
