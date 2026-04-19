"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError("");
    try {
      const res = await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      setAuth(res.user, res.token);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left: Visual */}
      <div
        className="hidden md:flex items-end p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #7A8C72 0%, #0D0D0D 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(245,242,236,0.3) 40px, rgba(245,242,236,0.3) 41px)`,
          }}
        />
        <div className="relative z-10">
          <p className="font-display text-6xl lg:text-7xl font-light text-chalk/10 leading-none mb-4">
            Dress<br />
            <em className="text-chalk/30">for who</em><br />
            you&apos;re becoming.
          </p>
          <p className="font-mono text-xs text-chalk/20 tracking-widest">— HabaClothes</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center px-8 py-20 md:py-0">
        <div className="w-full max-w-sm">
          <Link href="/" className="font-display text-3xl font-light tracking-[0.15em] text-ink hover:text-clay transition-colors block mb-12">
            HABA
          </Link>

          <h1 className="font-display text-4xl font-light mb-2">Create account</h1>
          <p className="font-body text-sm text-ink/50 mb-10">
            Already have one?{" "}
            <Link href="/login" className="text-ink underline hover:text-clay transition-colors">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  placeholder="Jane"
                  className="input-field"
                  {...register("firstName", { required: "Required" })}
                />
                {errors.firstName && <p className="font-mono text-xs text-rust mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="input-field"
                  {...register("lastName", { required: "Required" })}
                />
                {errors.lastName && <p className="font-mono text-xs text-rust mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input-field"
                {...register("email", { required: "Email is required", pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } })}
              />
              {errors.email && <p className="font-mono text-xs text-rust mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className="input-field pr-10"
                  {...register("password", { required: "Password is required", minLength: { value: 8, message: "Minimum 8 characters" } })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="font-mono text-xs text-rust mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-field"
                {...register("confirmPassword", {
                  required: "Please confirm password",
                  validate: (val) => val === watch("password") || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && <p className="font-mono text-xs text-rust mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {error && (
              <div className="bg-rust/10 border border-rust/20 px-4 py-3">
                <p className="font-mono text-xs text-rust">{error}</p>
              </div>
            )}

            <p className="font-mono text-xs text-ink/40 leading-relaxed">
              By creating an account you agree to our{" "}
              <a href="#" className="underline hover:text-ink">Terms of Service</a> and{" "}
              <a href="#" className="underline hover:text-ink">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={loading} className="btn-primary w-full inline-flex items-center justify-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
