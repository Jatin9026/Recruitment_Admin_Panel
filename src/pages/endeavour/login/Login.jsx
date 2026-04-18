import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Lock, Mail, EyeIcon, EyeOffIcon } from "lucide-react";
import { useEndeavourAuthStore } from "../../../store/endeavourAuthStore";
import { ENDEAVOUR_PATHS } from "../../../modules/endeavour/paths";

export default function EndeavourLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState("");

  const login = useEndeavourAuthStore((state) => state.login);
  const isLoading = useEndeavourAuthStore((state) => state.isLoading);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const result = await login({ email, password });
    if (!result.success) {
      setError(result.error || "Unable to login");
      return;
    }

    navigate(ENDEAVOUR_PATHS.dashboard, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 flex items-center justify-center p-4 font-caldina">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 text-white backdrop-blur-md"
      >
        <h1 className="text-3xl font-semibold">Endeavour Admin</h1>
        <p className="mt-2 text-sm text-emerald-100/90">
          Sign in with Endeavour admin credentials to access users, participants, and teams.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-300/60 bg-red-500/20 p-3 text-sm text-red-100 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-emerald-100">Email</span>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-200" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/20 bg-black/20 py-3 pl-10 pr-3 text-white placeholder:text-emerald-100/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="admin@kiet.edu"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-emerald-100">Password</span>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-200" />
              <input
                type={showPassword ? "password" : "text"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/20 bg-black/20 py-3 pl-10 pr-3 text-white placeholder:text-emerald-100/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="Enter password"
              />
              {showPassword ? (
                <EyeIcon
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-emerald-200"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <EyeOffIcon
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-emerald-200"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-emerald-500 py-3 font-medium text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isLoading ? "Signing in..." : "Sign in to Endeavour"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
