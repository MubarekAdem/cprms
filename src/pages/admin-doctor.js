"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  AlertCircle,
  Building2,
  CheckCircle,
  FileText,
  Hospital,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function DoctorsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "doctor",
    hospital: "",
    doctorId: "",
    proofDocument: "",
  });
  const [editDoctor, setEditDoctor] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restrict access
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/");
      toast.error("Access denied. Admin privileges required.");
    }
  }, [session, status, router]);

  // Fetch doctors
  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/doctors");
      if (!res.ok) throw new Error("Failed to fetch doctors");
      const data = await res.json();
      setDoctors(data);
    } catch (error) {
      toast.error("Error fetching doctors: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch("/api/hospitals");
        if (!res.ok) throw new Error("Failed to fetch hospitals");
        const data = await res.json();
        setHospitals(data);
      } catch (error) {
        toast.error("Error fetching hospitals: " + error.message);
      }
    };
    fetchHospitals();
  }, []);

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file upload with progress
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      const { data, error } = await supabase.storage
        .from("doctors")
        .upload(`proof-documents/${Date.now()}_${file.name}`, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw error;
      }

      const proofDocumentUrl = `https://pnglcnwerkxshicljpet.supabase.co/storage/v1/object/public/doctors/${data.path}`;
      setDoctorForm((prev) => ({ ...prev, proofDocument: proofDocumentUrl }));

      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);

      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error.message);
      toast.error("Error uploading file: " + error.message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Add Doctor
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorForm),
      });

      if (!res.ok) throw new Error("Failed to add doctor");

      toast.success("Doctor added successfully");
      fetchDoctors(); // Refresh doctors list
      setDoctorForm({
        name: "",
        email: "",
        phone: "",
        role: "doctor",
        hospital: "",
        doctorId: "",
        proofDocument: "",
      });
    } catch (error) {
      toast.error("Error adding doctor: " + error.message);
    } finally {
      setIsSubmitting(false);
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

      toast.success("Doctor updated successfully");
      fetchDoctors(); // Refresh doctors list
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error("Error updating doctor: " + error.message);
    }
  };

  // Handle Delete
  const handleDelete = async (doctorId) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const res = await fetch(`/api/doctors/${doctorId}`, { method: "DELETE" });

      if (!res.ok) throw new Error("Failed to delete doctor");

      toast.success("Doctor deleted successfully");
      fetchDoctors();
    } catch (error) {
      toast.error("Error deleting doctor: " + error.message);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Loading session...
          </h3>
        </div>
      </div>
    );
  }

  if (!session) return null; // Will redirect in useEffect

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <Users className="mr-2 h-5 w-5" />
                Total Doctors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{doctors.length}</div>
              <p className="mt-1 text-sm opacity-80">
                Active medical professionals
              </p>
            </CardContent>
          </Card>

          {/* <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                Verified Doctors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(doctors.length * 0.8)}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Fully verified credentials
              </p>
            </CardContent>
          </Card> */}

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <Building2 className="mr-2 h-5 w-5 text-blue-500" />
                Hospitals Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{hospitals.length}</div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Partner medical facilities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Doctors List */}
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-bold">
              Doctors Directory
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search doctors..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                <span>Loading doctors...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="font-medium">Name</TableHead>
                      <TableHead className="font-medium">Contact</TableHead>
                      <TableHead className="font-medium">Role</TableHead>
                      <TableHead className="font-medium">Hospital</TableHead>
                      <TableHead className="text-right font-medium">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.length > 0 ? (
                      filteredDoctors.map((doctor) => (
                        <TableRow
                          key={doctor._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="font-medium">
                            {doctor.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Mail className="mr-1 h-3 w-3" /> {doctor.email}
                              </span>
                              <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Phone className="mr-1 h-3 w-3" />{" "}
                                {doctor.phone}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {doctor.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Building2 className="mr-1 h-3 w-3 text-gray-400" />
                              <span>{doctor.hospital}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditClick(doctor)}
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(doctor._id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Doctor
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          {searchTerm ? (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <Search className="h-8 w-8 mb-2 text-gray-400" />
                              <p>No doctors found matching `{searchTerm}`</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                              <p>No doctors available.</p>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Doctor Form */}
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardTitle className="flex items-center text-xl font-bold">
              <UserPlus className="mr-2 h-5 w-5 text-primary" />
              Add New Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Doctor Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={doctorForm.name}
                  onChange={handleInputChange}
                  placeholder="Dr. John Doe"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={doctorForm.email}
                  onChange={handleInputChange}
                  placeholder="doctor@example.com"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={doctorForm.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={doctorForm.role}
                  onValueChange={(value) =>
                    setDoctorForm({ ...doctorForm, role: value })
                  }
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital</Label>
                <Select
                  value={doctorForm.hospital}
                  onValueChange={(value) =>
                    setDoctorForm({ ...doctorForm, hospital: value })
                  }
                >
                  <SelectTrigger id="hospital" className="w-full">
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
                <Label htmlFor="doctorId">Doctor ID</Label>
                <Input
                  id="doctorId"
                  name="doctorId"
                  value={doctorForm.doctorId}
                  onChange={handleInputChange}
                  placeholder="MED-12345"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proofDocument">Proof Document</Label>
                <div className="mt-1">
                  <label className="flex w-full cursor-pointer items-center rounded-md border border-dashed border-gray-300 p-3 text-sm text-gray-500 hover:border-primary/50 dark:border-gray-700">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload document</span>
                    <input
                      id="proofDocument"
                      type="file"
                      className="sr-only"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {isUploading && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {doctorForm.proofDocument && !isUploading && (
                  <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Document uploaded successfully
                  </div>
                )}
              </div>

              <div className="md:col-span-2 mt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Doctor
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Edit Doctor Modal */}
        {isEditModalOpen && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-md bg-white text-black border border-white p-6 rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center text-xl font-semibold text-black">
                  <FileText className="mr-2 h-5 w-5 text-black" />
                  Edit Doctor
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-name"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-white" /> Name
                  </Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={editDoctor.name}
                    onChange={(e) =>
                      setEditDoctor({ ...editDoctor, name: e.target.value })
                    }
                    placeholder="Doctor name"
                    className="bg-white text-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-email"
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4 text-white" /> Email
                  </Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={editDoctor.email}
                    onChange={(e) =>
                      setEditDoctor({ ...editDoctor, email: e.target.value })
                    }
                    placeholder="Email address"
                    className="bg-white text-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-phone"
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4 text-white" /> Phone
                  </Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    value={editDoctor.phone}
                    onChange={(e) =>
                      setEditDoctor({ ...editDoctor, phone: e.target.value })
                    }
                    placeholder="Phone number"
                    className="bg-white text-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-hospital"
                    className="flex items-center gap-2"
                  >
                    <Hospital className="h-4 w-4 text-white" /> Hospital
                  </Label>
                  <Select
                    value={editDoctor.hospital}
                    onValueChange={(value) =>
                      setEditDoctor({ ...editDoctor, hospital: value })
                    }
                  >
                    <SelectTrigger
                      id="edit-hospital"
                      className="bg-white text-black"
                    >
                      <SelectValue placeholder="Select Hospital" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      {hospitals.map((hospital) => (
                        <SelectItem
                          key={hospital._id}
                          value={hospital.name}
                          className="text-black"
                        >
                          {hospital.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="flex space-x-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="border-black text-blavk hover:bg-gray-500"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditSave}
                  className="bg-white text-black hover:bg-gray-300"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
