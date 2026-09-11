// components/RenderMath.jsx
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

/* ---------------- NORMALIZER ---------------- */

const GREEK_MAP = {
  α: "alpha", β: "beta", γ: "gamma", δ: "delta", ε: "epsilon",
  ζ: "zeta", η: "eta", θ: "theta", ι: "iota", κ: "kappa",
  λ: "lambda", μ: "mu", ν: "nu", ξ: "xi", ο: "omicron",
  π: "pi", ρ: "rho", σ: "sigma", τ: "tau", υ: "upsilon",
  φ: "phi", χ: "chi", ψ: "psi", ω: "omega",

  Α: "Alpha", Β: "Beta", Γ: "Gamma", Δ: "Delta", Ε: "Epsilon",
  Ζ: "Zeta", Η: "Eta", Θ: "Theta", Ι: "Iota", Κ: "Kappa",
  Λ: "Lambda", Μ: "Mu", Ν: "Nu", Ξ: "Xi", Ο: "Omicron",
  Π: "Pi", Ρ: "Rho", Σ: "Sigma", Τ: "Tau", Υ: "Upsilon",
  Φ: "Phi", Χ: "Chi", Ψ: "Psi", Ω: "Omega",
};

const SUP_MAP = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
};

const SUB_MAP = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
  "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
};

function normalizeToLatex(input) {
  let t = (input || "").trim();

  // IMPORTANT:
  // Fix double escaped LaTeX delimiters coming from Excel/JSON/database.
  t = t
    .replace(/\\\\\(/g, "\\(")
    .replace(/\\\\\)/g, "\\)")
    .replace(/\\\\\[/g, "\\[")
    .replace(/\\\\\]/g, "\\]");

  // Greek letters
  t = t.replace(
    /[α-ωΑ-Ω]/g,
    ch => `\\${GREEK_MAP[ch] || ch} `
  );

  // Common symbols
  t = t
    .replace(/∞/g, "\\infty ")
    .replace(/≤/g, "\\le ")
    .replace(/≥/g, "\\ge ")
    .replace(/≠/g, "\\ne ")
    .replace(/≈/g, "\\approx ")
    .replace(/→/g, "\\to ")
    .replace(/×/g, "\\times ")
    .replace(/÷/g, "\\div ")
    .replace(/·/g, "\\cdot ");

  // Superscripts: x²³ → x^{23}
  t = t.replace(
    /([a-zA-Z0-9\)])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,
    (_, base, pows) => {
      const digits = Array.from(pows)
        .map(c => SUP_MAP[c] || "")
        .join("");

      return digits ? `${base}^{${digits}}` : base;
    }
  );

  // Subscripts: x₁₂ → x_{12}
  t = t.replace(
    /([a-zA-Z])([₀₁₂₃₄₅₆₇₈₉]+)/g,
    (_, base, subs) => {
      const digits = Array.from(subs)
        .map(c => SUB_MAP[c] || "")
        .join("");

      return digits ? `${base}_{${digits}}` : base;
    }
  );

  // √(a+b)
  t = t.replace(
    /√\s*\(\s*([^)]+)\s*\)/g,
    "\\sqrt{$1}"
  );

  // √16
  t = t.replace(
    /√\s*([a-zA-Z0-9]+)/g,
    "\\sqrt{$1}"
  );

  // Trigonometry & logs
  t = t.replace(
    /\b(sin|cos|tan|cot|sec|csc|cosec|log|ln)\s*\(?\s*([a-zA-Z0-9]+)\s*\)?/gi,
    (_, fn, arg) => `\\${fn}(${arg})`
  );

  // Absolute value
  t = t.replace(
    /\|([^|]+)\|/g,
    "\\left|$1\\right|"
  );

  // Integral
  t = t.replace(
    /∫\s*([^d]+?)\s*d([a-zA-Z])/g,
    "\\int $1 \\, d$2"
  );

  // Summation
  t = t.replace(
    /Σ\s*([a-zA-Z])\s*=\s*([0-9]+)\s*to\s*([a-zA-Z0-9]+)/gi,
    "\\sum_{$1=$2}^{$3} "
  );

  // Limit
  t = t.replace(
    /lim\s*([a-zA-Z])\s*→\s*([a-zA-Z0-9]+)/g,
    "\\lim_{$1 \\to $2} "
  );

  // Simple fraction
  t = t.replace(
    /\b([a-zA-Z0-9]+)\s*\/\s*([a-zA-Z0-9]+)\b/g,
    "\\frac{$1}{$2}"
  );

  return t;
}

/* ---------------- CLEAN LATEX ---------------- */

function cleanLatex(text) {
  let t = (text || "").trim();

  // Convert accidentally double-escaped delimiters
  t = t
    .replace(/\\\\\(/g, "\\(")
    .replace(/\\\\\)/g, "\\)")
    .replace(/\\\\\[/g, "\\[")
    .replace(/\\\\\]/g, "\\]");

  return t;
}

/* ---------------- DETECTOR ---------------- */

function looksLikeMath(text) {
  const t = (text || "").trim();

  if (!t) return false;

  const hasMathChars =
    /[=^√∞≤≥≠≈×÷∫Σ→₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(t);

  const hasOperators =
    /[+\-*/()]/.test(t);

  const wordCount =
    (t.match(/[a-zA-Z]{4,}/g) || []).length;

  return (
    (hasMathChars || hasOperators) &&
    wordCount <= 2
  );
}

/* ---------------- MIXED LATEX ---------------- */

function RenderLatexMixed({ text }) {
  const cleaned = cleanLatex(text);

  /*
   * Supports:
   * $...$
   * $$...$$
   * \(...\)
   * \[...\]
   */

  const blocks = cleaned.split(
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g
  );

  return (
    <>
      {blocks.map((b, i) => {

        // Block math: $$...$$
        if (b.startsWith("$$") && b.endsWith("$$")) {
          const math = b.slice(2, -2).trim();

          return math ? (
            <BlockMath
              key={`block-dollar-${i}`}
              math={math}
            />
          ) : null;
        }

        // Block math: \[...\]
        if (b.startsWith("\\[") && b.endsWith("\\]")) {
          const math = b.slice(2, -2).trim();

          return math ? (
            <BlockMath
              key={`block-bracket-${i}`}
              math={math}
            />
          ) : null;
        }

        // Inline math
        const inlineParts = b.split(
          /(\$[^$]+\$|\\\([\s\S]*?\\\))/g
        );

        return inlineParts.map((p, j) => {

          // $...$
          if (
            p.startsWith("$") &&
            p.endsWith("$") &&
            !p.startsWith("$$")
          ) {
            const math = p.slice(1, -1).trim();

            return math ? (
              <InlineMath
                key={`inline-dollar-${i}-${j}`}
                math={math}
              />
            ) : null;
          }

          // \(...\)
          if (
            p.startsWith("\\(") &&
            p.endsWith("\\)")
          ) {
            const math = p.slice(2, -2).trim();

            return math ? (
              <InlineMath
                key={`inline-bracket-${i}-${j}`}
                math={math}
              />
            ) : null;
          }

          return (
            <span key={`text-${i}-${j}`}>
              {p}
            </span>
          );
        });
      })}
    </>
  );
}

/* ---------------- MAIN ---------------- */

export default function RenderMath({ text }) {
  const raw = (text ?? "").toString().trim();

  if (!raw) return null;

  // Clean accidental double escaping first
  const cleaned = cleanLatex(raw);

  /*
   * Explicit LaTeX:
   *
   * $...$
   * $$...$$
   * \(...\)
   * \[...\]
   */
  if (
    cleaned.includes("$") ||
    cleaned.includes("\\(") ||
    cleaned.includes("\\)") ||
    cleaned.includes("\\[") ||
    cleaned.includes("\\]")
  ) {
    return <RenderLatexMixed text={cleaned} />;
  }

  // Auto-math
  if (looksLikeMath(cleaned)) {
    return (
      <InlineMath
        math={normalizeToLatex(cleaned)}
      />
    );
  }

  // Normal text
  return <span>{cleaned}</span>;
}