"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // TODO: Implement actual login logic
      console.log("Login attempt:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just show success (will be replaced with actual auth)
      alert("Login successful! (This is a placeholder)");
      
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome Back</h1>
          <p className="text-sm text-black/70 dark:text-white/70 mt-2">
            Sign in to your My-Best account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full h-10 rounded-md border px-3 text-sm bg-transparent ${
                errors.email 
                  ? "border-red-300 dark:border-red-700" 
                  : "border-black/10 dark:border-white/15"
              }`}
              placeholder="Enter your email"
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full h-10 rounded-md border px-3 text-sm bg-transparent ${
                errors.password 
                  ? "border-red-300 dark:border-red-700" 
                  : "border-black/10 dark:border-white/15"
              }`}
              placeholder="Enter your password"
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-red-600 dark:text-red-400">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-black/70 dark:text-white/70">
                Remember me
              </span>
            </label>
            <Link 
              href="/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-black/70 dark:text-white/70">
            Don&apos;t have an account?{" "}
            <Link 
              href="/Auth/Signup" 
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


