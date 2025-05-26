"use client";

import { Shield, Lock, Eye, FileText, Heart } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold text-primary">Privacy Policy</h1>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
                <Lock className="h-6 w-6 mr-2" />
                Patient Data Protection
              </h2>
              <p className="text-gray-600 mb-4">
                At HealthConnect, we take the protection of patient health
                information very seriously. All patient data is classified as
                confidential and is protected under strict healthcare privacy
                regulations.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  Access to patient data is strictly limited to authorized
                  healthcare professionals
                </li>
                <li>
                  Patient data is never shared with third parties without
                  explicit consent
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
                <Eye className="h-6 w-6 mr-2" />
                Data Access and Control
              </h2>
              <p className="text-gray-600 mb-4">
                We implement strict access controls to ensure patient data is
                only accessible to authorized personnel:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  Role-based access control for all healthcare professionals
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
                <FileText className="h-6 w-6 mr-2" />
                Compliance and Regulations
              </h2>
              <p className="text-gray-600 mb-4">
                Our platform complies with major healthcare data protection
                regulations:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Local healthcare data protection laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
                <Heart className="h-6 w-6 mr-2" />
                Patient Rights
              </h2>
              <p className="text-gray-600 mb-4">
                Patients have the following rights regarding their health data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Right to access their medical records</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Contact Information
              </h2>
              <p className="text-gray-600">
                For any privacy-related concerns or questions, please contact
                our Privacy Officer at:
              </p>
              <p className="text-primary mt-2">ETHIO-CPRMS.COM</p>
            </section>

            <div className="pt-8 border-t border-primary/20">
              <Link href="/" className="text-primary hover:text-accent">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
