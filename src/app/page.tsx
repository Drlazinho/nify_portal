"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div className="container">
        <div className="card" style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", fontWeight: 700 }}>
            Nify Portal
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.95rem" }}>
            Como você deseja continuar?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link href="/admin/login" className="btn btn-primary" style={{ width: "100%" }}>
              Admin
            </Link>
            <Link href="/user/register" className="btn btn-secondary" style={{ width: "100%" }}>
              Membro
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
