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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary to-accent/20">
      {/* Navigation Bar */}
      <nav className="border-b border-primary/10 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Heart className="h-8 w-8 text-primary mr-2" />
                <span className="font-bold text-xl text-primary">
                  ETHIO-CPRMS
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/about"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Contact
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-primary hover:bg-primary/10"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-white">
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
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-primary hover:bg-primary/10"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-start bg-primary hover:bg-primary/90 text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="bg-white border-b border-primary">
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
          <div className="bg-primary/10 rounded-2xl p-8 relative">
            <div className="bg-white rounded-xl shadow-lg p-6 relative z-10">
              <div className="flex justify-center mb-6">
                <div className="bg-primary rounded-full p-4">
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
            <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-24 h-24 bg-primary/20 rounded-full opacity-30 blur-xl"></div>
            <div className="absolute bottom-1/4 -left-8 w-32 h-32 bg-accent/20 rounded-full opacity-30 blur-xl"></div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Core Values
          </h2>
          <p className="text-gray-600">
            These principles guide everything we do at ETHIO-CPRMS, from product
            development to customer support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="bg-primary/10 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-6">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Excellence</h3>
            <p className="text-gray-600">
              We strive for excellence in everything we do, from the technology
              we build to the support we provide.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="bg-accent/10 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">Privacy & Security</h3>
            <p className="text-gray-600">
              We protect patient data with the highest standards of privacy and
              security, earning trust through transparency.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="bg-secondary rounded-full p-3 w-14 h-14 flex items-center justify-center mb-6">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Innovation</h3>
            <p className="text-gray-600">
              We continuously innovate to improve healthcare management, staying
              ahead of industry needs and trends.
            </p>
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
              bg: "bg-primary/10",
            },
            {
              name: "Tigist Haile",
              role: "CTO & Co-Founder",
              bg: "bg-accent/10",
            },
            {
              name: "Dr. Yonas Tadesse",
              role: "Chief Medical Officer",
              bg: "bg-secondary/10",
            },
            {
              name: "Meron Alemu",
              role: "Chief Product Officer",
              bg: "bg-primary/10",
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
      <div className="bg-gradient-to-r from-primary to-accent py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-white/80">
              Don&apos;t just take our word for it - hear from the healthcare
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
                  "The platform&apos;s intuitive design makes it easy for our entire staff to adopt. Our workflow efficiency has improved dramatically.",
                author: "Hiwot Girma",
                role: "Clinic Manager",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white"
              >
                <p className="text-lg mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-white/80 text-sm">{testimonial.role}</p>
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
                  <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6">
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 px-8 py-6"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-primary rounded-full p-6">
                <Heart className="h-24 w-24 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-primary py-6 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Heart className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm text-gray-600">
                © 2025 CPRMS. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
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
