import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
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
    return NextResponse.json({
      id: user.id,
      nickname: user.nickname,
      whatsapp: user.whatsapp,
      realName: user.realName,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao registrar usuário." }, { status: 500 });
  }
}
