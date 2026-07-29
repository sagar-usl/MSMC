import { NextRequest } from "next/server";
import { createFeedback } from "@/lib/feedback";
import { corsJson, corsOptions } from "@/lib/api-cors";
import { isRateLimited, clientIpFromHeaders } from "@/lib/rate-limit";

export function OPTIONS() { return corsOptions(); }

export async function POST(request: NextRequest) {
  const ip = clientIpFromHeaders(request.headers);
  if (isRateLimited(`feedback:${ip}`, 10, 15 * 60 * 1000)) {
    return corsJson({ error: "Too much feedback submitted. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return corsJson({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.mobile || !/^[0-9]{10}$/.test(body.mobile)) {
    return corsJson({ error: "mobile must be a valid 10-digit number" }, { status: 400 });
  }

  try {
    await createFeedback({
      rating: body.rating,
      name: body.name,
      message: body.message,
      mobile: body.mobile,
    });
    return corsJson({ ok: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid feedback";
    return corsJson({ error: message }, { status: 400 });
  }
}
