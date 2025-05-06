"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  UserPlus,
  LogIn,
  Menu,
  X,
  Award,
  Clock,
  Shield,
} from "lucide-react";

export default function About() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Navigation Bar */}
      <nav className="border-b border-emerald-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Heart className="h-8 w-8 text-emerald-600 mr-2" />
                <span className="font-bold text-xl text-emerald-700">
                  ETHIO-CPRMS
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-emerald-600 font-medium">
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
          <div className="md:hidden bg-white border-t border-emerald-100 shadow-sm px-4 py-4 space-y-3">
            <Link
              href="/about"
              className="block text-emerald-600 font-medium"
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

      {/* Hero Section */}
      <div className="bg-white border-b border-emerald-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About ETHIO-CPRMS
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We're on a mission to transform healthcare management in Ethiopia
              through technology, making it more accessible, efficient, and
              patient-centered.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded in 2023, ETHIO-CPRMS began with a simple idea: healthcare
              management in Ethiopia should be simple, intuitive, and accessible
              to everyone.
            </p>
            <p className="text-gray-600 mb-4">
              Our founders, experienced healthcare professionals and technology
              experts, witnessed firsthand the challenges patients faced
              navigating complex healthcare systems. They set out to build a
              platform that would bridge the gap between patients and providers.
            </p>
            <p className="text-gray-600 mb-4">
              Today, ETHIO-CPRMS serves healthcare facilities across Ethiopia,
              continuously evolving to meet the changing needs of modern
              healthcare.
            </p>
          </div>
          <div className="bg-emerald-100 rounded-2xl p-8 relative">
            <div className="bg-white rounded-xl shadow-lg p-6 relative z-10">
              <div className="flex justify-center mb-6">
                <div className="bg-emerald-600 rounded-full p-4">
                  <Heart className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 text-center">
                To empower patients and healthcare providers with technology
                that simplifies healthcare management, improves communication,
                and enhances health outcomes across Ethiopia.
              </p>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-24 h-24 bg-emerald-200 rounded-full opacity-30 blur-xl"></div>
            <div className="absolute bottom-1/4 -left-8 w-32 h-32 bg-teal-200 rounded-full opacity-30 blur-xl"></div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-emerald-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600">
              These principles guide everything we do at ETHIO-CPRMS, from
              product development to customer support.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="bg-emerald-100 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in everything we do, from the
                technology we build to the support we provide.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="bg-teal-100 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Privacy & Security</h3>
              <p className="text-gray-600">
                We protect patient data with the highest standards of privacy
                and security, earning trust through transparency.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="bg-green-100 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p className="text-gray-600">
                We continuously innovate to improve healthcare management,
                staying ahead of industry needs and trends.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Meet Our Leadership Team
          </h2>
          <p className="text-gray-600">
            Experienced professionals dedicated to transforming healthcare
            through technology.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              name: "Dr. Abebe Bekele",
              role: "CEO & Co-Founder",
              bg: "bg-emerald-100",
            },
            {
              name: "Tigist Haile",
              role: "CTO & Co-Founder",
              bg: "bg-teal-100",
            },
            {
              name: "Dr. Yonas Tadesse",
              role: "Chief Medical Officer",
              bg: "bg-green-100",
            },
            {
              name: "Meron Alemu",
              role: "Chief Product Officer",
              bg: "bg-emerald-100",
            },
          ].map((member, index) => (
            <div key={index} className="text-center">
              <div
                className={`${member.bg} rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center`}
              >
                <span className="text-2xl font-bold text-gray-500">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-1">{member.name}</h3>
              <p className="text-gray-600 text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-emerald-100">
              Don't just take our word for it - hear from the healthcare
              professionals and patients who use ETHIO-CPRMS.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "ETHIO-CPRMS has transformed how I manage my practice. Patient communication is seamless, and administrative tasks take half the time.",
                author: "Dr. Dawit Mekonnen",
                role: "Family Physician",
              },
              {
                quote:
                  "As someone with multiple chronic conditions, ETHIO-CPRMS has made it so much easier to keep track of my appointments and medications.",
                author: "Selam Tesfaye",
                role: "Patient",
              },
              {
                quote:
                  "The platform's intuitive design makes it easy for our entire staff to adopt. Our workflow efficiency has improved dramatically.",
                author: "Hiwot Girma",
                role: "Clinic Manager",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="bg-emerald-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <span className="font-bold text-emerald-600">
                      {testimonial.author[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.author}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to transform your healthcare experience?
              </h2>
              <p className="text-gray-600 mb-6">
                Join healthcare providers across Ethiopia who are already
                benefiting from ETHIO-CPRMS.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6">
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-8 py-6"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-emerald-100 rounded-full p-6">
                <Heart className="h-24 w-24 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-emerald-100 py-6 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Heart className="h-5 w-5 text-emerald-600 mr-2" />
              <span className="text-sm text-gray-600">
                © 2025 CPRMS. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
