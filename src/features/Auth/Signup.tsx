"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // TODO: Implement actual signup logic
      console.log("Signup attempt:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, just show success (will be replaced with actual auth)
      alert("Account created successfully! (This is a placeholder)");
      
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ general: "Signup failed. Please try again." });
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
          <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
          <p className="text-sm text-black/70 dark:text-white/70 mt-2">
            Join My-Best and start finding stores near you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full h-10 rounded-md border px-3 text-sm bg-transparent ${
                errors.name 
                  ? "border-red-300 dark:border-red-700" 
                  : "border-black/10 dark:border-white/15"
              }`}
              placeholder="Enter your full name"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

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
              placeholder="Create a strong password"
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

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full h-10 rounded-md border px-3 text-sm bg-transparent ${
                errors.confirmPassword 
                  ? "border-red-300 dark:border-red-700" 
                  : "border-black/10 dark:border-white/15"
              }`}
              placeholder="Confirm your password"
              aria-required="true"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            />
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="text-sm text-red-600 dark:text-red-400">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                required
              />
              <span className="ml-2 text-sm text-black/70 dark:text-white/70">
                I agree to the{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-black/70 dark:text-white/70">
            Already have an account?{" "}
            <Link 
              href="/Auth/Login" 
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


