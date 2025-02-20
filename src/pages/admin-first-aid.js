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

export default function FirstAidDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [firstAids, setFirstAids] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [firstAidForm, setFirstAidForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    hospital: "",
    firstAidId: "",
    proofDocument: null,
  });

  // Restrict access
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/"); // Redirect if not admin
    }
  }, [session, status, router]);

  // Fetch first aids
  useEffect(() => {
    const fetchFirstAids = async () => {
      const res = await fetch("/api/first-aid");
      const data = await res.json();
      if (Array.isArray(data)) {
        setFirstAids(data);
      } else {
        console.error("Error fetching first aids");
      }
    };
    fetchFirstAids();
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
    setFirstAidForm((prev) => ({
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
        .from("first-aid")
        .upload(`proof-documents/${Date.now()}_${file.name}`, file);

      if (error) {
        console.error("File upload error:", error);
        return;
      }

      const proofDocumentUrl = `https://your-supabase-url/storage/v1/object/public/first-aid/${data.path}`;
      setFirstAidForm((prev) => ({
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
    const res = await fetch("/api/first-aid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(firstAidForm),
    });
    const data = await res.json();
    if (res.ok) {
      setFirstAids((prev) => [...prev, data.firstAid]);
      setFirstAidForm({
        name: "",
        email: "",
        phone: "",
        role: "",
        hospital: "",
        firstAidId: "",
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
          {/* First Aid Count Card */}
          <div className="space-y-6">
            <Card className="border border-blue-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  First Aid
                </CardTitle>
                <UserCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {firstAids.length}
                </div>
              </CardContent>
            </Card>

            {/* First Aid Table */}
            <Card>
              <CardHeader>
                <CardTitle>First Aid List</CardTitle>
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
                    {firstAids.length > 0 ? (
                      firstAids.map((firstAid, i) => (
                        <TableRow key={i}>
                          <TableCell>{firstAid.name}</TableCell>
                          <TableCell>{firstAid.email}</TableCell>
                          <TableCell>{firstAid.phone}</TableCell>
                          <TableCell>{firstAid.role}</TableCell>
                          <TableCell>{firstAid.hospital}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="5" className="text-center">
                          No first aid responders available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Add First Aid Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add First Aid Responder</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Similar form fields like in the Doctor's dashboard */}
                {/* Name, Email, Phone, Role, Hospital, First Aid ID, Proof Document */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    name="name"
                    value={firstAidForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter first aid responder name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={firstAidForm.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    name="phone"
                    value={firstAidForm.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    name="role"
                    value={firstAidForm.role}
                    onValueChange={(value) =>
                      setFirstAidForm({ ...firstAidForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first-aid">First Aid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hospital</label>
                  <Select
                    name="hospital"
                    value={firstAidForm.hospital}
                    onValueChange={(value) =>
                      setFirstAidForm({ ...firstAidForm, hospital: value })
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
                  <label className="text-sm font-medium">First Aid ID</label>
                  <Input
                    name="firstAidId"
                    value={firstAidForm.firstAidId}
                    onChange={handleInputChange}
                    placeholder="Enter first aid ID"
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
