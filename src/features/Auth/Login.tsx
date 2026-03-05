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

  const passwordRules = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push("at least 8 characters");
    if (!/[a-zA-Z]/.test(pwd)) errors.push("a letter");
    if (!/\d/.test(pwd)) errors.push("a number");
    return errors;
  };

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case "email":
        if (!value) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
        return null;
      case "password":
        if (!value) return "Password is required";
        const pwErrors = passwordRules(value);
        if (pwErrors.length > 0) {
          return `Password must contain ${pwErrors.join(", ")}`;
        }
        return null;
      default:
        return null;
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const emailError = validateField("email", formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validateField("password", formData.password);
    if (passwordError) newErrors.password = passwordError;

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

    // validate field as user types
    const fieldError = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError || "" }));
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

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => alert("Google sign-in placeholder")}
            className="w-full max-w-xs flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 text-sm"
          >
            {/* insert Google icon if available */}
            <span>Continue with Google</span>
          </button>
        </div>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">or</div>

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
            {/* password requirements hint */}
            {formData.password && passwordRules(formData.password).length > 0 && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Must include {passwordRules(formData.password).join(", ")}.
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


