'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, Users, Bot, TrendingUp, Sparkles } from "lucide-react";


const Login = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        toast({
          title: "Welcome!",
          description: "Loading workshop content...",
        });
        // Redirect to home page - middleware will handle auth verification
        router.push("/");
        router.refresh();
      } else {
        const data = await response.json();
        toast({
          title: "Access Denied",
          description: data.error || "Invalid password. Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile: Login Form First */}
      <div className="lg:hidden bg-gray-50 p-6">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h2>
              <p className="text-sm text-gray-600">
                Enter the access password to view workshop content and demos
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700 block"
                >
                  Access Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 text-base pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "Access Content"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Need access? Contact the workshop organizer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workshop Info Panel - Shown on both mobile and desktop */}
      <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-8 lg:p-16 flex flex-col justify-between text-white">
        <div>
          {/* Logos */}
          <div className="flex items-center justify-center gap-6 mb-8 lg:mb-12 pb-6 lg:pb-8 border-b border-white/10">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/512px-Salesforce.com_logo.svg.png?20210504050649"
              alt="Salesforce Logo"
              className="h-6 lg:h-8 w-auto object-contain brightness-0 invert"
            />
            <span className="text-xl lg:text-2xl text-white/60 font-light">+</span>
            <img
              src="uploads/nto-primary-logo-04.png"
              alt="NTO Logo"
              className="h-10 lg:h-14 w-auto object-contain brightness-0 invert"
            />
          </div>

          <div className="space-y-4 lg:space-y-6">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
              AI Agents Workshop Experience
            </h2>
            <p className="text-lg lg:text-xl text-blue-100 leading-relaxed pt-4 lg:pt-10">
              Explore insights and demos from our collaborative workshop where
              NTO and Salesforce built AI-powered HR solutions together.
            </p>
          </div>
        </div>

        <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-white/10">
          <p className="text-xs lg:text-sm text-blue-200">
            Built by Salesforce for NTO • Powered by AgentForce
          </p>
        </div>
      </div>

      {/* Desktop: Login Form on Right */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 lg:p-16 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <div className="mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
              <p className="text-gray-600">
                Enter the access password to view workshop content and demos
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="password-desktop"
                  className="text-sm font-semibold text-gray-700 block"
                >
                  Access Password
                </label>
                <div className="relative">
                  <Input
                    id="password-desktop"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 text-base pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "Access Content"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Need access? Contact the workshop organizer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
