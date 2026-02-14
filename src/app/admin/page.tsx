"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type User = {
  id: string;
  nickname: string;
  whatsapp: string | null;
  realName: string | null;
  role: string;
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [formNickname, setFormNickname] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formRealName, setFormRealName] = useState("");
  const [formRole, setFormRole] = useState<"USER" | "ADMIN">("USER");
  const [formPassword, setFormPassword] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function loadUsers() {
    const res = await fetch("/api/users");
    if (res.status === 401) {
      setAuthFailed(true);
      return;
    }
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadUsers().finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function openAdd() {
    setShowAdd(true);
    setEditing(null);
    setFormNickname("");
    setFormWhatsapp("");
    setFormRealName("");
    setFormRole("USER");
    setFormPassword("");
    setMessage(null);
  }

  function openEdit(u: User) {
    setEditing(u);
    setShowAdd(false);
    setFormNickname(u.nickname);
    setFormWhatsapp(u.whatsapp || "");
    setFormRealName(u.realName || "");
    setFormRole((u.role as "USER" | "ADMIN") || "USER");
    setFormPassword("");
    setMessage(null);
  }

  function closeModal() {
    setShowAdd(false);
    setEditing(null);
    setMessage(null);
  }

  async function handleAdd() {
    setSubmitLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: formNickname.trim(),
          whatsapp: formWhatsapp.trim() || null,
          realName: formRealName.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Erro ao criar." });
        return;
      }
      closeModal();
      await loadUsers();
      setMessage({ type: "success", text: "Usuário criado." });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: "Erro de conexão." });
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleUpdate() {
    if (!editing) return;
    setSubmitLoading(true);
    setMessage(null);
    try {
      const body: { nickname: string; whatsapp?: string | null; realName?: string | null; role?: string; password?: string } = {
        nickname: formNickname.trim(),
        whatsapp: formWhatsapp.trim() || null,
        realName: formRealName.trim() || null,
        role: formRole,
      };
      if (formPassword.trim()) body.password = formPassword.trim();
      const res = await fetch(`/api/users/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Erro ao atualizar." });
        return;
      }
      closeModal();
      await loadUsers();
      setMessage({ type: "success", text: "Usuário atualizado." });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: "Erro de conexão." });
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este usuário?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadUsers();
      setMessage({ type: "success", text: "Usuário excluído." });
      setTimeout(() => setMessage(null), 3000);
    } else {
      const data = await res.json();
      setMessage({ type: "error", text: data.error || "Erro ao excluir." });
    }
  }

  if (authFailed) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div className="container">
          <div className="card" style={{ textAlign: "center" }}>
            <p style={{ marginBottom: "1rem" }}>Sessão inválida ou expirada.</p>
            <Link href="/admin/login" className="btn btn-primary">
              Fazer login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: "1.5rem" }}>
      <div className="container" style={{ maxWidth: "720px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <Link href="/" className="link-back" style={{ marginBottom: "0.25rem" }}>
              ← Início
            </Link>
            <h1 style={{ fontSize: "1.5rem" }}>Painel Admin</h1>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn btn-primary" onClick={openAdd}>
              Adicionar usuário
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>

        {message && (
          <p className={message.type === "error" ? "error-msg" : "success-msg"} style={{ marginBottom: "1rem" }}>
            {message.text}
          </p>
        )}

        <div className="card">
          {loading ? (
            <p style={{ color: "var(--text-muted)" }}>Carregando...</p>
          ) : users.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>Nenhum usuário cadastrado.</p>
          ) : (
            <ul style={{ listStyle: "none" }}>
              {users.map((u) => (
                <li
                  key={u.id}
                  style={{
                    padding: "0.75rem 0",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <strong>{u.nickname}</strong>
                    {u.role === "ADMIN" && (
                      <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", background: "var(--accent)", padding: "0.15rem 0.4rem", borderRadius: 6 }}>
                        Admin
                      </span>
                    )}
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {u.realName && <span>{u.realName}</span>}
                      {u.whatsapp && <span> • {u.whatsapp}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem" }} onClick={() => openEdit(u)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem" }}
                      onClick={() => handleDelete(u.id)}
                      disabled={u.nickname === "drlazinho"}
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(showAdd || editing) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 50,
          }}
          onClick={closeModal}
        >
          <div
            className="card"
            style={{ width: "100%", maxWidth: "400px", maxHeight: "90vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
              {editing ? "Editar usuário" : "Adicionar usuário"}
            </h2>
            <div className="input-group">
              <label>Nickname *</label>
              <input
                type="text"
                value={formNickname}
                onChange={(e) => setFormNickname(e.target.value)}
                placeholder="Ex: joao123"
              />
            </div>
            <div className="input-group">
              <label>WhatsApp</label>
              <input
                type="text"
                value={formWhatsapp}
                onChange={(e) => setFormWhatsapp(e.target.value)}
                placeholder="5511999999999"
              />
            </div>
            <div className="input-group">
              <label>Nome real</label>
              <input
                type="text"
                value={formRealName}
                onChange={(e) => setFormRealName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            {editing && (
              <>
                <div className="input-group">
                  <label>Função</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as "USER" | "ADMIN")}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.9rem",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--text)",
                    }}
                  >
                    <option value="USER">Usuário</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                {(formRole === "ADMIN" || editing.role === "ADMIN") && (
                  <div className="input-group">
                    <label>Nova senha (deixe em branco para manter)</label>
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="••••••"
                    />
                  </div>
                )}
              </>
            )}
            {message && (
              <p className={message.type === "error" ? "error-msg" : "success-msg"} style={{ marginBottom: "0.5rem" }}>
                {message.text}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={editing ? handleUpdate : handleAdd} disabled={submitLoading}>
                {submitLoading ? "Salvando..." : editing ? "Salvar" : "Criar"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
