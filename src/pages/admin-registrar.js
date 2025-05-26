"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
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
import { toast, Toaster } from "sonner";
import { DashboardSkeleton } from "@/components/admin-dashboard/dashboard-skeleton";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";

export default function RegistrarsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registrars, setRegistrars] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRegistrar, setSelectedRegistrar] = useState(null);
  const [registrarForm, setRegistrarForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "registrar",
    hospital: "",
    registrarId: "",
    proofDocument: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const showSkeleton = useDelayedLoading(status === "loading" || isLoading);
  const triggerRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    hospital: "",
    registrarId: "",
    proofDocument: "",
  });

  // Restrict access
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/");
      toast.error("Access denied. Admin privileges required.");
    }
  }, [session, status, router]);

  // Fetch registrars
  const fetchRegistrars = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/registrars");
      if (!res.ok) throw new Error("Failed to fetch registrars");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRegistrars(data);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      toast.error("Error fetching registrars: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrars();
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

  // Filter registrars based on search term
  const filteredRegistrars = registrars.filter(
    (registrar) =>
      registrar.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registrar.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registrar.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete registrar
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this registrar?")) return;

    try {
      const res = await fetch(`/api/registrars/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete registrar");
      setRegistrars(registrars.filter((registrar) => registrar._id !== id));
      toast.success("Registrar deleted successfully");
    } catch (error) {
      toast.error("Error deleting registrar: " + error.message);
    }
  };

  // Open edit modal
  const handleEdit = (registrar) => {
    const [firstName, ...lastNameParts] = registrar.name.split(" ");
    setSelectedRegistrar({
      ...registrar,
      firstName,
      lastName: lastNameParts.join(" "),
      password: "",
    });
    setEditModalOpen(true);
  };

  // Handle edit form input
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedRegistrar((prev) => ({ ...prev, [name]: value }));
  };

  // Update registrar
  const handleEditSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/registrars/${selectedRegistrar._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: selectedRegistrar.firstName,
          lastName: selectedRegistrar.lastName,
          email: selectedRegistrar.email,
          phone: selectedRegistrar.phone,
          password: selectedRegistrar.password,
          hospital: selectedRegistrar.hospital,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error && data.field) {
          toast.error(data.message || data.error);
        } else {
          throw new Error(data.error || "Failed to update registrar");
        }
        return;
      }
      await fetchRegistrars();
      handleCloseDialog();
      toast.success("Registrar updated successfully");
    } catch (error) {
      toast.error("Error updating registrar: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setEditModalOpen(false);
    setSelectedRegistrar(null);
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // First Name validation
    if (!registrarForm.firstName.trim()) {
      errors.firstName = "First name is required";
      isValid = false;
    } else if (registrarForm.firstName.length < 2) {
      errors.firstName = "First name must be at least 2 characters";
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(registrarForm.firstName)) {
      errors.firstName = "First name can only contain letters and spaces";
      isValid = false;
    }

    // Last Name validation
    if (!registrarForm.lastName.trim()) {
      errors.lastName = "Last name is required";
      isValid = false;
    } else if (registrarForm.lastName.length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(registrarForm.lastName)) {
      errors.lastName = "Last name can only contain letters and spaces";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!registrarForm.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(registrarForm.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!registrarForm.phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!phoneRegex.test(registrarForm.phone)) {
      errors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    // Password validation
    if (!registrarForm.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (registrarForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registrarForm.password)) {
      errors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
      isValid = false;
    }

    // Hospital validation
    if (!registrarForm.hospital) {
      errors.hospital = "Hospital is required";
      isValid = false;
    }

    // Registrar ID validation
    if (!registrarForm.registrarId.trim()) {
      errors.registrarId = "Registrar ID is required";
      isValid = false;
    } else if (!/^[A-Za-z0-9-]+$/.test(registrarForm.registrarId)) {
      errors.registrarId =
        "Registrar ID can only contain letters, numbers, and hyphens";
      isValid = false;
    }

    // Proof Document validation
    if (!registrarForm.proofDocument) {
      errors.proofDocument = "Proof document is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrarForm((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
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
        .from("registrars")
        .upload(`proof-documents/${Date.now()}_${file.name}`, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw error;
      }

      const proofDocumentUrl = `https://pnglcnwerkxshicljpet.supabase.co/storage/v1/object/public/registrars/${data.path}`;
      setRegistrarForm((prev) => ({
        ...prev,
        proofDocument: proofDocumentUrl,
      }));

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

  // Handle form submission with proper error handling
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/registrars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrarForm),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle field-specific errors (email, phone, registrarId)
        if (data.error && data.field) {
          setValidationErrors((prev) => ({
            ...prev,
            [data.field]: data.message || data.error,
          }));
          toast.error(data.message || data.error);
        } else {
          throw new Error(data.error || "Failed to add registrar");
        }
        return;
      }

      toast.success("Registrar added successfully");
      fetchRegistrars();
      setRegistrarForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        role: "registrar",
        hospital: "",
        registrarId: "",
        proofDocument: "",
      });
      setValidationErrors({});
    } catch (error) {
      toast.error("Error adding registrar: " + error.message);
    } finally {
      setIsSubmitting(false);
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
                Total Registrars
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{registrars.length}</div>
              <p className="mt-1 text-sm opacity-80">Active registrars</p>
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
              Registrars Directory
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search registrars..."
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
                <span>Loading registrars...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="font-medium">Name</TableHead>
                      <TableHead className="font-medium">Contact</TableHead>
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
                    {filteredRegistrars.length > 0 ? (
                      filteredRegistrars.map((registrar) => (
                        <TableRow
                          key={registrar._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="font-medium">
                            {registrar.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Mail className="mr-1 h-3 w-3" />{" "}
                                {registrar.email}
                              </span>
                              <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Phone className="mr-1 h-3 w-3" />{" "}
                                {registrar.phone}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Building2 className="mr-1 h-3 w-3 text-gray-400" />
                              <span>{registrar.hospital}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {registrar.proofDocument ? (
                              <a
                                href={registrar.proofDocument}
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
                                  aria-label={`Open menu for ${registrar.name}`}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(registrar)}
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(registrar._id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Registrar
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
                              <p>No registrars found matching {searchTerm}</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                              <p>No registrars available.</p>
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
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="flex items-center text-xl font-bold">
              <UserPlus className="mr-2 h-5 w-5 text-primary" />
              Add New Registrar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={registrarForm.firstName}
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
                  value={registrarForm.lastName}
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
                  value={registrarForm.email}
                  onChange={handleInputChange}
                  placeholder="registrar@example.com"
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
                  value={registrarForm.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
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
                  value={registrarForm.password}
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
                  value={registrarForm.role}
                  onValueChange={(value) =>
                    setRegistrarForm({ ...registrarForm, role: value })
                  }
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registrar">Registrar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital</Label>
                <Select
                  value={registrarForm.hospital}
                  onValueChange={(value) =>
                    setRegistrarForm({ ...registrarForm, hospital: value })
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
                {validationErrors.hospital && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.hospital}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrarId">Registrar ID</Label>
                <Input
                  id="registrarId"
                  name="registrarId"
                  value={registrarForm.registrarId}
                  onChange={handleInputChange}
                  placeholder="REG-12345"
                  required
                  className={`w-full ${
                    validationErrors.registrarId ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.registrarId && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.registrarId}
                  </p>
                )}
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
                {registrarForm.proofDocument && !isUploading && (
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
                      Add Registrar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Dialog
          open={editModalOpen}
          onClose={handleCloseDialog}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="sm:max-w-md bg-white text-black border border-white p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
              <DialogTitle className="flex items-center text-xl font-semibold text-black">
                <FileText className="mr-2 h-5 w-5 text-black" />
                Edit Registrar
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-gray-600">
                Update the details of the registrar below and save your changes.
              </DialogDescription>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName" className="text-black">
                    First Name
                  </Label>
                  <Input
                    id="edit-firstName"
                    name="firstName"
                    value={selectedRegistrar?.firstName || ""}
                    onChange={handleEditInputChange}
                    placeholder="First name"
                    className="bg-white text-black"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName" className="text-black">
                    Last Name
                  </Label>
                  <Input
                    id="edit-lastName"
                    name="lastName"
                    value={selectedRegistrar?.lastName || ""}
                    onChange={handleEditInputChange}
                    placeholder="Last name"
                    className="bg-white text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-black">
                    Email
                  </Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={selectedRegistrar?.email || ""}
                    onChange={handleEditInputChange}
                    placeholder="Email address"
                    className="bg-white text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-black">
                    Phone
                  </Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    value={selectedRegistrar?.phone || ""}
                    onChange={handleEditInputChange}
                    placeholder="Phone number"
                    className="bg-white text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hospital" className="text-black">
                    Hospital
                  </Label>
                  <Select
                    value={selectedRegistrar?.hospital || ""}
                    onValueChange={(value) =>
                      setSelectedRegistrar((prev) => ({
                        ...prev,
                        hospital: value,
                      }))
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
                <div className="flex space-x-2 justify-end mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
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
