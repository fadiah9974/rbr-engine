"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/helper";
import { getRegisterOrganizations } from "@/services/authService";
import type { Organization } from "@/services/organizationService";

const logoSrc = "/logo-rbr-engine-transparent.png";

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
    <main className="min-h-screen bg-slate-50 lg:flex">
      <section className="relative hidden overflow-hidden bg-teal-900 p-12 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10">
          <div className="mb-6 w-36 max-w-full">
            <img
              src={logoSrc}
              alt="RBR Engine logo"
              className="h-auto w-full object-contain [filter:drop-shadow(0_10px_18px_rgba(2,6,23,0.28))]"
            />
          </div>
          <h1 className="text-4xl font-bold">RBR Engine</h1>
          <p className="mt-3 text-lg text-teal-100">
            Sistem konsultasi dan asesmen berbasis aturan
          </p>
        </div>
        <p className="relative z-10 max-w-md text-sm leading-6 text-teal-100/80">
          Keputusan asesmen tetap terstruktur, konsisten, dan terhubung langsung
          dengan data rule engine.
        </p>
      </section>

      <section className="flex min-h-screen w-full items-center justify-center p-6 sm:p-12 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:border-none lg:bg-transparent lg:shadow-none">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {isLogin ? "Masuk ke Akun" : "Buat Akun Baru"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isLogin
                ? "Gunakan kredensial yang terdaftar di Sistem."
                : "Lengkapi data pengguna untuk registrasi."}
            </p>
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

            <Button type="submit" className="w-full" size="lg" isLoading={loading}>
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
      </section>
    </main>
  );
}
