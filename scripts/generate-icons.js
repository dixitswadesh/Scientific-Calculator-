import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Standard App Icon SVG
const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#161e2e"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Base Body -->
  <rect x="32" y="32" width="448" height="448" rx="112" fill="url(#bgGrad)" filter="url(#shadow)"/>
  
  <!-- Subtle border highlight -->
  <rect x="33" y="33" width="446" height="446" rx="111" fill="none" stroke="#334155" stroke-width="2" opacity="0.6"/>

  <!-- Mini Screen -->
  <rect x="80" y="80" width="352" height="100" rx="24" fill="url(#screenGrad)"/>
  <rect x="80" y="80" width="352" height="100" rx="24" fill="none" stroke="#1e293b" stroke-width="2"/>
  
  <!-- Display Text / Equation -->
  <text x="408" y="148" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="700" fill="#38bdf8" text-anchor="end" letter-spacing="2">3.14159</text>
  <text x="104" y="118" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="#64748b">RAD</text>

  <!-- Keypad Grid (3 rows x 4 cols) -->
  <!-- Row 1: C, ( ), %, / -->
  <circle cx="122" cy="236" r="32" fill="#334155"/>
  <text x="122" y="244" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#f8fafc" text-anchor="middle">C</text>

  <circle cx="211" cy="236" r="32" fill="#334155"/>
  <text x="211" y="244" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="#94a3b8" text-anchor="middle">( )</text>

  <circle cx="300" cy="236" r="32" fill="#334155"/>
  <text x="300" y="244" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#94a3b8" text-anchor="middle">%</text>

  <circle cx="389" cy="236" r="32" fill="#f59e0b"/>
  <text x="389" y="244" font-family="system-ui, sans-serif" font-size="26" font-weight="600" fill="#ffffff" text-anchor="middle">÷</text>

  <!-- Row 2: 7, 8, 9, x -->
  <circle cx="122" cy="320" r="32" fill="#1e293b"/>
  <text x="122" y="328" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#f8fafc" text-anchor="middle">7</text>

  <circle cx="211" cy="320" r="32" fill="#1e293b"/>
  <text x="211" y="328" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#f8fafc" text-anchor="middle">8</text>

  <circle cx="300" cy="320" r="32" fill="#1e293b"/>
  <text x="300" y="328" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#f8fafc" text-anchor="middle">9</text>

  <circle cx="389" cy="320" r="32" fill="#f59e0b"/>
  <text x="389" y="328" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#ffffff" text-anchor="middle">×</text>

  <!-- Row 3: 4, 5, 6, - -->
  <circle cx="122" cy="404" r="32" fill="#1e293b"/>
  <text x="122" y="412" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#f8fafc" text-anchor="middle">4</text>

  <circle cx="211" cy="404" r="32" fill="#1e293b"/>
  <text x="211" y="412" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#f8fafc" text-anchor="middle">5</text>

  <circle cx="300" cy="404" r="32" fill="#1e293b"/>
  <text x="300" y="412" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#f8fafc" text-anchor="middle">6</text>

  <!-- Row 3 Op: = in vibrant pill -->
  <rect x="357" y="372" width="64" height="64" rx="32" fill="url(#accentGrad)"/>
  <text x="389" y="412" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="#ffffff" text-anchor="middle">=</text>
</svg>`;

// 2. Maskable Icon SVG (with 18% safe-zone margin full bleed)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="mBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="mAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
  </defs>

  <!-- Full Bleed Background -->
  <rect width="512" height="512" fill="url(#mBg)"/>

  <!-- Centered Safe Zone Graphic (Within 380x380 px) -->
  <g transform="translate(66, 66)">
    <!-- Body -->
    <rect x="0" y="0" width="380" height="380" rx="72" fill="#1e293b"/>
    <!-- Screen -->
    <rect x="36" y="36" width="308" height="84" rx="20" fill="#090d16"/>
    <text x="320" y="94" font-family="system-ui, sans-serif" font-size="38" font-weight="700" fill="#38bdf8" text-anchor="end">3.1415</text>
    <text x="56" y="68" font-family="system-ui, sans-serif" font-size="14" font-weight="500" fill="#64748b">CALC</text>

    <!-- Keypad -->
    <circle cx="70" cy="180" r="26" fill="#334155"/>
    <text x="70" y="187" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#f8fafc" text-anchor="middle">C</text>

    <circle cx="150" cy="180" r="26" fill="#334155"/>
    <text x="150" y="187" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="#94a3b8" text-anchor="middle">( )</text>

    <circle cx="230" cy="180" r="26" fill="#334155"/>
    <text x="230" y="187" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="#94a3b8" text-anchor="middle">%</text>

    <circle cx="310" cy="180" r="26" fill="#f59e0b"/>
    <text x="310" y="187" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="#ffffff" text-anchor="middle">÷</text>

    <circle cx="70" cy="250" r="26" fill="#0f172a"/>
    <text x="70" y="257" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#f8fafc" text-anchor="middle">7</text>

    <circle cx="150" cy="250" r="26" fill="#0f172a"/>
    <text x="150" y="257" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#f8fafc" text-anchor="middle">8</text>

    <circle cx="230" cy="250" r="26" fill="#0f172a"/>
    <text x="230" y="257" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#f8fafc" text-anchor="middle">9</text>

    <circle cx="310" cy="250" r="26" fill="#f59e0b"/>
    <text x="310" y="257" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#ffffff" text-anchor="middle">×</text>

    <circle cx="70" cy="320" r="26" fill="#0f172a"/>
    <text x="70" y="327" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#f8fafc" text-anchor="middle">4</text>

    <circle cx="150" cy="320" r="26" fill="#0f172a"/>
    <text x="150" y="327" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#f8fafc" text-anchor="middle">5</text>

    <circle cx="230" cy="320" r="26" fill="#0f172a"/>
    <text x="230" y="327" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#f8fafc" text-anchor="middle">6</text>

    <circle cx="310" cy="320" r="26" fill="url(#mAccent)"/>
    <text x="310" y="327" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="#ffffff" text-anchor="middle">=</text>
  </g>
</svg>`;

async function run() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg);
  console.log('Saved icon.svg');

  // Generate 512x512
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Saved pwa-512x512.png');

  // Generate 192x192
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Saved pwa-192x192.png');

  // Generate Apple Touch Icon 180x180
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Saved apple-touch-icon.png');

  // Generate Maskable 512x512
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Saved pwa-maskable-512x512.png');
}

run().catch(console.error);
