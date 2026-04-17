import { useState } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth";
import ChatApp from "@/pages/ChatApp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// ── Auth Gate (Login / Register) ────────────────────────────────────────────
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <>{children}</>;

  const handleSubmit = async () => {
    setError("");
    const u = username.trim();
    const p = password;

    if (!u) { setError("Please enter a username"); return; }
    if (u.length < 2) { setError("Username must be at least 2 characters"); return; }
    if (!p) { setError("Please enter a password"); return; }
    if (p.length < 6) { setError("Password must be at least 6 characters"); return; }

    if (mode === "register") {
      if (p !== confirmPassword) { setError("Passwords don't match"); return; }
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await signUp(u, p);
      } else {
        await signIn(u, p);
      }
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-dvh bg-[#313338] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={`${basePath}/logo.svg`} alt="Logo" className="w-16 h-16" />
        </div>

        <div className="bg-[#2b2d31] rounded-xl p-8 border border-[#1e1f22] shadow-2xl">
          <h1 className="text-2xl font-bold text-white text-center mb-1">
            {mode === "login" ? "Welcome back!" : "Create an account"}
          </h1>
          <p className="text-[#b5bac1] text-center text-sm mb-6">
            {mode === "login"
              ? "We're so excited to see you again!"
              : "Join the chat — it only takes a second."}
          </p>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#949ba4] uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              autoFocus
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              maxLength={32}
              placeholder="Enter your username"
              className="w-full bg-[#1e1f22] border border-[#3f4147] rounded-lg px-3 py-2.5 text-[#dbdee1] text-sm outline-none focus:border-[#5865F2] transition-colors placeholder:text-[#4e5058]"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#949ba4] uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Enter your password"
              className="w-full bg-[#1e1f22] border border-[#3f4147] rounded-lg px-3 py-2.5 text-[#dbdee1] text-sm outline-none focus:border-[#5865F2] transition-colors placeholder:text-[#4e5058]"
            />
          </div>

          {/* Confirm password (register only) */}
          {mode === "register" && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#949ba4] uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Confirm your password"
                className="w-full bg-[#1e1f22] border border-[#3f4147] rounded-lg px-3 py-2.5 text-[#dbdee1] text-sm outline-none focus:border-[#5865F2] transition-colors placeholder:text-[#4e5058]"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-[#ed4245] text-xs mb-3 bg-[#ed4245]/10 border border-[#ed4245]/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-1 py-2.5 bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {mode === "login" ? "Log In" : "Create Account"}
          </button>

          {/* Switch mode */}
          <p className="text-[#949ba4] text-sm text-center mt-5">
            {mode === "login" ? (
              <>
                Need an account?{" "}
                <button onClick={switchMode} className="text-[#5865F2] hover:underline font-medium">
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={switchMode} className="text-[#5865F2] hover:underline font-medium">
                  Log In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/app" />} />
      <Route path="/app" component={ChatApp} />
      <Route component={() => <Redirect to="/app" />} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <AuthGate>
            <AppRoutes />
          </AuthGate>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </WouterRouter>
  );
}

export default App;
