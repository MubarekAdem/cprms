"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const RegistrarExistingAdd = () => {
  const [patientExists, setPatientExists] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { name, id, birthDate } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    diseaseName: "",
    diseaseDescription: "",
    medication: "",
    dateAdded: new Date().toISOString().split("T")[0],
    hospitalName: "",
    doctorName: "",
    nationalId: "",
    rawBirthDate: "",
    rawId: "",
    registeredBy: "",
  });

  const checkPatientExists = async (nationalId) => {
    try {
      const res = await fetch(`/api/patients/${nationalId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.patientExists) {
          setPatientExists(true);
          setFormData((prevData) => ({
            ...prevData,
            ...data.data,
            rawId: data.data.nationalId,
            rawBirthDate: data.data.birthDate,
          }));
        } else {
          setPatientExists(false);
        }
      } else {
        setPatientExists(false);
      }
    } catch (error) {
      console.error("Error checking patient:", error);
      toast.error("Failed to check patient existence. Please try again.");
    }
  };

  useEffect(() => {
    if (session && session.user.role === "registrar") {
      const fetchRegistrarData = async () => {
        try {
          const res = await fetch(`/api/registrars`);
          const data = await res.json();
          const registrar = data.find((r) => r.email === session.user.email);
          if (registrar) {
            setFormData((prev) => ({
              ...prev,
              hospitalName: registrar.hospital,
              nationalId: formData.rawId,
              registeredBy: registrar.name || session.user.name,
              name: name || prev.name,
              rawBirthDate: birthDate || prev.rawBirthDate,
              rawId: id || prev.rawId,
            }));
          }
        } catch (error) {
          console.error("Error fetching registrar data:", error);
          toast.error("Failed to fetch registrar data. Please try again.");
        }
      };
      fetchRegistrarData();
    }
  }, [session, name, id, birthDate]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || session.user.role !== "registrar") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 font-semibold">Unauthorized</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    const requiredFields = {
      nationalId: formData.rawId,
      diseaseName: formData.diseaseName,
      diseaseDescription: formData.diseaseDescription,
      medication: formData.medication,
      hospitalName: formData.hospitalName,
      doctorName: formData.doctorName,
    };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key]
    );

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nationalId: formData.rawId,
          name: formData.name,
          diseaseName: formData.diseaseName,
          diseaseDescription: formData.diseaseDescription,
          medication: formData.medication,
          hospitalName: formData.hospitalName,
          doctorName: formData.doctorName,
          dateAdded: formData.dateAdded,
          registeredBy: formData.registeredBy,
          registrarHospital: formData.hospitalName,
        }),
      });

      if (res.ok) {
        toast.success("Patient record updated successfully!");
        router.push("/registrar");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to register patient.");
      }
    } catch (error) {
      console.error("Error registering patient:", error);
      toast.error("Failed to register patient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanQR = async () => {
    setIsScanning(true);
    try {
      await router.push("/scan-qr-existing");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Navbar />
      <div className="flex-1 p-6">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-primary">
              Add Existing User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    readOnly
                    className="bg-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rawId">National ID *</Label>
                  <Input
                    id="rawId"
                    name="rawId"
                    value={formData.rawId}
                    readOnly
                    className="bg-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rawBirthDate">Birth Date *</Label>
                  <Input
                    id="rawBirthDate"
                    name="rawBirthDate"
                    value={formData.rawBirthDate}
                    readOnly
                    className="bg-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diseaseName">Disease Name *</Label>
                  <Input
                    id="diseaseName"
                    name="diseaseName"
                    value={formData.diseaseName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diseaseDescription">
                    Disease Description *
                  </Label>
                  <Input
                    id="diseaseDescription"
                    name="diseaseDescription"
                    value={formData.diseaseDescription}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medication">Medication *</Label>
                  <Input
                    id="medication"
                    name="medication"
                    value={formData.medication}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateAdded">Date Added *</Label>
                  <Input
                    id="dateAdded"
                    name="dateAdded"
                    type="date"
                    value={formData.dateAdded}
                    readOnly
                    className="bg-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital Name *</Label>
                  <Input
                    id="hospitalName"
                    name="hospitalName"
                    value={formData.hospitalName}
                    readOnly
                    className="bg-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Doctor Name *</Label>
                  <Input
                    id="doctorName"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registeredBy">
                    Registrar`&apos;`s Name *
                  </Label>
                  <Input
                    id="registeredBy"
                    name="registeredBy"
                    value={formData.registeredBy}
                    readOnly
                    className="bg-gray-200"
                    required
                  />
                </div>
              </div>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleScanQR}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    "Scan QR Code"
                  )}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Patient"
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrarExistingAdd;
