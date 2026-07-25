import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFile } from "node:fs/promises";

const SRC = "assets/icon.svg";

async function main() {
  await sharp(SRC).resize(192, 192).png().toFile("public/icon-192.png");
  console.log("icon-192.png gerado");

  await sharp(SRC).resize(512, 512).png().toFile("public/icon-512.png");
  console.log("icon-512.png gerado");

  // Fundo do SVG já é sólido (#6d1f2b), por isso o PNG resultante já não tem
  // transparência — só falta garantir o tamanho exato exigido pelo iOS.
  await sharp(SRC)
    .resize(180, 180)
    .flatten({ background: "#6d1f2b" })
    .png()
    .toFile("public/apple-touch-icon.png");
  console.log("apple-touch-icon.png gerado");

  const sizes = [16, 32, 48];
  const buffers = await Promise.all(
    sizes.map((size) => sharp(SRC).resize(size, size).png().toBuffer())
  );
  const icoBuffer = await pngToIco(buffers);
  await writeFile("src/app/favicon.ico", icoBuffer);
  console.log("favicon.ico gerado");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
