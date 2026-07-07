"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setError("Check your email for a confirmation link.");
      } else {
        await signIn(email, password);
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isSignUp ? "Create Account" : "Sign In"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
            minLength={6}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <p className="text-center mt-4 text-sm text-gray-600">
        {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-primary-600 hover:underline"
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}
