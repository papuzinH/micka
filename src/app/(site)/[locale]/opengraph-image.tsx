import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Don Micka de la Vega — Sports Photography";

const SUBTITLE: Record<string, string> = {
  en: "SPORTS PHOTOGRAPHY — WOMEN'S CYCLING",
  fr: "PHOTOGRAPHIE SPORTIVE — CYCLISME FÉMININ",
};

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [syne, photo] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Syne-ExtraBold.ttf")),
    readFile(join(process.cwd(), "public/placeholders/cyclist-road.jpg")),
  ]);
  const bg = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "60px 70px",
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.85) 100%)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Syne" }}>
            <div style={{ fontSize: 92, color: "#a020f0", lineHeight: 1 }}>Don Micka</div>
            <div style={{ fontSize: 92, color: "#ffffff", lineHeight: 1.05 }}>de la Vega</div>
            <div
              style={{
                marginTop: 28,
                width: 160,
                height: 6,
                backgroundColor: "#a020f0",
              }}
            />
            <div style={{ marginTop: 20, fontSize: 28, color: "#ffffff", letterSpacing: 4 }}>
              {SUBTITLE[locale] ?? SUBTITLE.en}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Syne", data: syne, weight: 800, style: "normal" }] },
  );
}
