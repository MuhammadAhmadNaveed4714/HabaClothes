"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(data);
      setAuth(res.user, res.token);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left: Form */}
      <div className="flex items-center justify-center px-8 py-20 md:py-0">
        <div className="w-full max-w-sm">
          <Link href="/" className="font-display text-3xl font-light tracking-[0.15em] text-ink hover:text-clay transition-colors block mb-12">
            HABA
          </Link>

          <h1 className="font-display text-4xl font-light mb-2">Welcome back</h1>
          <p className="font-body text-sm text-ink/50 mb-10">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-ink underline hover:text-clay transition-colors">
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input-field"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="font-mono text-xs text-rust mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="font-mono text-xs text-rust mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-3 h-3 accent-ink" />
                <span className="font-mono text-xs text-ink/50">Remember me</span>
              </label>
              <a href="#" className="font-mono text-xs text-ink/50 hover:text-ink underline transition-colors">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="bg-rust/10 border border-rust/20 px-4 py-3">
                <p className="font-mono text-xs text-rust">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      {/* Right: Visual */}
      <div
        className="hidden md:flex items-end p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D0D0D 0%, #2A1F1A 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(181,147,107,0.3) 40px, rgba(181,147,107,0.3) 41px)`,
          }}
        />
        <div className="relative z-10">
          <p className="font-display text-6xl lg:text-7xl font-light text-chalk/10 leading-none mb-4">
            Style is<br />
            <em className="text-clay/40">knowing</em><br />
            yourself.
          </p>
          <p className="font-mono text-xs text-chalk/20 tracking-widest">— HabaClothes</p>
        </div>
      </div>
    </div>
  );
}