import { NextResponse } from "next/server";
import { createFeedback } from "@/lib/feedback";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    await createFeedback({ rating: body.rating, name: body.name, message: body.message });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid feedback";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
