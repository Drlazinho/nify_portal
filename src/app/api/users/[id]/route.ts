import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { hashPassword } from "@/src/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nickname: true,
      whatsapp: true,
      realName: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { nickname, whatsapp, realName, role, password } = body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const data: {
      nickname?: string;
      whatsapp?: string | null;
      realName?: string | null;
      role?: "ADMIN" | "USER";
      passwordHash?: string;
    } = {};

    if (nickname !== undefined) {
      const trimmed = nickname?.trim()?.toLowerCase();
      if (!trimmed) {
        return NextResponse.json({ error: "Nickname não pode ser vazio." }, { status: 400 });
      }
      const duplicate = await prisma.user.findFirst({
        where: { nickname: trimmed, NOT: { id } },
      });
      if (duplicate) {
        return NextResponse.json({ error: "Este nickname já está em uso." }, { status: 409 });
      }
      data.nickname = trimmed;
    }
    if (whatsapp !== undefined) data.whatsapp = whatsapp?.trim() || null;
    if (realName !== undefined) data.realName = realName?.trim() || null;
    if (role === "ADMIN" || role === "USER") data.role = role;

    if (role === "ADMIN" && password) {
      data.passwordHash = await hashPassword(password);
    } else if (password && password.trim()) {
      data.passwordHash = await hashPassword(password);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        nickname: true,
        whatsapp: true,
        realName: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao atualizar usuário." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { id } = await params;
  if (id === session.id) {
    return NextResponse.json(
      { error: "Você não pode excluir sua própria conta." },
      { status: 400 }
    );
  }
  await prisma.user.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
