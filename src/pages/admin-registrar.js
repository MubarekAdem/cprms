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

export default function RegistrarsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registrars, setRegistrars] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [registrarForm, setRegistrarForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    hospital: "",
    registrarId: "",
    proofDocument: null,
  });

  // Restrict access
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/"); // Redirect if not admin
    }
  }, [session, status, router]);

  // Fetch registrars
  useEffect(() => {
    const fetchRegistrars = async () => {
      const res = await fetch("/api/registrars");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRegistrars(data);
      } else {
        console.error("Error fetching registrars");
      }
    };
    fetchRegistrars();
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
    setRegistrarForm((prev) => ({
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
        .from("registrars")
        .upload(`proof-documents/${Date.now()}_${file.name}`, file);

      if (error) {
        console.error("File upload error:", error);
        return;
      }

      const proofDocumentUrl = `https://pnglcnwerkxshicljpet.supabase.co/storage/v1/object/public/registrars/${data.path}`;
      setRegistrarForm((prev) => ({
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
    const res = await fetch("/api/registrars", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrarForm),
    });
    const data = await res.json();
    if (res.ok) {
      setRegistrars((prev) => [...prev, data.registrar]);
      setRegistrarForm({
        name: "",
        email: "",
        phone: "",
        role: "",
        hospital: "",
        registrarId: "",
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
          {/* Registrars Count Card */}
          <div className="space-y-6">
            <Card className="border border-blue-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Registrars
                </CardTitle>
                <UserCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {registrars.length}
                </div>
              </CardContent>
            </Card>

            {/* Registrars Table */}
            <Card>
              <CardHeader>
                <CardTitle>Registrars List</CardTitle>
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
                    {registrars.length > 0 ? (
                      registrars.map((registrar, i) => (
                        <TableRow key={i}>
                          <TableCell>{registrar.name}</TableCell>
                          <TableCell>{registrar.email}</TableCell>
                          <TableCell>{registrar.phone}</TableCell>
                          <TableCell>{registrar.role}</TableCell>
                          <TableCell>{registrar.hospital}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="5" className="text-center">
                          No registrars available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Add Registrar Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Registrar</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Registrar Name</label>
                  <Input
                    name="name"
                    value={registrarForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter registrar name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={registrarForm.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    name="phone"
                    value={registrarForm.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    name="role"
                    value={registrarForm.role}
                    onValueChange={(value) =>
                      setRegistrarForm({ ...registrarForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registrar">Registrar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hospital</label>
                  <Select
                    name="hospital"
                    value={registrarForm.hospital}
                    onValueChange={(value) =>
                      setRegistrarForm({ ...registrarForm, hospital: value })
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
                  <label className="text-sm font-medium">Registrar ID</label>
                  <Input
                    name="registrarId"
                    value={registrarForm.registrarId}
                    onChange={handleInputChange}
                    placeholder="Enter registrar ID"
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
