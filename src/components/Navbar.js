"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, UserPlus, LogIn, Menu, X, ChevronLeft } from "lucide-react";

export default function Navbar({ showBackButton = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-emerald-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-emerald-600 mr-2" />
            <span className="font-bold text-xl text-emerald-700">
              HealthConnect
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/features"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Contact
            </Link>
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-emerald-600 hover:bg-emerald-50"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {showBackButton && (
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-gray-600">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </Link>
            )}
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
        <div className="md:hidden bg-white border-t border-emerald-100 shadow-sm px-4 py-4 space-y-3">
          <Link
            href="/features"
            className="block text-gray-700 hover:text-emerald-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="block text-gray-700 hover:text-emerald-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="block text-gray-700 hover:text-emerald-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="block text-gray-700 hover:text-emerald-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
            <Button
              variant="ghost"
              className="w-full justify-start text-emerald-600"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </Link>
          <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
            <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              Sign Up
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
