"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  UserPlus,
  Users,
  LogIn,
  Menu,
  X,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation Bar */}
      <nav className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-indigo-600 mr-2" />
              <span className="font-bold text-xl text-indigo-700">
                HealthConnect
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/features"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Contact
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-indigo-600 hover:bg-indigo-50"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-indigo-100 shadow-sm px-4 py-4 space-y-3">
            <Link
              href="/features"
              className="block text-gray-700 hover:text-indigo-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="block text-gray-700 hover:text-indigo-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="block text-gray-700 hover:text-indigo-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block text-gray-700 hover:text-indigo-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-indigo-600"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center py-12 md:py-24">
          {/* Left Content */}
          <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm mb-6">
              Healthcare Simplified
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-4">
              Your Complete Healthcare Management Solution
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Connect with healthcare providers, manage appointments, and access
              your medical records all in one place.
            </p>

            <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex">
              <Link href="/signup" className="block md:inline-block">
                <Button className="w-full md:w-auto text-base py-6 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-300 shadow-md">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Account
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/auth/roles-signup" className="block md:inline-block">
                <Button
                  variant="outline"
                  className="w-full md:w-auto text-base py-6 px-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-all duration-300"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Roles Signup
                </Button>
              </Link>
            </div>

            <div className="flex items-center mt-10 text-gray-600">
              <div className="flex -space-x-2 mr-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 border-white bg-indigo-${
                      i * 100
                    } flex items-center justify-center text-xs text-white font-medium`}
                  >
                    {["JD", "SM", "RK", "AL"][i - 1]}
                  </div>
                ))}
              </div>
              <p className="text-sm">
                Trusted by <span className="font-semibold">2,000+</span>{" "}
                healthcare professionals
              </p>
            </div>
          </div>

          {/* Right Content - Illustrations or images can go here */}
          <div className="md:w-1/2 relative">
            <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-24 h-24 bg-indigo-200 rounded-full opacity-30 blur-xl"></div>
            <div className="absolute bottom-1/4 -left-8 w-32 h-32 bg-purple-200 rounded-full opacity-30 blur-xl"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-indigo-100 py-6 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Heart className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-sm text-gray-600">
                © 2025 CPRMS. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/support"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
