import { useState, type FormEvent } from "react";
import { IconLock, IconMail, IconUser, LogoMark } from "./Icons";

type Props = {
  onLogin: (name: string, email: string) => Promise<void>;
};

export default function LoginScreen({ onLogin }: Props) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (tab === "register" && !name.trim())) {
      setError("Заполни все поля");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onLogin(tab === "register" ? name.trim() : "", email.trim());
    } catch (err: any) {
      setError(err?.message ?? "Не удалось войти. Убедись, что сервер GreenBlox Studio запущен на :3001");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0e0e0e] px-4">
      <div className="login-glow-a animate-glow-drift pointer-events-none absolute -left-[18%] -top-[20%] h-[70vw] max-h-[720px] w-[70vw] max-w-[720px] rounded-full blur-3xl" />
      <div className="login-glow-b animate-glow-drift pointer-events-none absolute -bottom-[18%] -right-[10%] h-[62vw] max-h-[640px] w-[62vw] max-w-[640px] rounded-full blur-3xl [animation-delay:-6s]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(0,0,0,0.55)_100%)]" />

      <div className="animate-fade-up relative z-10 w-full max-w-[420px] rounded-[28px] border border-white/8 bg-[#141414]/85 px-8 pb-8 pt-9 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="mb-5 flex justify-center">
          <LogoMark className="animate-logo-pulse h-14 w-14" />
        </div>

        <h1 className="text-center text-[26px] font-extrabold leading-tight tracking-tight text-white">
          Добро пожаловать в
          <br />
          GreenBlox
        </h1>
        <p className="mt-2 text-center text-[13px] text-[#8b8b8b]">
          Войди, чтобы запускать игры и звать друзей
        </p>

        <div className="mt-6 flex rounded-full bg-[#1c1c1c] p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`h-10 flex-1 rounded-full text-[14px] font-bold transition-all duration-200 ${
              tab === "login"
                ? "bg-[#1ed760] text-black shadow-[0_0_18px_rgba(30,215,96,0.35)]"
                : "text-[#9a9a9a] hover:text-white"
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`h-10 flex-1 rounded-full text-[14px] font-bold transition-all duration-200 ${
              tab === "register"
                ? "bg-[#1ed760] text-black shadow-[0_0_18px_rgba(30,215,96,0.35)]"
                : "text-[#9a9a9a] hover:text-white"
            }`}
          >
            Регистрация
          </button>
        </div>

        <form className="mt-5 space-y-3.5" onSubmit={submit}>
          {tab === "register" && (
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-[#d6d6d6]">Имя</span>
              <div className="flex h-12 items-center gap-2.5 rounded-[14px] border border-white/8 bg-[#1c1c1c] px-3.5 transition-colors focus-within:border-[#1ed760]/70">
                <IconUser className="h-4.5 w-4.5 text-[#6f6f6f]" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Твой ник"
                  autoComplete="nickname"
                  className="h-full w-full bg-transparent text-[14px] text-white placeholder:text-[#5c5c5c]"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-[#d6d6d6]">Email</span>
            <div className="flex h-12 items-center gap-2.5 rounded-[14px] border border-white/8 bg-[#141816] px-3.5 transition-colors focus-within:border-[#1ed760]/70">
              <IconMail className="h-[18px] w-[18px] text-[#6f6f6f]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@greenblox.io"
                autoComplete="email"
                className="h-full w-full bg-transparent text-[14px] text-white placeholder:text-[#5c5c5c]"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-[#d6d6d6]">Пароль</span>
            <div className="flex h-12 items-center gap-2.5 rounded-[14px] border border-white/8 bg-[#141816] px-3.5 transition-colors focus-within:border-[#1ed760]/70">
              <IconLock className="h-[18px] w-[18px] text-[#6f6f6f]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                className="h-full w-full bg-transparent text-[14px] tracking-[0.18em] text-white placeholder:text-[#5c5c5c] placeholder:tracking-[0.18em]"
              />
            </div>
          </label>

          <p className="text-[12px] text-[#7a7a7a]">
            Пароль пока не используется сервером — аккаунт привязывается к email, чтобы твои друзья и чаты сохранялись между запусками.
          </p>

          {error && <p className="text-[12px] font-semibold text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[#1ed760] text-[15px] font-extrabold text-[#05210e] shadow-[0_8px_24px_rgba(30,215,96,0.28)] transition-all duration-200 hover:bg-[#2ae06c] hover:shadow-[0_8px_28px_rgba(42,224,108,0.32)] disabled:opacity-70"
          >
            {loading ? (
              <span className="h-5 w-5 rounded-full border-2 border-[#05210e]/20 border-t-[#05210e] animate-spin-soft" />
            ) : tab === "login" ? (
              "Войти в GreenBlox"
            ) : (
              "Создать аккаунт"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-[12.5px] text-[#7a7a7a]">
          {tab === "login" ? (
            <>
              Нет аккаунта?{" "}
              <button
                type="button"
                className="font-bold text-[#1ed760] hover:text-[#2ae06c]"
                onClick={() => setTab("register")}
              >
                Создать
              </button>
            </>
          ) : (
            <>
              Уже есть аккаунт?{" "}
              <button
                type="button"
                className="font-bold text-[#1ed760] hover:text-[#2ae06c]"
                onClick={() => setTab("login")}
              >
                Войти
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
