import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const syne = await readFile(join(process.cwd(), "src/assets/fonts/Syne-ExtraBold.ttf"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#212121",
          color: "#a020f0",
          fontFamily: "Syne",
          fontSize: 110,
        }}
      >
        M.
      </div>
    ),
    { ...size, fonts: [{ name: "Syne", data: syne, weight: 800, style: "normal" }] },
  );
}
