"use client";

import { useState, useEffect, useRef } from "react";
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
  DialogPanel,
  DialogTitle,
  DialogDescription,
} from "@headlessui/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "sonner";
import { DashboardSkeleton } from "@/components/admin-dashboard/dashboard-skeleton";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";

export default function FirstAidDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [firstAids, setFirstAids] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFirstAid, setSelectedFirstAid] = useState(null);
  const [firstAidForm, setFirstAidForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "first-aid",
    hospital: "",
    firstAidId: "",
    proofDocument: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const triggerRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    hospital: "",
    firstAidId: "",
    proofDocument: "",
  });
  const [editValidationErrors, setEditValidationErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    hospital: "",
  });
  const showSkeleton = useDelayedLoading(status === "loading" || isLoading);

  // Restrict access to admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/");
      toast.error("Access denied. Admin privileges required.");
    }
  }, [session, status, router]);

  // Fetch first aid responders
  const fetchFirstAids = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/first-aid");
      if (!res.ok) throw new Error("Failed to fetch first aid responders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setFirstAids(data);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      toast.error("Error fetching first aid responders: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFirstAids();
  }, []);

  // Fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch("/api/hospitals");
        if (!res.ok) throw new Error("Failed to fetch hospitals");
        const data = await res.json();
        if (Array.isArray(data)) {
          setHospitals(data);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        toast.error("Error fetching hospitals: " + error.message);
      }
    };
    fetchHospitals();
  }, []);

  // Filter first aid responders based on search term
  const filteredFirstAids = firstAids.filter(
    (responder) =>
      responder.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      responder.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      responder.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFirstAidForm((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedFirstAid((prev) => ({ ...prev, [name]: value }));
    setEditValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle file upload with progress
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
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
        .from("first-aid")
        .upload(`proof-documents/${Date.now()}_${file.name}`, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw error;
      }

      const proofDocumentUrl = `https://pnglcnwerkxshicljpet.supabase.co/storage/v1/object/public/first-aid/${data.path}`;
      setFirstAidForm((prev) => ({ ...prev, proofDocument: proofDocumentUrl }));
      setValidationErrors((prev) => ({ ...prev, proofDocument: "" }));

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

  // Validate add form
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // First Name validation
    if (!firstAidForm.firstName.trim()) {
      errors.firstName = "First name is required";
      isValid = false;
    } else if (firstAidForm.firstName.length < 2) {
      errors.firstName = "First name must be at least 2 characters";
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(firstAidForm.firstName)) {
      errors.firstName = "First name can only contain letters and spaces";
      isValid = false;
    }

    // Last Name validation
    if (!firstAidForm.lastName.trim()) {
      errors.lastName = "Last name is required";
      isValid = false;
    } else if (firstAidForm.lastName.length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(firstAidForm.lastName)) {
      errors.lastName = "Last name can only contain letters and spaces";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!firstAidForm.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(firstAidForm.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!firstAidForm.phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!phoneRegex.test(firstAidForm.phone)) {
      errors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    // Password validation
    if (!firstAidForm.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (firstAidForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(firstAidForm.password)) {
      errors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
      isValid = false;
    }

    // Hospital validation
    if (!firstAidForm.hospital) {
      errors.hospital = "Hospital is required";
      isValid = false;
    }

    // First Aid ID validation
    if (!firstAidForm.firstAidId.trim()) {
      errors.firstAidId = "First Aid ID is required";
      isValid = false;
    } else if (!/^[A-Za-z0-9-]+$/.test(firstAidForm.firstAidId)) {
      errors.firstAidId =
        "First Aid ID can only contain letters, numbers, and hyphens";
      isValid = false;
    }

    // Proof Document validation
    if (!firstAidForm.proofDocument) {
      errors.proofDocument = "Proof document is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Validate edit form
  const validateEditForm = () => {
    const errors = {};
    let isValid = true;

    if (!selectedFirstAid?.firstName?.trim()) {
      errors.firstName = "First name is required";
      isValid = false;
    } else if (selectedFirstAid.firstName.length < 2) {
      errors.firstName = "First name must be at least 2 characters";
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(selectedFirstAid.firstName)) {
      errors.firstName = "First name can only contain letters and spaces";
      isValid = false;
    }

    if (!selectedFirstAid?.lastName?.trim()) {
      errors.lastName = "Last name is required";
      isValid = false;
    } else if (selectedFirstAid.lastName.length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(selectedFirstAid.lastName)) {
      errors.lastName = "Last name can only contain letters and spaces";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!selectedFirstAid?.email?.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(selectedFirstAid.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!selectedFirstAid?.phone?.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!phoneRegex.test(selectedFirstAid.phone)) {
      errors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    if (!selectedFirstAid?.hospital) {
      errors.hospital = "Hospital is required";
      isValid = false;
    }

    setEditValidationErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/first-aid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firstAidForm),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error && data.field) {
          setValidationErrors((prev) => ({
            ...prev,
            [data.field]: data.message || data.error,
          }));
          toast.error(data.message || data.error);
        } else {
          throw new Error(data.error || "Failed to add first aid responder");
        }
        return;
      }

      toast.success("First aid responder added successfully");
      fetchFirstAids();
      setFirstAidForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        role: "first-aid",
        hospital: "",
        firstAidId: "",
        proofDocument: "",
      });
      setValidationErrors({});
    } catch (error) {
      toast.error("Error adding first aid responder: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (responder) => {
    const [firstName, ...lastNameParts] = responder.name.split(" ");
    setSelectedFirstAid({
      ...responder,
      firstName,
      lastName: lastNameParts.join(" "),
      password: "",
    });
    setEditValidationErrors({});
    setEditModalOpen(true);
  };

  // Handle edit submission
  const handleEditSubmit = async () => {
    if (!validateEditForm()) {
      toast.error("Please fix the validation errors before saving");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/first-aid/${selectedFirstAid._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: selectedFirstAid.firstName,
          lastName: selectedFirstAid.lastName,
          email: selectedFirstAid.email,
          phone: selectedFirstAid.phone,
          password: selectedFirstAid.password,
          hospital: selectedFirstAid.hospital,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error && data.field) {
          setEditValidationErrors((prev) => ({
            ...prev,
            [data.field]: data.message || data.error,
          }));
          toast.error(data.message || data.error);
        } else {
          throw new Error(data.error || "Failed to update first aid responder");
        }
        return;
      }

      toast.success("First aid responder updated successfully");
      fetchFirstAids();
      setEditModalOpen(false);
      setSelectedFirstAid(null);
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    } catch (error) {
      toast.error("Error updating first aid responder: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete first aid responder
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this first aid responder?"))
      return;

    try {
      const res = await fetch(`/api/first-aid/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete first aid responder");
      }

      toast.success("First aid responder deleted successfully");
      fetchFirstAids();
    } catch (error) {
      toast.error("Error deleting first aid responder: " + error.message);
    }
  };

  if (showSkeleton) {
    return <DashboardSkeleton />;
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Toaster richColors position="top-right" />
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-primary to-accent text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <Users className="mr-2 h-5 w-5" />
                Total Responders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{firstAids.length}</div>
              <p className="mt-1 text-sm opacity-80">
                Active first aid professionals
              </p>
            </CardContent>
          </Card>
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
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-bold">
              First Aid Responders Directory
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search responders..."
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
                <span>Loading responders...</span>
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
                      <TableHead className="font-medium">
                        Proof Document
                      </TableHead>
                      <TableHead className="text-right font-medium">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFirstAids.length > 0 ? (
                      filteredFirstAids.map((responder) => (
                        <TableRow
                          key={responder._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="font-medium">
                            {responder.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Mail className="mr-1 h-3 w-3" />{" "}
                                {responder.email}
                              </span>
                              <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Phone className="mr-1 h-3 w-3" />{" "}
                                {responder.phone}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {responder.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Building2 className="mr-1 h-3 w-3 text-gray-400" />
                              <span>{responder.hospital}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {responder.proofDocument ? (
                              <a
                                href={responder.proofDocument}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <FileText className="mr-1 h-4 w-4" />
                                View Document
                              </a>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">
                                No document
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  ref={triggerRef}
                                  aria-label={`Open menu for ${responder.name}`}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEditModal(responder)}
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(responder._id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Responder
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          {searchTerm ? (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <Search className="h-8 w-8 mb-2 text-gray-400" />
                              <p>No responders found matching "{searchTerm}"</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                              <p>No first aid responders available.</p>
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
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardTitle className="flex items-center text-xl font-bold">
              <UserPlus className="mr-2 h-5 w-5 text-primary" />
              Add First Aid Responder
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={firstAidForm.firstName}
                  onChange={handleInputChange}
                  placeholder="Abebe"
                  required
                  className={`w-full ${
                    validationErrors.firstName ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={firstAidForm.lastName}
                  onChange={handleInputChange}
                  placeholder="Kebede"
                  required
                  className={`w-full ${
                    validationErrors.lastName ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.lastName && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={firstAidForm.email}
                  onChange={handleInputChange}
                  placeholder="responder@example.com"
                  required
                  className={`w-full ${
                    validationErrors.email ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={firstAidForm.phone}
                  onChange={handleInputChange}
                  placeholder="+251912345678"
                  required
                  className={`w-full ${
                    validationErrors.phone ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={firstAidForm.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className={`w-full ${
                    validationErrors.password ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.password}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={firstAidForm.role}
                  onValueChange={(value) =>
                    setFirstAidForm({ ...firstAidForm, role: value })
                  }
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first-aid">First Aid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital</Label>
                <Select
                  value={firstAidForm.hospital}
                  onValueChange={(value) => {
                    setFirstAidForm({ ...firstAidForm, hospital: value });
                    setValidationErrors((prev) => ({ ...prev, hospital: "" }));
                  }}
                >
                  <SelectTrigger
                    id="hospital"
                    className={`w-full ${
                      validationErrors.hospital ? "border-red-500" : ""
                    }`}
                  >
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
                {validationErrors.hospital && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.hospital}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstAidId">First Aid ID</Label>
                <Input
                  id="firstAidId"
                  name="firstAidId"
                  value={firstAidForm.firstAidId}
                  onChange={handleInputChange}
                  placeholder="FA-12345"
                  required
                  className={`w-full ${
                    validationErrors.firstAidId ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.firstAidId && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.firstAidId}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="proofDocument">Proof Document</Label>
                <div className="mt-1">
                  <label
                    className={`flex w-full cursor-pointer items-center rounded-md border border-dashed ${
                      validationErrors.proofDocument
                        ? "border-red-500"
                        : "border-gray-300"
                    } p-3 text-sm text-gray-500 hover:border-primary/50 dark:border-gray-700`}
                  >
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
                {firstAidForm.proofDocument && !isUploading && (
                  <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Document uploaded successfully
                  </div>
                )}
                {validationErrors.proofDocument && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.proofDocument}
                  </p>
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
                      Add First Aid Responder
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Dialog
          open={editModalOpen}
          onClose={() => {
            setSelectedFirstAid(null);
            setEditModalOpen(false);
            setEditValidationErrors({});
            if (triggerRef.current) {
              triggerRef.current.focus();
            }
          }}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="sm:max-w-md bg-white text-black border border-white p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
              <DialogTitle className="flex items-center text-xl font-semibold text-black">
                <User className="mr-2 h-5 w-5 text-black" />
                Edit First Aid Responder
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-gray-600">
                Update the details of the first aid responder below and save
                your changes.
              </DialogDescription>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName" className="text-black">
                    First Name
                  </Label>
                  <Input
                    id="edit-firstName"
                    name="firstName"
                    value={selectedFirstAid?.firstName || ""}
                    onChange={handleEditChange}
                    placeholder="First name"
                    className={`bg-white text-black ${
                      editValidationErrors.firstName ? "border-red-500" : ""
                    }`}
                    autoFocus
                  />
                  {editValidationErrors.firstName && (
                    <p className="text-sm text-red-500 mt-1">
                      {editValidationErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName" className="text-black">
                    Last Name
                  </Label>
                  <Input
                    id="edit-lastName"
                    name="lastName"
                    value={selectedFirstAid?.lastName || ""}
                    onChange={handleEditChange}
                    placeholder="Last name"
                    className={`bg-white text-black ${
                      editValidationErrors.lastName ? "border-red-500" : ""
                    }`}
                  />
                  {editValidationErrors.lastName && (
                    <p className="text-sm text-red-500 mt-1">
                      {editValidationErrors.lastName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-black">
                    Email
                  </Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={selectedFirstAid?.email || ""}
                    onChange={handleEditChange}
                    placeholder="Email address"
                    className={`bg-white text-black ${
                      editValidationErrors.email ? "border-red-500" : ""
                    }`}
                  />
                  {editValidationErrors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {editValidationErrors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-black">
                    Phone
                  </Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    value={selectedFirstAid?.phone || ""}
                    onChange={handleEditChange}
                    placeholder="Phone number"
                    className={`bg-white text-black ${
                      editValidationErrors.phone ? "border-red-500" : ""
                    }`}
                  />
                  {editValidationErrors.phone && (
                    <p className="text-sm text-red-500 mt-1">
                      {editValidationErrors.phone}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hospital" className="text-black">
                    Hospital
                  </Label>
                  <Select
                    value={selectedFirstAid?.hospital || ""}
                    onValueChange={(value) => {
                      setSelectedFirstAid({
                        ...selectedFirstAid,
                        hospital: value,
                      });
                      setEditValidationErrors((prev) => ({
                        ...prev,
                        hospital: "",
                      }));
                    }}
                  >
                    <SelectTrigger
                      id="edit-hospital"
                      className={`bg-white text-black ${
                        editValidationErrors.hospital ? "border-red-500" : ""
                      }`}
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
                  {editValidationErrors.hospital && (
                    <p className="text-sm text-red-500 mt-1">
                      {editValidationErrors.hospital}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password" className="text-black">
                    Password (Optional)
                  </Label>
                  <Input
                    id="edit-password"
                    name="password"
                    type="password"
                    value={selectedFirstAid?.password || ""}
                    onChange={handleEditChange}
                    placeholder="Enter new password (leave blank to keep current)"
                    className="bg-white text-black"
                  />
                </div>
                <div className="flex space-x-2 justify-end mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedFirstAid(null);
                      setEditModalOpen(false);
                      setEditValidationErrors({});
                      if (triggerRef.current) {
                        triggerRef.current.focus();
                      }
                    }}
                    className="border-black text-black hover:bg-gray-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditSubmit}
                    className="bg-white text-black hover:bg-gray-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
