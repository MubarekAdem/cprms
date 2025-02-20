"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Import Supabase client for file uploads

export default function DoctorsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    hospital: "",
    doctorId: "",
    proofDocument: null,
  });

  // Restrict access
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/"); // Redirect if not admin
    }
  }, [session, status, router]);

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDoctors(data);
      } else {
        console.error("Error fetching doctors");
      }
    };
    fetchDoctors();
  }, []);

  // Fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      const res = await fetch("/api/hospitals");
      const data = await res.json();
      if (Array.isArray(data)) {
        setHospitals(data);
      } else {
        console.error("Error fetching hospitals");
      }
    };
    fetchHospitals();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { data, error } = await supabase.storage
        .from("doctors")
        .upload(`proof-documents/${Date.now()}_${file.name}`, file);

      if (error) {
        console.error("File upload error:", error);
        return;
      }

      const proofDocumentUrl = `https://your-supabase-url/storage/v1/object/public/doctors/${data.path}`;
      setDoctorForm((prev) => ({
        ...prev,
        proofDocument: proofDocumentUrl,
      }));
    } catch (error) {
      console.error("Error uploading file:", error.message);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(doctorForm),
    });
    const data = await res.json();
    if (res.ok) {
      setDoctors((prev) => [...prev, data.doctor]);
      setDoctorForm({
        name: "",
        email: "",
        phone: "",
        role: "",
        hospital: "",
        doctorId: "",
        proofDocument: null,
      });
    } else {
      console.error(data.error);
    }
  };

  if (status === "loading") {
    return <p>Loading session...</p>;
  }

  if (!session) {
    return <p>Access denied</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-[1fr,400px]">
          {/* Doctors Count Card */}
          <div className="space-y-6">
            <Card className="border border-blue-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Doctors
                </CardTitle>
                <UserCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {doctors.length}
                </div>
              </CardContent>
            </Card>

            {/* Doctors Table */}
            <Card>
              <CardHeader>
                <CardTitle>Doctors List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Hospital</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.length > 0 ? (
                      doctors.map((doctor, i) => (
                        <TableRow key={i}>
                          <TableCell>{doctor.name}</TableCell>
                          <TableCell>{doctor.email}</TableCell>
                          <TableCell>{doctor.phone}</TableCell>
                          <TableCell>{doctor.role}</TableCell>
                          <TableCell>{doctor.hospital}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="5" className="text-center">
                          No doctors available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Add Doctor Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Doctor Name</label>
                  <Input
                    name="name"
                    value={doctorForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter doctor name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={doctorForm.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    name="phone"
                    value={doctorForm.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    name="role"
                    value={doctorForm.role}
                    onValueChange={(value) =>
                      setDoctorForm({ ...doctorForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="first-aid">First Aid</SelectItem>
                      <SelectItem value="registrar">Registrar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hospital</label>
                  <Select
                    name="hospital"
                    value={doctorForm.hospital}
                    onValueChange={(value) =>
                      setDoctorForm({ ...doctorForm, hospital: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map((hospital) => (
                        <SelectItem key={hospital._id} value={hospital.name}>
                          {hospital.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Doctor ID</label>
                  <Input
                    name="doctorId"
                    value={doctorForm.doctorId}
                    onChange={handleInputChange}
                    placeholder="Enter doctor ID"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Proof Document</label>
                  <input type="file" onChange={handleFileUpload} />
                </div>
                <Button className="w-full">Submit</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
