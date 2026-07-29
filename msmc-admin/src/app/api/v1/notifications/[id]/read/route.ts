import { NextRequest, NextResponse } from "next/server";
import { corsJson, corsOptions } from "@/lib/api-cors";
import { markNotificationReadForCitizen } from "@/lib/notifications";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export function OPTIONS() { return corsOptions(); }

/**
 * POST /api/v1/notifications/:id/read
 * Body: { mobile }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const body = await request.json().catch(() => null);
  const mobile = body?.mobile;
  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return corsJson({ error: "mobile must be a valid 10-digit number" }, { status: 400 });
  }

  try {
    const { id } = await params;
    await markNotificationReadForCitizen(id, mobile);
    return corsJson({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
