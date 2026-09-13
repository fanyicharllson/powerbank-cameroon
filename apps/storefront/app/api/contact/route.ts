import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const contactMessage = await prisma.contactMessage.create({
    data: { name, email, phone: phone || null, subject, message },
  });

  return NextResponse.json({ id: contactMessage.id }, { status: 201 });
}
