import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

const ROOT = join(import.meta.dirname, '..');

function iconSVG(size) {
  const vw = 24;
  const scale = size / vw;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${vw} ${vw}">
  <defs>
    <clipPath id="c">
      <rect x="0" y="0" width="${vw}" height="${vw}" rx="${vw * 5 / 32}" />
    </clipPath>
  </defs>
  <rect x="0" y="0" width="${vw}" height="${vw}" rx="${vw * 5 / 32}" fill="#2563eb" clip-path="url(#c)"/>
  <g transform="scale(${scale})">
    <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344" fill="none" stroke="#F5F5F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="m9 11 3 3L22 4" fill="none" stroke="#F5F5F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

function splashSVG(width, height) {
  const iconSize = Math.min(width, height) * 0.3;
  const cx = width / 2;
  const cy = height / 2;
  const iconSvg = iconSVG(iconSize);
  // Extract viewBox content and place it centered
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="0" y="0" width="${width}" height="${height}" fill="#2563eb"/>
  <g transform="translate(${cx - iconSize/2}, ${cy - iconSize/2})">
    ${iconSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
  </g>
</svg>`;
}

async function render(svg, size) {
  return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
}

async function renderExact(svg, w, h) {
  return sharp(Buffer.from(svg)).resize(w, h).png().toBuffer();
}

async function main() {
  // Web / PWA icons
  console.log('Generating PWA icons...');
  for (const size of [192, 512]) {
    const svg = iconSVG(size);
    const buf = await render(svg, size);
    writeFileSync(join(ROOT, 'public', `icon-${size}.png`), buf);
    console.log(`  public/icon-${size}.png (${size}x${size})`);
  }

  // Android mipmap legacy icons (pre-API 26)
  const densities = [
    { name: 'mdpi', size: 48 },
    { name: 'hdpi', size: 72 },
    { name: 'xhdpi', size: 96 },
    { name: 'xxhdpi', size: 144 },
    { name: 'xxxhdpi', size: 192 },
  ];

  for (const { name, size } of densities) {
    const dir = join(ROOT, 'android', 'app', 'src', 'main', 'res', `mipmap-${name}`);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const svg = iconSVG(size);
    const buf = await render(svg, size);

    for (const variant of ['ic_launcher', 'ic_launcher_round', 'ic_launcher_foreground']) {
      const p = join(dir, `${variant}.png`);
      writeFileSync(p, buf);
      console.log(`  ${p.replace(ROOT, '')} (${size}x${size})`);
    }
  }

  // Also create mipmap-anydpi-v26/ic_launcher_foreground.xml (vector)
  const v26Dir = join(ROOT, 'android', 'app', 'src', 'main', 'res', 'mipmap-anydpi-v26');
  if (!existsSync(v26Dir)) mkdirSync(v26Dir, { recursive: true });
  const vectorXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">

    <group
        android:scaleX="4.5"
        android:scaleY="4.5"
        android:translateX="0"
        android:translateY="0">

        <path
            android:pathData="M21,10.656 V19 a2,2 0,0 1 -2,2 H5 a2,2 0,0 1 -2,-2 V5 a2,2 0,0 1 2,-2 h12.344"
            android:fillColor="#00000000"
            android:strokeColor="#F5F5F5"
            android:strokeWidth="2"
            android:strokeLineCap="round"
            android:strokeLineJoin="round" />

        <path
            android:pathData="m9,11 l3,3 L22,4"
            android:fillColor="#00000000"
            android:strokeColor="#F5F5F5"
            android:strokeWidth="2"
            android:strokeLineCap="round"
            android:strokeLineJoin="round" />

    </group>

</vector>`;
  writeFileSync(join(v26Dir, 'ic_launcher_foreground.xml'), vectorXml);
  console.log(`  res/mipmap-anydpi-v26/ic_launcher_foreground.xml (vector)`);

  // Android splash screens
  const splashSizes = [
    { dir: 'drawable-land-hdpi',  w: 800,  h: 480 },
    { dir: 'drawable-land-mdpi',  w: 480,  h: 320 },
    { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
    { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
    { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280 },
    { dir: 'drawable-port-hdpi',  w: 480,  h: 800 },
    { dir: 'drawable-port-mdpi',  w: 320,  h: 480 },
    { dir: 'drawable-port-xhdpi', w: 720,  h: 1280 },
    { dir: 'drawable-port-xxhdpi', w: 960,  h: 1600 },
    { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
    { dir: 'drawable', w: 480, h: 480 },
  ];

  console.log('Generating splash screens...');
  for (const { dir: d, w, h } of splashSizes) {
    const dir = join(ROOT, 'android', 'app', 'src', 'main', 'res', d);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const svg = splashSVG(w, h);
    const buf = await renderExact(svg, w, h);
    writeFileSync(join(dir, 'splash.png'), buf);
    console.log(`  res/${d}/splash.png (${w}x${h})`);
  }

  console.log('Done!');
}

main().catch(console.error);
