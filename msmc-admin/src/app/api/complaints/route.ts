import { NextRequest, NextResponse } from "next/server";
import { createComplaint, listComplaintsForCitizen } from "@/lib/complaints";
import type { ComplaintCategory } from "@/generated/prisma/client";

const VALID_CATEGORIES: ComplaintCategory[] = [
  "DOCUMENTS",
  "EDUCATION",
  "SCHEME_DELAY",
  "CORRUPTION",
  "OTHER",
];

/**
 * Citizen-facing API for the Flutter app. Not wired into the app yet (see
 * the project plan — Flutter still uses local mock data); this exists so
 * the endpoint is ready when that phase starts.
 *
 * Real citizen auth (phone + OTP) doesn't exist yet either, so GET is
 * filtered by a `mobile` query param as a placeholder rather than a session
 * — replace with a citizen JWT/session check once OTP login is built.
 */
export async function GET(request: NextRequest) {
  const mobile = request.nextUrl.searchParams.get("mobile");
  if (!mobile) {
    return NextResponse.json({ error: "mobile query param is required" }, { status: 400 });
  }
  const complaints = await listComplaintsForCitizen(mobile);
  return NextResponse.json({ complaints });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fullName, mobile, category, description } = body;

  if (!fullName || typeof fullName !== "string") {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }
  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return NextResponse.json({ error: "mobile must be a valid 10-digit number" }, { status: 400 });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: `category must be one of ${VALID_CATEGORIES.join(", ")}` }, { status: 400 });
  }
  if (!description || typeof description !== "string" || description.trim().length < 10) {
    return NextResponse.json({ error: "description must be at least 10 characters" }, { status: 400 });
  }

  const result = await createComplaint({ fullName, mobile, category, description });
  return NextResponse.json(result, { status: 201 });
}
