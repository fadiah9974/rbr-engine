"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/helper";
import { getRegisterOrganizations } from "@/services/authService";
import type { Organization } from "@/services/organizationService";

const logoSrc = "/Logo_RBR_Engine.png";

export default function LoginPage() {
  const router = useRouter();
  const { loading, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [idOrganisasi, setIdOrganisasi] = useState<number | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode !== "register") return;

    getRegisterOrganizations()
      .then(setOrganizations)
      .catch(() => setOrganizations([]));
  }, [mode]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (error) {
      setMessage(getErrorMessage(error, "Login gagal"));
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await register({
        email,
        id_organisasi: idOrganisasi,
        nama_lengkap: namaLengkap,
        password,
        username,
      });
      setMode("login");
      setMessage("Registrasi berhasil. Silakan login.");
      setIdOrganisasi(null);
      setNamaLengkap("");
      setPassword("");
      setUsername("");
    } catch (error) {
      setMessage(getErrorMessage(error, "Registrasi gagal"));
    }
  }

  function switchMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setMessage("");
    setPassword("");
  }

  const isLogin = mode === "login";

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.02fr_1fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-teal-900 p-10 text-white lg:flex lg:flex-col">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute inset-y-12 right-0 w-px bg-white/10" />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
          <img
            src={logoSrc}
            alt="RBR Engine logo"
            className="h-auto w-72 translate-y-10 object-contain [filter:drop-shadow(0_18px_28px_rgba(2,6,23,0.28))]"
          />

          <div className="-mt-8 flex max-w-xl flex-col items-center text-center">
            <div className="mb-3 h-1 w-24 rounded-full bg-teal-100/80" />
            <h1 className="bg-gradient-to-r from-white via-teal-100 to-white bg-clip-text pb-2 font-serif text-7xl font-black italic leading-[1.08] tracking-normal text-transparent drop-shadow-[0_10px_24px_rgba(2,6,23,0.2)]">
              RBR Engine
            </h1>
            <p className="mt-5 max-w-lg bg-gradient-to-r from-teal-100 via-white to-teal-100 bg-clip-text text-xl font-semibold leading-8 text-transparent">
              Sistem konsultasi dan asesmen berbasis aturan
            </p>
          </div>

          <div className="mt-12 w-full max-w-lg">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-center shadow-[0_22px_60px_rgba(2,6,23,0.18)] backdrop-blur">
              <p className="text-sm font-medium leading-6 text-teal-100/90">
                Keputusan asesmen tetap terstruktur, konsisten, dan terhubung langsung
                dengan data rule engine.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen w-full items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-[460px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm">
              <img
                src={logoSrc}
                alt="RBR Engine logo"
                className="h-full w-full scale-[1.45] object-contain"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.1)] sm:p-8">
            <div className="mb-7 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                {isLogin ? "Masuk ke Akun" : "Buat Akun Baru"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isLogin
                  ? "Gunakan kredensial yang terdaftar di Sistem."
                  : "Lengkapi data pengguna untuk registrasi."}
              </p>
            </div>

            <div className="mb-7 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner">
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                  isLogin
                    ? "bg-white text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                onClick={() => switchMode("login")}
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                  !isLogin
                    ? "bg-white text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                onClick={() => switchMode("register")}
              >
                <UserPlus className="h-4 w-4" />
                Daftar
              </button>
            </div>

            {message && (
              <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {message}
              </div>
            )}

            <form className="space-y-5" onSubmit={isLogin ? handleLogin : handleRegister}>
              {!isLogin && (
                <>
                  <Input
                    label="Nama Lengkap"
                    value={namaLengkap}
                    onChange={(event) => setNamaLengkap(event.target.value)}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                  <Input
                    label="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Masukkan username"
                    required
                  />
                  <Select
                    label="Organisasi"
                    value={idOrganisasi || ""}
                    onChange={(event) => setIdOrganisasi(Number(event.target.value))}
                    required
                  >
                    <option value="">Pilih organisasi</option>
                    {organizations.map((organization) => (
                      <option key={organization.id_organisasi} value={organization.id_organisasi}>
                        {organization.instansi}
                      </option>
                    ))}
                  </Select>
                </>
              )}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@organisasi.com"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                required
              />

              <Button type="submit" className="w-full gap-2 py-3.5" size="lg" isLoading={loading}>
                {isLogin ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {isLogin ? "Masuk Dashboard" : "Daftar"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {isLogin ? (
                <>
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    className="font-semibold text-teal-700 hover:text-teal-800"
                    onClick={() => switchMode("register")}
                  >
                    Daftar sekarang
                  </button>
                </>
              ) : (
                <>
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    className="font-semibold text-teal-700 hover:text-teal-800"
                    onClick={() => switchMode("login")}
                  >
                    Login sekarang
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
