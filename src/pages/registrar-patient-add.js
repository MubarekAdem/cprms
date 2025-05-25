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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function RegistrarPatientAdd() {
  const { data: session, status } = useSession({ required: true });
  const router = useRouter();
  const { name, id, birthDate } = router.query;
  const [patientExists, setPatientExists] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    name: name ? decodeURIComponent(name) : "",
    phone: "",
    address: "",
    gender: "",
    emergencyNumber: "",
    bloodType: "",
    otherDisease: "",
    password: "",
    repeatPassword: "",
    diseaseName: "",
    diseaseDescription: "",
    medication: "",
    dateAdded: new Date().toISOString().split("T")[0],
    hospitalName: "",
    doctorName: "",
    nationalId: id || "",
    rawBirthDate: birthDate ? decodeURIComponent(birthDate) : "",
    rawId: id || "",
    registeredBy: "",
  });

  // Check patient existence
  useEffect(() => {
    if (router.isReady && formData.rawId) {
      console.log("Checking patient existence for ID:", formData.rawId);
      const checkPatientExists = async () => {
        try {
          const res = await fetch(`/api/patients/${formData.rawId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.patientExists) {
              setPatientExists(true);
              setFormData((prevData) => ({
                ...prevData,
                ...data.data,
                name: prevData.name, // Preserve QR data
                rawId: prevData.rawId,
                rawBirthDate: prevData.rawBirthDate,
              }));
              toast.info(
                "Patient already exists. Form pre-filled with existing data."
              );
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
      checkPatientExists();
    }
  }, [router.isReady, formData.rawId]);

  // Fetch registrar data
  useEffect(() => {
    if (
      router.isReady &&
      status === "authenticated" &&
      session?.user?.role === "registrar"
    ) {
      console.log("Query params:", { name, id, birthDate });
      console.log("Session:", session);
      const fetchRegistrarData = async () => {
        try {
          const res = await fetch(`/api/registrars`);
          const data = await res.json();
          console.log("Registrar data:", data);
          const registrar = data.find((r) => r.email === session.user.email);
          if (registrar) {
            console.log("Found registrar:", registrar);
            setFormData((prev) => ({
              ...prev,
              hospitalName: registrar.hospital || "Unknown Hospital",
              registeredBy:
                registrar.name || session.user.name || "Unknown Registrar",
              name: decodeURIComponent(name || prev.name),
              rawId: id || prev.rawId,
              rawBirthDate: birthDate
                ? decodeURIComponent(birthDate)
                : prev.rawBirthDate,
            }));
          } else {
            console.warn("No registrar found for email:", session.user.email);
            toast.warning(
              "No registrar profile found. Please update your profile."
            );
            setFormData((prev) => ({
              ...prev,
              hospitalName: "Unknown Hospital",
              registeredBy: session.user.name || "Unknown Registrar",
              name: decodeURIComponent(name || prev.name),
              rawId: id || prev.rawId,
              rawBirthDate: birthDate
                ? decodeURIComponent(birthDate)
                : prev.rawBirthDate,
            }));
          }
        } catch (error) {
          console.error("Error fetching registrar data:", error);
          toast.error("Failed to fetch registrar data. Please try again.");
        }
      };
      fetchRegistrarData();
    }
  }, [router.isReady, session, status, name, id, birthDate]);

  // Update formData when query params change
  useEffect(() => {
    if (router.isReady) {
      console.log("Updating formData with query params:", {
        name,
        id,
        birthDate,
      });
      if (!id || !birthDate) {
        toast.warning("Missing national ID or birth date from QR scan.");
      }
      setFormData((prev) => ({
        ...prev,
        name: name ? decodeURIComponent(name) : prev.name,
        rawId: id || prev.rawId,
        rawBirthDate: birthDate
          ? decodeURIComponent(birthDate)
          : prev.rawBirthDate,
        nationalId: id || prev.nationalId,
      }));
    }
  }, [router.isReady, name, id, birthDate]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || session.user.role !== "registrar") {
    console.log("Unauthorized - Session:", session);
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
    if (formData.password !== formData.repeatPassword) {
      toast.error("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

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

    // Additional fields for new patients
    const newPatientFields = {
      name: formData.name,
      birthDate: formData.rawBirthDate,
      phone: formData.phone,
      address: formData.address,
      gender: formData.gender,
      emergencyNumber: formData.emergencyNumber,
      bloodType: formData.bloodType,
      password: formData.password,
    };
    const missingNewPatientFields = patientExists
      ? []
      : Object.keys(newPatientFields).filter((key) => !newPatientFields[key]);

    if (missingFields.length > 0 || missingNewPatientFields.length > 0) {
      toast.error(
        `Please fill in all required fields: ${[
          ...missingFields,
          ...missingNewPatientFields,
        ].join(", ")}`
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
          phone: formData.phone,
          address: formData.address,
          gender: formData.gender,
          emergencyNumber: formData.emergencyNumber,
          bloodType: formData.bloodType,
          birthDate: formData.rawBirthDate,
          otherDisease: formData.otherDisease,
          password: formData.password,
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
        toast.success("Patient registered successfully!");
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
      await router.push("/scan-qr");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Navbar />
      <div className="flex-1 p-6">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-primary">
              Add Patient
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
                    value={formData.name || ""}
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
                    value={formData.rawId || ""}
                    onChange={handleInputChange}
                    className="bg-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rawBirthDate">Birth Date *</Label>
                  <Input
                    id="rawBirthDate"
                    name="rawBirthDate"
                    value={formData.rawBirthDate || ""}
                    readOnly
                    className="bg-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyNumber">Emergency Number *</Label>
                  <Input
                    id="emergencyNumber"
                    name="emergencyNumber"
                    value={formData.emergencyNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type *</Label>
                  <Select
                    name="bloodType"
                    value={formData.bloodType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bloodType: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherDisease">Other Disease</Label>
                  <Input
                    id="otherDisease"
                    name="otherDisease"
                    value={formData.otherDisease}
                    onChange={handleInputChange}
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
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repeatPassword">Repeat Password *</Label>
                  <Input
                    id="repeatPassword"
                    name="repeatPassword"
                    type="password"
                    value={formData.repeatPassword}
                    onChange={handleInputChange}
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
                  <Label htmlFor="registeredBy">Registrar's Name *</Label>
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
}
