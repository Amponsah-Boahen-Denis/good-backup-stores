import { NextRequest, NextResponse } from "next/server";
import { getLogoById } from "@/services/logos";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const logoId = params.id;

    if (!logoId) {
      return NextResponse.json({ error: "Logo ID required" }, { status: 400 });
    }

    const logo = await getLogoById(logoId);

    if (!logo) {
      return NextResponse.json({ error: "Logo not found" }, { status: 404 });
    }

    // Extract base64 from data URL if needed
    const imageData = logo.data.startsWith("data:")
      ? logo.data.split(",")[1]
      : logo.data;

    const buffer = Buffer.from(imageData, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": logo.mimeType,
        "Cache-Control": "public, max-age=86400", // 24 hours
      },
    });
  } catch (error) {
    console.error("Logo retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve logo" },
      { status: 500 }
    );
  }
}
