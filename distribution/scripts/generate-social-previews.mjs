import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { loadCatalog, parseCommonArgs, repositoryRoot, selectTemplates } from "./catalog.mjs";

export const SOCIAL_PREVIEW_WIDTH = 1280;
export const SOCIAL_PREVIEW_HEIGHT = 640;

const outcomeByKind = {
  browser: "Secure browser login with OIDC + PKCE",
  native: "Native sign-in with Authorization Code + PKCE",
  server: "Server-side authentication with OpenID Connect",
};

const accentByKind = {
  browser: "#4d94ff",
  native: "#f2b84b",
  server: "#6ee7b7",
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function titleLines(value, maximumLength = 24) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && candidate.length > maximumLength && lines.length === 0) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

export function renderSocialPreviewSvg(template) {
  const accent = accentByKind[template.kind] ?? accentByKind.browser;
  const outcome = outcomeByKind[template.kind] ?? outcomeByKind.browser;
  const lines = titleLines(template.displayName).map(escapeXml);
  const title = lines
    .map((line, index) => `<tspan x="72" dy="${index === 0 ? 0 : 68}">${line}</tspan>`)
    .join("");
  const outcomeY = lines.length > 1 ? 390 : 330;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SOCIAL_PREVIEW_WIDTH}" height="${SOCIAL_PREVIEW_HEIGHT}" viewBox="0 0 ${SOCIAL_PREVIEW_WIDTH} ${SOCIAL_PREVIEW_HEIGHT}">
  <rect width="1280" height="640" fill="#07111f"/>
  <circle cx="1150" cy="600" r="290" fill="none" stroke="#16314b" stroke-width="92"/>
  <circle cx="1150" cy="600" r="170" fill="none" stroke="#214463" stroke-width="46"/>
  <rect x="40" y="40" width="1200" height="560" rx="28" fill="#f8f4e8"/>
  <path d="M860 40h352a28 28 0 0 1 28 28v504a28 28 0 0 1-28 28H860z" fill="#0e3f3b"/>

  <rect x="72" y="70" width="42" height="42" rx="11" fill="#0e3f3b"/>
  <text x="93" y="99" text-anchor="middle" fill="#f8f4e8" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">t</text>
  <text x="128" y="99" fill="#102b29" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">Tuurio ID</text>
  <rect x="660" y="73" width="158" height="34" rx="17" fill="#ecfdf5" stroke="#a7f3d0"/>
  <circle cx="680" cy="90" r="5" fill="#10b981"/>
  <text x="696" y="96" fill="#065f46" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="1.3">STARTER TEMPLATE</text>

  <text x="72" y="192" fill="#58706d" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="3">TUURIO ID FOR ${escapeXml(template.framework.toUpperCase())}</text>
  <text x="72" y="268" fill="#102b29" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700" letter-spacing="-1.5">${title}</text>
  <text x="72" y="${outcomeY}" fill="#4f6865" font-family="Arial, Helvetica, sans-serif" font-size="25">${escapeXml(outcome)}</text>

  <g transform="translate(72 486)">
    <rect width="170" height="44" rx="22" fill="#ffffff" stroke="#cbd8d4"/>
    <text x="85" y="28" text-anchor="middle" fill="#244c48" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700">OpenID Connect</text>
    <rect x="184" width="96" height="44" rx="22" fill="#ffffff" stroke="#cbd8d4"/>
    <text x="232" y="28" text-anchor="middle" fill="#244c48" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700">PKCE</text>
    <rect x="294" width="124" height="44" rx="22" fill="#ffffff" stroke="#cbd8d4"/>
    <text x="356" y="28" text-anchor="middle" fill="#244c48" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700">Apache-2.0</text>
  </g>

  <g transform="translate(900 112)">
    <text x="0" y="0" fill="#a7f3d0" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" letter-spacing="2">SECURE SIGN-IN FLOW</text>
    <line x1="30" y1="100" x2="250" y2="100" stroke="#87b8ae" stroke-width="3" stroke-dasharray="8 8"/>
    <circle cx="32" cy="100" r="31" fill="#f8f4e8"/>
    <circle cx="140" cy="100" r="31" fill="${accent}"/>
    <circle cx="248" cy="100" r="31" fill="#6ee7b7"/>
    <text x="32" y="106" text-anchor="middle" fill="#0e3f3b" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700">APP</text>
    <text x="140" y="106" text-anchor="middle" fill="#07111f" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700">ID</text>
    <text x="248" y="108" text-anchor="middle" fill="#065f46" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">✓</text>
    <text x="32" y="164" text-anchor="middle" fill="#d2e5df" font-family="Arial, Helvetica, sans-serif" font-size="14">Your app</text>
    <text x="140" y="164" text-anchor="middle" fill="#d2e5df" font-family="Arial, Helvetica, sans-serif" font-size="14">Tuurio ID</text>
    <text x="248" y="164" text-anchor="middle" fill="#d2e5df" font-family="Arial, Helvetica, sans-serif" font-size="14">Signed in</text>
    <rect x="0" y="224" width="280" height="1" fill="#35645e"/>
    <text x="0" y="270" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">Vibe-code the app.</text>
    <text x="0" y="304" fill="${accent}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">Not the security.</text>
    <text x="0" y="374" fill="#a9c6bf" font-family="Arial, Helvetica, sans-serif" font-size="14">EU-hosted identity · Exact redirects</text>
  </g>
</svg>`;
}

export async function writeSocialPreview(template, { root = repositoryRoot } = {}) {
  const targetDirectory = resolve(root, template.source, ".github");
  const svgPath = resolve(targetDirectory, "social-preview.svg");
  const pngPath = resolve(targetDirectory, "social-preview.png");
  const svg = renderSocialPreviewSvg(template);
  mkdirSync(targetDirectory, { recursive: true });
  writeFileSync(svgPath, `${svg}\n`);
  await sharp(Buffer.from(svg))
    .flatten({ background: "#07111f" })
    .png({ compressionLevel: 9, palette: false })
    .toFile(pngPath);
  return { id: template.id, svgPath, pngPath };
}

export async function generateSocialPreviews({ ids = [], root = repositoryRoot } = {}) {
  const templates = selectTemplates(loadCatalog({ root }), ids);
  return Promise.all(templates.map((template) => writeSocialPreview(template, { root })));
}

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  const args = parseCommonArgs(process.argv.slice(2));
  if (args.output || args.apply || args.initialize) {
    throw new Error("Social previews support only optional repeated --id arguments");
  }
  const results = await generateSocialPreviews({ ids: args.ids });
  console.log(JSON.stringify({ generated: results.length, templates: results.map(({ id }) => id) }));
}
