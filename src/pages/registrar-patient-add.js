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

const RegistrarPatientAdd = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { name, id, birthDate } = router.query;

  const [formData, setFormData] = useState({
    name: "",
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
    nationalId: "",
    rawBirthDate: "",
    rawId: "",
    registeredBy: "",
  });

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
    if (formData.password !== formData.repeatPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          registeredBy: formData.registeredBy,
          registrarHospital: formData.hospitalName,
          birthDate: formData.rawBirthDate,
        }),
      });

      if (res.ok) {
        toast.success("Patient registered successfully!");
        router.push("/registrar-dashboard");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error);
      }
    } catch (error) {
      console.error("Error registering patient:", error);
      toast.error("Failed to register patient. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  readOnly
                  className="bg-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rawId">National ID</Label>
                <Input
                  id="rawId"
                  name="rawId"
                  value={formData.rawId}
                  readOnly
                  className="bg-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rawBirthDate">Birth Date</Label>
                <Input
                  id="rawBirthDate"
                  name="rawBirthDate"
                  value={formData.rawBirthDate}
                  readOnly
                  className="bg-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
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
                <Label htmlFor="emergencyNumber">Emergency Number</Label>
                <Input
                  id="emergencyNumber"
                  name="emergencyNumber"
                  value={formData.emergencyNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  name="bloodType"
                  value={formData.bloodType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, bloodType: value })
                  }
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
                <Label htmlFor="diseaseName">Disease Name</Label>
                <Input
                  id="diseaseName"
                  name="diseaseName"
                  value={formData.diseaseName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diseaseDescription">Disease Description</Label>
                <Input
                  id="diseaseDescription"
                  name="diseaseDescription"
                  value={formData.diseaseDescription}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medication">Medication</Label>
                <Input
                  id="medication"
                  name="medication"
                  value={formData.medication}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateAdded">Date Added</Label>
                <Input
                  id="dateAdded"
                  name="dateAdded"
                  type="date"
                  value={formData.dateAdded}
                  readOnly
                  className="bg-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repeatPassword">Repeat Password</Label>
                <Input
                  id="repeatPassword"
                  name="repeatPassword"
                  type="password"
                  value={formData.repeatPassword}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospitalName">Hospital Name</Label>
                <Input
                  id="hospitalName"
                  name="hospitalName"
                  value={formData.hospitalName}
                  readOnly
                  className="bg-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorName">Doctor Name</Label>
                <Input
                  id="doctorName"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registeredBy">Registrar's Name</Label>
                <Input
                  id="registeredBy"
                  name="registeredBy"
                  value={formData.registeredBy}
                  className="bg-gray-200"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/scan-qr")}>
            Scan QR Code
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Register Patient
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegistrarPatientAdd;
