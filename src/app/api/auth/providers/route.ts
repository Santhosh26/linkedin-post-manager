// src/app/api/auth/providers/route.ts
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  // Return the configured providers from authOptions
  const providers = authOptions.providers.map(provider => ({
    id: provider.id,
    name: provider.name,
    type: provider.type,
  }));
  
  return NextResponse.json({
    providers,
  });
}