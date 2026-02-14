import { setAdminSession, verifyAdminPassword } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, password } = body;
    if (!nickname || !password) {
      return NextResponse.json(
        { error: "Nickname e senha são obrigatórios." },
        { status: 400 }
      );
    }
    const ok = await verifyAdminPassword(nickname, password);
    if (!ok) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { nickname, role: "ADMIN" },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    await setAdminSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao fazer login." }, { status: 500 });
  }
}
