import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuth } from "@/context/AuthContext";

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50 px-4">
      <div className="w-full max-w-md">
        {/* Left: Branding */}
        <div className="mb-8 flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-brand-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            FullStack
          </span>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 sm:p-10">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-600 mb-6">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@company.com"
                leftIcon={<Mail className="w-4 h-4" />}
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-700"></span>
                  {error}
                </p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-4">
                Don't have an account?{" "}
                <span className="text-brand-600 font-medium cursor-pointer hover:underline">
                  Create one
                </span>
              </p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="bg-slate-50 p-6">
            <div className="flex flex-col gap-3 text-xs text-slate-500 uppercase tracking-wider font-medium">
              <div className="flex items-center justify-between gap-4">
                <span>JWT Authentication</span>
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Role-Based Access</span>
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>HttpOnly Cookies</span>
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
