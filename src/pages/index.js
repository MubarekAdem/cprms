"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Heart,
  UserPlus,
  LogIn,
  Menu,
  X,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  Shield,
  Users,
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const redirectPath = getRedirectPath(session.user.role);
      router.push(redirectPath);
    }
  }, [session, status, router]);

  const getRedirectPath = (role) => {
    switch (role) {
      case "super-admin":
        return "/super-admin";
      case "registrar":
        return "/registrar";
      case "admin":
        return "/admin-doctor";
      case "doctor":
        return "/doctor";
      case "first-aid":
        return "/notifications";
      case "None":
      case undefined:
        return "/notifications";
      default:
        return "/notifications";
    }
  };

  // Loading state
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-primary/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Heart className="h-8 w-8 text-primary" />
                <span className="ml-2 font-bold text-xl text-primary">
                  ETHIO-CPRMS
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#about"
                className="text-gray-300 hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-gray-300 hover:text-primary transition-colors"
              >
                Contact
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-primary hover:bg-primary/20"
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
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-gray-900/90"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link
                  href="#about"
                  className="block px-3 py-2 text-gray-300 hover:text-primary hover:bg-primary/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="#contact"
                  className="block px-3 py-2 text-gray-300 hover:text-primary hover:bg-primary/10"
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="py-20 md:py-32 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl pointer-events-none z-0" />
        <div className="relative z-10">
          <motion.div
            className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary font-medium text-sm mb-6"
            whileHover={{ scale: 1.05 }}
          >
            Healthcare of the Future
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 bg-clip-text text-transparent bg-primary "
            variants={fadeIn}
          >
            Transforming Healthcare in Ethiopia
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            variants={fadeIn}
          >
            ETHIO-CPRMS is your all-in-one platform for seamless healthcare
            management, connecting patients and providers with cutting-edge
            technology.
          </motion.p>
          <motion.div
            className="flex justify-center gap-4 z-20"
            variants={fadeIn}
          >
            <Link href="/signup">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg rounded-full shadow-lg">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <Link href="#contact">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent/20 px-8 py-3 text-lg rounded-full"
                >
                  Contact Us
                </Button>
              </motion.div>
            </Link>
          </motion.div>
          <motion.div
            className="flex justify-center items-center mt-12 text-gray-400"
            variants={fadeIn}
          >
            <Users className="h-6 w-6 mr-2" />
            <p>
              Trusted by thousands of healthcare professionals across Ethiopia
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        id="about"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="py-20 bg-gray-800/50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
          variants={fadeIn}
        >
          About ETHIO-CPRMS
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeIn}>
            <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
            <p className="text-gray-300 mb-6">
              Founded in 2025, ETHIO-CPRMS is dedicated to simplifying
              healthcare management in Ethiopia. Our platform empowers patients
              and providers with intuitive tools to enhance communication and
              improve health outcomes.
            </p>
            <p className="text-gray-300">
              Combining expertise from healthcare and technology, we’re bridging
              the gap between patients and providers, making healthcare
              accessible and efficient.
            </p>
          </motion.div>
          <motion.div
            className="bg-primary/10 p-8 rounded-2xl relative"
            variants={scaleIn}
          >
            <motion.div
              className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-center mb-6">
                <Heart className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Our Vision</h3>
              <p className="text-gray-300 text-center">
                To create a connected healthcare ecosystem where every Ethiopian
                has access to quality care through technology.
              </p>
            </motion.div>
            <div className="absolute top-0 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
          </motion.div>
        </div>
        <motion.div
          className="mt-16 grid md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          {[
            {
              icon: <Award className="h-8 w-8 text-primary" />,
              title: "Excellence",
              desc: "Delivering top-quality technology and support for healthcare.",
            },
            {
              icon: <Shield className="h-8 w-8 text-primary" />,
              title: "Security",
              desc: "Protecting patient data with industry-leading encryption.",
            },
            {
              icon: <Clock className="h-8 w-8 text-primary" />,
              title: "Innovation",
              desc: "Pioneering solutions to meet evolving healthcare needs.",
            },
          ].map((value, index) => (
            <motion.div
              key={index}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 shadow-lg"
              variants={scaleIn}
              whileHover={{ y: -5 }}
            >
              <div className="bg-primary/20 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-gray-400">{value.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        id="contact"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
          variants={fadeIn}
        >
          Get in Touch
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div variants={fadeIn}>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-semibold mb-6">Send Us a Message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-gray-300">
                      First Name
                    </Label>
                    <Input
                      id="first-name"
                      placeholder="John"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-gray-300">
                      Last Name
                    </Label>
                    <Input
                      id="last-name"
                      placeholder="Doe"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-300">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Your message..."
                    className="min-h-[120px] bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-full">
                  Send Message
                </Button>
              </form>
            </div>
          </motion.div>
          <motion.div className="space-y-8" variants={fadeIn}>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-semibold mb-6">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-primary mr-4" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-gray-400">support@ethio-cprms.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-primary mr-4" />
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-gray-400">+251 11 123 4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-primary mr-4" />
                  <div>
                    <h4 className="font-medium">Office</h4>
                    <p className="text-gray-400">
                      Bole Road, Addis Ababa, Ethiopia
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary/20 rounded-xl p-8">
              <h3 className="text-2xl font-semibold mb-6">Support Hours</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <h4 className="font-medium">Monday - Friday</h4>
                    <p className="text-gray-400">9:00 AM - 5:00 PM EAT</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <h4 className="font-medium">Saturday</h4>
                    <p className="text-gray-400">10:00 AM - 2:00 PM EAT</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="py-6 bg-gray-900/80 backdrop-blur-lg border-t border-primary/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Heart className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm text-gray-400">
                © 2025 ETHIO-CPRMS. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-400 hover:text-primary"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-400 hover:text-primary"
              >
                Terms
              </Link>
              <Link
                href="#contact"
                className="text-sm text-gray-400 hover:text-primary"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
