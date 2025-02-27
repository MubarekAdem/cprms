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
import { MoreVertical, UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
    proofDocument: "",
  });
  const [editDoctor, setEditDoctor] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Restrict access
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/");
    }
  }, [session, status, router]);

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch("/api/hospitals");
        const data = await res.json();
        setHospitals(data);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      }
    };
    fetchHospitals();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
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

      const proofDocumentUrl = `https://pnglcnwerkxshicljpet.supabase.co/storage/v1/object/public/doctors/${data.path}`;
      setDoctorForm((prev) => ({ ...prev, proofDocument: proofDocumentUrl }));
    } catch (error) {
      console.error("Error uploading file:", error.message);
    }
  };

  // Add Doctor
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorForm),
      });

      if (!res.ok) throw new Error("Failed to add doctor");

      fetchDoctors(); // Refresh doctors list
      setDoctorForm({
        name: "",
        email: "",
        phone: "",
        role: "",
        hospital: "",
        doctorId: "",
        proofDocument: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Open Edit Modal
  const handleEditClick = (doctor) => {
    setEditDoctor(doctor);
    setIsEditModalOpen(true);
  };

  // Handle Edit Save
  const handleEditSave = async () => {
    try {
      const res = await fetch(`/api/doctors/${editDoctor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDoctor),
      });

      if (!res.ok) throw new Error("Failed to update doctor");

      fetchDoctors(); // Refresh doctors list
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle Delete
  const handleDelete = async (doctorId) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const res = await fetch(`/api/doctors/${doctorId}`, { method: "DELETE" });

      if (!res.ok) throw new Error("Failed to delete doctor");

      fetchDoctors();
    } catch (error) {
      console.error(error);
    }
  };

  if (status === "loading") return <p>Loading session...</p>;
  if (!session) return <p>Access denied</p>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <Navbar />
      <div className="flex-1 p-6">
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <TableRow key={doctor._id}>
                      <TableCell>{doctor.name}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell>{doctor.phone}</TableCell>
                      <TableCell>{doctor.role}</TableCell>
                      <TableCell>{doctor.hospital}</TableCell>
                      <TableCell>
                        <MoreVertical
                          className="cursor-pointer"
                          onClick={() => handleEditClick(doctor)}
                        />
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(doctor._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center">
                      No doctors available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Doctor Modal */}
        {isEditModalOpen && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Doctor</DialogTitle>
              </DialogHeader>

              {/* Name */}
              <label className="text-sm font-medium">Name</label>
              <Input
                name="name"
                value={editDoctor.name}
                onChange={(e) =>
                  setEditDoctor({ ...editDoctor, name: e.target.value })
                }
              />

              {/* Email */}
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                value={editDoctor.email}
                onChange={(e) =>
                  setEditDoctor({ ...editDoctor, email: e.target.value })
                }
              />

              {/* Phone */}
              <label className="text-sm font-medium">Phone</label>
              <Input
                name="phone"
                value={editDoctor.phone}
                onChange={(e) =>
                  setEditDoctor({ ...editDoctor, phone: e.target.value })
                }
              />

              {/* Hospital Selection */}
              <label className="text-sm font-medium">Hospital</label>
              <Select
                name="hospital"
                value={editDoctor.hospital}
                onValueChange={(value) =>
                  setEditDoctor({ ...editDoctor, hospital: value })
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

              <DialogFooter>
                <Button onClick={handleEditSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
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
  );
}
