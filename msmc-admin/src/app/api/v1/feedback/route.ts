import { NextRequest } from "next/server";
import { createFeedback } from "@/lib/feedback";
import { corsJson, corsOptions } from "@/lib/api-cors";

export function OPTIONS() { return corsOptions(); }

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return corsJson({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    await createFeedback({
      rating: body.rating,
      name: body.name,
      message: body.message,
    });
    return corsJson({ ok: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid feedback";
    return corsJson({ error: message }, { status: 400 });
  }
}
