import { NextResponse } from "next/server";
import JSZip from "jszip";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/**
 * Generates press kit ZIP on the fly — logos + key art + boilerplate txt.
 * Used by /press page "Download all" button.
 */
export async function GET() {
  const zip = new JSZip();

  // Brand assets
  const assets = [
    "public/assets/Logo.svg",
    "public/assets/Dragon.svg",
    "public/assets/email/logo-paper.png",
    "public/assets/email/logo-ink.png",
    "public/assets/email/dragon.png",
    "public/assets/img/hero.jpg",
    "public/assets/img/concept-1.jpg",
    "public/assets/img/concept-2.jpg",
    "public/assets/img/concept-3.jpg",
    "public/assets/img/studio.jpg",
    "public/assets/og.png",
  ];

  for (const rel of assets) {
    try {
      const full = path.join(/* turbopackIgnore: true */ process.cwd(), rel);
      const data = await fs.readFile(full);
      // Keep folder structure inside zip
      const zipPath = rel.replace("public/", "");
      zip.file(zipPath, data);
    } catch {}
  }

  // Add boilerplate txt
  const boilerplate = `Spectre Rex Studios — Press Kit
=================================

Short:
Spectre Rex Studios is an independent game development studio in Gurugram, India, crafting original games, game art, and digital experiences — bold ideas, built pixel by pixel.

Long:
Spectre Rex Studios is an independent game development studio based in Gurugram, India. Founded in 2026, the studio builds original games, game art, and the strange digital experiences between them — from tight systems and sharp craft to the details most people never notice.

The studio works two ways: as an independent outfit shipping its own worlds, and as a boutique team taking on game development, art direction, and web experience work. Every project starts as a handful of pixels and a question nobody asked.

Its mascot — a pixel dragon of unknown temperament — guards an egg of unspecified contents.

Facts:
Founded: 2026
Status: Independent
Based: Gurugram, Haryana, India
CIN: U58203HR2026PTC147441
Team: Ishant Kumar · Rashi · Amul · Sushant
Press: press@spectrerex.com
Site: https://spectrerex.com

Brand colors:
Night #0B1014 — Dark sections & backgrounds
Paper #F2F0EA — Light sections & surfaces
Ink #242424 — Body copy
Spectre #35AEE4 — Brand accent
Ghost #E5F4FC — Blue tint

Typography:
Sora — Display headlines 600·700·800
Inter — Body 400·500·600
Pixelify Sans — Pixel labels 400·500·600·700

Contact: press@spectrerex.com
`;

  zip.file("BOILERPLATE.txt", boilerplate);
  zip.file("README.txt", "Press kit for Spectre Rex Studios — https://spectrerex.com/press\nAll logos and key art included.\nContact: press@spectrerex.com\n");

  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  return new NextResponse(buffer as any, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="spectre-rex-press-kit.zip"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
