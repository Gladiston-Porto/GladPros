import { NextResponse } from "next/server";
import { getLastDevMail } from "@/lib/mailer";

export async function GET() {
  if (process.env.NODE_ENV !== "development") return NextResponse.json({ error: "NOT_ALLOWED" }, { status: 403 });
  const mail = getLastDevMail();
  return NextResponse.json({ ok: true, mail }, { status: 200 });
}

