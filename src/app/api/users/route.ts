import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nickname: true,
      whatsapp: true,
      realName: true,
      role: true,
      createdAt: true,
    },
  });
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { nickname, whatsapp, realName } = body;
    if (!nickname?.trim()) {
      return NextResponse.json(
        { error: "Nickname é obrigatório." },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findUnique({
      where: { nickname: nickname.trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Este nickname já está em uso." },
        { status: 409 }
      );
    }
    const user = await prisma.user.create({
      data: {
        nickname: nickname.trim().toLowerCase(),
        whatsapp: whatsapp?.trim() || null,
        realName: realName?.trim() || null,
        role: "USER",
      },
    });
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar usuário." }, { status: 500 });
  }
}
