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

function UsernameGate({ children }: { children: React.ReactNode }) {
  const { user, signIn } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (user) return <>{children}</>;

  const handleJoin = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Please enter a display name"); return; }
    if (trimmed.length < 2) { setError("Name must be at least 2 characters"); return; }
    signIn(trimmed);
  };

  return (
    <div className="min-h-dvh bg-[#313338] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src={`${basePath}/logo.svg`} alt="Logo" className="w-16 h-16" />
        </div>
        <div className="bg-[#2b2d31] rounded-xl p-8 border border-[#1e1f22] shadow-2xl">
          <h1 className="text-2xl font-bold text-white text-center mb-2">Welcome!</h1>
          <p className="text-[#b5bac1] text-center text-sm mb-6">Enter a display name to start chatting</p>
          <label className="block text-xs font-semibold text-[#949ba4] uppercase tracking-wider mb-2">
            Display Name
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            maxLength={32}
            placeholder="Your name..."
            className="w-full bg-[#1e1f22] border border-[#3f4147] rounded-lg px-3 py-2.5 text-[#dbdee1] text-sm outline-none focus:border-[#5865F2] transition-colors placeholder:text-[#4e5058]"
          />
          {error && <p className="text-[#ed4245] text-xs mt-2">{error}</p>}
          <button
            onClick={handleJoin}
            className="w-full mt-4 py-2.5 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold rounded-lg transition-colors"
          >
            Join
          </button>
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
          <UsernameGate>
            <AppRoutes />
          </UsernameGate>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </WouterRouter>
  );
}

export default App;
