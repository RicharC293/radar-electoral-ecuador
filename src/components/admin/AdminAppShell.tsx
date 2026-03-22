"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth } from "@/lib/firebase/config";
import { signInAsAdmin, signOutAdmin } from "@/lib/firebase/auth";
import { adminFetch } from "@/lib/admin-fetch";

interface AdminSessionValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

export function useAdminSession() {
  const value = useContext(AdminSessionContext);
  if (!value) {
    throw new Error("useAdminSession must be used within AdminAppShell.");
  }

  return value;
}

export function AdminAppShell({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setToken(nextUser ? await nextUser.getIdToken() : null);
      setLoading(false);
    });
  }, []);

  async function handleSignIn(email: string, password: string) {
    setAccessDenied(null);
    setSubmitting(true);

    try {
      const credential = await signInAsAdmin(email, password);
      const nextToken = await credential.user.getIdToken();

      await adminFetch("/api/admin/polls", {
        headers: {
          authorization: `Bearer ${nextToken}`
        }
      });

      setUser(credential.user);
      setToken(nextToken);
    } catch (cause) {
      await signOutAdmin();
      setUser(null);
      setToken(null);
      setAccessDenied(
        cause instanceof Error
          ? cause.message
          : "Solo el usuario administrador puede ingresar."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    await signOutAdmin();
    setUser(null);
    setToken(null);
  }

  const value: AdminSessionValue = {
    user,
    token,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut
  };

  if (loading) {
    return (
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-white/65">
        Cargando sesion de administrador...
      </section>
    );
  }

  if (!user) {
    async function submitLogin(formData: FormData) {
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      await handleSignIn(email, password);
    }

    return (
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-glow">
        <p className="text-sm uppercase tracking-[0.3em] text-white/45">Admin</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Acceso restringido</h1>
        <p className="mt-3 max-w-xl text-white/60">
          Inicia sesion con el usuario creado en Firebase Authentication. No hay registro publico.
        </p>
        <form action={submitLogin} className="mt-6 max-w-md space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Correo"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Contrasena"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-white px-5 py-3 font-medium text-slate-950 disabled:opacity-60"
          >
            {submitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        {accessDenied ? <p className="mt-4 text-sm text-rose-300">{accessDenied}</p> : null}
      </section>
    );
  }

  return (
    <AdminSessionContext.Provider value={value}>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/45">Admin</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Panel de control</h1>
            <p className="mt-2 text-sm text-white/55">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white">
              Encuestas
            </Link>
            <Link href="/admin/candidatos" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white">
              Candidatos
            </Link>
            <Link href="/admin/solicitudes" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white">
              Solicitudes
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950"
            >
              Salir
            </button>
          </div>
        </header>
        {children}
      </div>
    </AdminSessionContext.Provider>
  );
}
