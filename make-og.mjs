import sharp from "sharp";

const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#001e40"/>
      <stop offset="100%" stop-color="#00539b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="60" y="60" width="1080" height="510" rx="24" fill="white" fill-opacity="0.05"/>
  <text x="600" y="260" font-family="Arial,sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">Putik Cemerlang</text>
  <text x="600" y="340" font-family="Arial,sans-serif" font-size="32" fill="#90caf9" text-anchor="middle">Cabang Dinas Kelautan dan Perikanan</text>
  <text x="600" y="390" font-family="Arial,sans-serif" font-size="32" fill="#90caf9" text-anchor="middle">Kabupaten Malang</text>
  <text x="600" y="470" font-family="Arial,sans-serif" font-size="22" fill="#64b5f6" text-anchor="middle">putik-cemerlang.web.id</text>
</svg>`);

await sharp(svg).png().toFile("client/public/og-image.png");
console.log("✓ og-image.png created");
