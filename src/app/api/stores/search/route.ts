import { NextRequest, NextResponse } from "next/server";
import { listStores } from "@/services/userStores";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name")?.toLowerCase().trim();
    const address = searchParams.get("address")?.toLowerCase().trim();

    if (!name) {
      return NextResponse.json(
        { error: "Store name is required" },
        { status: 400 }
      );
    }

    // Get all stores from database
    const stores = await listStores();

    // Filter by name and optional address
    const results = stores.filter((store) => {
      const storeName = store.name.toLowerCase();
      const storeAddress = store.address?.toLowerCase() || "";

      const nameMatch = storeName.includes(name);
      const addressMatch = !address || storeAddress.includes(address);

      return nameMatch && addressMatch;
    });

    // Map to response format
    const formattedResults = results.map((store) => ({
      id: store.id,
      name: store.name,
      category: store.category || null,
      address: store.address,
      phone: store.phone || null,
      email: store.email || null,
      website: store.website || null,
      workingHours: store.workingHours || null,
      lat: store.lat || 0,
      lon: store.lon || 0,
      createdAt: store.createdAt,
    }));

    return NextResponse.json({
      results: formattedResults,
      count: formattedResults.length,
    });
  } catch (error) {
    console.error("Store search error:", error);
    return NextResponse.json(
      { error: "Failed to search stores" },
      { status: 500 }
    );
  }
}
