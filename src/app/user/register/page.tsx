"use client";

import { useState } from "react";
import Link from "next/link";

export default function UserRegisterPage() {
  const [nickname, setNickname] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [realName, setRealName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim(), whatsapp: whatsapp.trim(), realName: realName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao registrar.");
        return;
      }
      setSuccess(true);
      setNickname("");
      setWhatsapp("");
      setRealName("");
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div className="container">
        <Link href="/" className="link-back">
          ← Voltar
        </Link>
        <div className="card">
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Cadastro de Usuário</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Preencha seus dados para se registrar. <br />
            Só registra um vez, vamos verificar e manda o link do convite.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="nickname">Nickname *</label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: joao123"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="whatsapp">Número do WhatsApp</label>
              <input
                id="whatsapp"
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 5511999999999"
              />
            </div>
            <div className="input-group">
              <label htmlFor="realName">Nome real</label>
              <input
                id="realName"
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">Cadastro realizado com sucesso!</p>}
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
              {loading ? "Enviando..." : "Registrar"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
