"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  UserPlus,
  LogIn,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";

export default function Contact() {
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

        {/* Mobile menu */}
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
      <div className="bg-white border-b border-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Have questions about ETHIO-CPRMS? Our team is here to help you.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a message
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="first-name"
                      className="text-sm font-medium text-gray-700"
                    >
                      First name
                    </label>
                    <Input id="first-name" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="last-name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Last name
                    </label>
                    <Input id="last-name" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-sm font-medium text-gray-700"
                  >
                    Subject
                  </label>
                  <Input id="subject" placeholder="How can we help you?" />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-gray-700"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Your message..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white py-6">
                  Send Message
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-3 mr-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">support@ethio-cprms.com</p>
                    <p className="text-gray-600">info@ethio-cprms.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-3 mr-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <p className="text-gray-600">+251 11 123 4567</p>
                    <p className="text-gray-600">Mon-Fri, 9am-5pm EAT</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-3 mr-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Office</h3>
                    <p className="text-gray-600">
                      Bole Road, Friendship Building
                    </p>
                    <p className="text-gray-600">Addis Ababa, Ethiopia</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-600 rounded-xl shadow-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Support Hours</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3" />
                  <div>
                    <h3 className="font-medium">Monday - Friday</h3>
                    <p className="text-emerald-200">9:00 AM - 5:00 PM EAT</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3" />
                  <div>
                    <h3 className="font-medium">Saturday</h3>
                    <p className="text-emerald-200">10:00 AM - 2:00 PM EAT</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3" />
                  <div>
                    <h3 className="font-medium">Sunday</h3>
                    <p className="text-emerald-200">Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-lg p-4 overflow-hidden">
          <div className="bg-emerald-100 h-[400px] rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">
                Map Placeholder
              </h3>
              <p className="text-gray-600">
                Bole Road, Friendship Building, Addis Ababa, Ethiopia
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-emerald-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600">
                Find answers to common questions about ETHIO-CPRMS.
              </p>
            </div>

            <Accordion
              type="single"
              collapsible
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left font-medium">
                  How do I sign up for ETHIO-CPRMS?
                </AccordionTrigger>
                <AccordionContent>
                  Signing up for ETHIO-CPRMS is easy! Simply click the "Sign Up"
                  button in the top navigation, fill out the registration form,
                  and verify your email address. You'll then be guided through a
                  simple onboarding process to set up your account.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left font-medium">
                  Is my health information secure on ETHIO-CPRMS?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, security is our top priority. ETHIO-CPRMS uses
                  industry-leading encryption to protect your personal health
                  information. We never share your data with third parties
                  without your explicit consent.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left font-medium">
                  Can I use ETHIO-CPRMS on my mobile device?
                </AccordionTrigger>
                <AccordionContent>
                  ETHIO-CPRMS is fully responsive and works on all devices. We
                  also offer dedicated mobile apps for iOS and Android for an
                  enhanced mobile experience.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left font-medium">
                  How do I connect with my healthcare provider?
                </AccordionTrigger>
                <AccordionContent>
                  Once you've created your account, you can search for your
                  healthcare provider in our directory and send a connection
                  request. If your provider isn't already on ETHIO-CPRMS, you
                  can invite them to join.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left font-medium">
                  What if I need technical support?
                </AccordionTrigger>
                <AccordionContent>
                  Our support team is available Monday through Friday, 9am-5pm
                  EAT. You can reach us by email at support@ethio-cprms.com or
                  by phone at +251 11 123 4567. We also offer live chat support
                  for immediate assistance.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary to-accent rounded-2xl shadow-lg p-8 md:p-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to get started with ETHIO-CPRMS?
            </h2>
            <p className="text-white/80 mb-8">
              Join healthcare providers across Ethiopia who are already
              benefiting from our platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <Button className="bg-white text-primary hover:bg-white/90 px-8 py-6">
                  Create Account
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-primary/90 px-8 py-6"
                >
                  Request Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-6 bg-white/80 backdrop-blur-sm">
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
              <Link
                href="/terms"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
