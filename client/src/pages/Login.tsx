import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("user", email);
      window.location.href = "/dashboard";
    }, 900);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 ">
      <div className="w-full max-w-md bg-gray-100 p-10 rounded-2xl shadow-lg">

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Sign in to continue to your workspace
        </p>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 mb-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest">
              Password
            </label>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-700 font-medium transition-colors">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 pr-11 text-sm bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>

        {/* Sign up */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <a href="#" className="text-gray-900 font-semibold hover:opacity-70 transition-opacity">
            Create one free →
          </a>
        </p>

      </div>
    </div>
  );
}