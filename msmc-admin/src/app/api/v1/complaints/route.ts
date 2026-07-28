import { NextRequest, NextResponse } from "next/server";
import { createComplaint, listComplaintsForCitizen } from "@/lib/complaints";
import { corsJson, corsOptions } from "@/lib/api-cors";
import { isRateLimited, clientIpFromHeaders } from "@/lib/rate-limit";
import type { ComplaintCategory } from "@/generated/prisma/client";

const VALID_CATEGORIES: ComplaintCategory[] = [
  "DOCUMENTS",
  "EDUCATION",
  "SCHEME_DELAY",
  "CORRUPTION",
  "OTHER",
];

export function OPTIONS() { return corsOptions(); }

/**
 * GET /api/v1/complaints?mobile=9876543210
 * Returns all complaints filed by this mobile number.
 */
export async function GET(request: NextRequest) {
  const mobile = request.nextUrl.searchParams.get("mobile");
  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return corsJson({ error: "mobile query param must be a valid 10-digit number" }, { status: 400 });
  }
  try {
    const complaints = await listComplaintsForCitizen(mobile);
    return corsJson({ complaints });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const MAX_ATTACHMENTS = 5;

/**
 * POST /api/v1/complaints
 * Body: { fullName, mobile, category, description, attachments? }
 * attachments: [{ fileName, filePath }] — files already uploaded via
 * POST /api/v1/uploads/complaint-attachment, referenced here by filePath.
 * Returns: { ticketId }
 */
export async function POST(request: NextRequest) {
  const ip = clientIpFromHeaders(request.headers);
  if (isRateLimited(`complaint:${ip}`, 5, 15 * 60 * 1000)) {
    return corsJson({ error: "Too many complaints submitted. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return corsJson({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fullName, mobile, category, description, attachments } = body;

  if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
    return corsJson({ error: "fullName is required (min 2 chars)" }, { status: 400 });
  }
  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return corsJson({ error: "mobile must be a valid 10-digit number" }, { status: 400 });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return corsJson(
      { error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }
  if (!description || typeof description !== "string" || description.trim().length < 10) {
    return corsJson({ error: "description must be at least 10 characters" }, { status: 400 });
  }
  if (attachments !== undefined) {
    const isValid =
      Array.isArray(attachments) &&
      attachments.length <= MAX_ATTACHMENTS &&
      attachments.every(
        (a) => a && typeof a.fileName === "string" && typeof a.filePath === "string"
      );
    if (!isValid) {
      return corsJson(
        { error: `attachments must be an array of at most ${MAX_ATTACHMENTS} { fileName, filePath } objects` },
        { status: 400 }
      );
    }
  }

  try {
    const result = await createComplaint({
      fullName: fullName.trim(),
      mobile,
      category,
      description: description.trim(),
      attachments,
    });
    return corsJson(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
