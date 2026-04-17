import { useLocation } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-dvh bg-[#313338] flex flex-col items-center justify-center text-[#dbdee1] px-4">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-6">
          <img src={`${basePath}/logo.svg`} alt="Logo" className="w-16 h-16" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-white">Where friends hang out</h1>
        <p className="text-[#b5bac1] text-lg mb-8">
          Join channels, chat in real time, and connect with anyone.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setLocation("/sign-up")}
            className="px-8 py-3 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold rounded-full transition-colors"
          >
            Sign Up Free
          </button>
          <button
            onClick={() => setLocation("/sign-in")}
            className="px-8 py-3 bg-[#4e5058] hover:bg-[#6d6f78] text-white font-semibold rounded-full transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
