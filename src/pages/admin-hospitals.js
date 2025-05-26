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
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
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
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/admin-dashboard/dashboard-skeleton";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";

// Static JSON data for Ethiopian cities
const ethiopianCities = [
  { city: "Addis Ababa", region: "Addis Ababa (Chartered City)" },
  { city: "Dire Dawa", region: "Dire Dawa (Chartered City)" },
  { city: "Mek'ele", region: "Tigray" },
  { city: "Gondar", region: "Amhara" },
  { city: "Bahir Dar", region: "Amhara" },
  { city: "Adama (Nazret)", region: "Oromia" },
  { city: "Hawassa", region: "Sidama" },
  { city: "Jimma", region: "Oromia" },
  { city: "Jijiga", region: "Somali" },
  { city: "Dessie", region: "Amhara" },
  { city: "Bishoftu (Debre Zeit)", region: "Oromia" },
  { city: "Shashamane", region: "Oromia" },
  {
    city: "Arba Minch",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  { city: "Harar", region: "Harari" },
  { city: "Asosa", region: "Benishangul-Gumuz" },
  { city: "Gambella", region: "Gambella" },
  { city: "Semera", region: "Afar" },
  { city: "Debre Markos", region: "Amhara" },
  { city: "Debre Berhan", region: "Amhara" },
  { city: "Kombolcha", region: "Amhara" },
  {
    city: "Dilla",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  {
    city: "Hosaena",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  { city: "Nekemte", region: "Oromia" },
  { city: "Ambo", region: "Oromia" },
  { city: "Woliso", region: "Oromia" },
  { city: "Sebeta", region: "Oromia" },
  { city: "Adigrat", region: "Tigray" },
  { city: "Axum", region: "Tigray" },
  { city: "Shire (Inda Selassie)", region: "Tigray" },
  { city: "Lalibela", region: "Amhara" },
  { city: "Woldia", region: "Amhara" },
  { city: "Bonga", region: "South West Ethiopia Peoples' Region (SWEPR)" },
  {
    city: "Mizan Teferi",
    region: "South West Ethiopia Peoples' Region (SWEPR)",
  },
  {
    city: "Sawla",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  { city: "Gode", region: "Somali" },
  { city: "Kebri Dahar", region: "Somali" },
  { city: "Asella", region: "Oromia" },
  { city: "Robe", region: "Oromia" },
  { city: "Metu", region: "Oromia" },
  { city: "Yirgalem", region: "Sidama" },
  { city: "Alemaya", region: "Oromia" },
  { city: "Mojo", region: "Oromia" },
  { city: "Ziway", region: "Oromia" },
  {
    city: "Butajira",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  {
    city: "Wolaita Sodo",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  { city: "Gimbi", region: "Oromia" },
  { city: "Agaro", region: "Oromia" },
  { city: "Chiro (Asebe Teferi)", region: "Oromia" },
  { city: "Finote Selam", region: "Amhara" },
  { city: "Dejen", region: "Amhara" },
  { city: "Mota", region: "Amhara" },
  { city: "Adwa", region: "Tigray" },
  { city: "Humera", region: "Tigray" },
  { city: "Debre Tabor", region: "Amhara" },
  { city: "Burayu", region: "Oromia" },
  { city: "Hagere Hiwot", region: "Amhara" },
  {
    city: "Durame",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  { city: "Goba", region: "Oromia" },
  { city: "Meki", region: "Oromia" },
];

export default function HospitalsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editHospital, setEditHospital] = useState(null);
  const [hospitalForm, setHospitalForm] = useState({
    name: "",
    id: "",
    location: "",
    proofDocument: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const showSkeleton = useDelayedLoading(status === "loading" || isLoading);
  const triggerRef = useRef(null);

  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    id: "",
    location: "",
    proofDocument: "",
  });

  // Add validation function
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Hospital Name validation
    if (!hospitalForm.name.trim()) {
      errors.name = "Hospital name is required";
      isValid = false;
    } else if (hospitalForm.name.length < 3) {
      errors.name = "Hospital name must be at least 3 characters";
      isValid = false;
    } else if (!/^[A-Za-z0-9\s-]+$/.test(hospitalForm.name)) {
      errors.name =
        "Hospital name can only contain letters, numbers, spaces, and hyphens";
      isValid = false;
    }

    // Hospital ID validation
    if (!hospitalForm.id.trim()) {
      errors.id = "Hospital ID is required";
      isValid = false;
    } else if (!/^[A-Za-z0-9-]+$/.test(hospitalForm.id)) {
      errors.id = "Hospital ID can only contain letters, numbers, and hyphens";
      isValid = false;
    }

    // Location validation
    if (!hospitalForm.location) {
      errors.location = "Location is required";
      isValid = false;
    }

    // Proof Document validation
    if (!hospitalForm.proofDocument) {
      errors.proofDocument = "Proof document is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Restrict access
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/");
      toast.error("Access denied. Admin privileges required.");
    }
  }, [session, status, router]);

  // Load cities from JSON
  useEffect(() => {
    // Map JSON to match expected structure (name)
    const formattedCities = ethiopianCities.map((city, index) => ({
      _id: index.toString(),
      name: city.city,
    }));
    setCities(formattedCities);
  }, []);

  // Fetch hospitals
  const fetchHospitals = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // Filter hospitals based on search term
  const filteredHospitals = hospitals.filter(
    (hospital) =>
      hospital.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open Edit Modal
  const openEditModal = (hospital) => {
    setEditHospital(hospital);
    setEditModalOpen(true);
    setHospitalForm({
      name: hospital.name,
      id: hospital.id,
      location: hospital.location,
      proofDocument: hospital.proofDocument,
    });
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setEditHospital(null);
    setEditModalOpen(false);
    setHospitalForm({
      name: "",
      id: "",
      location: "",
      proofDocument: "",
    });
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  // Update Hospital
  const handleUpdateHospital = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/hospitals/${editHospital.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hospitalForm),
      });

      if (!res.ok) throw new Error("Failed to update hospital");

      setHospitals((prev) =>
        prev.map((h) =>
          h.id === editHospital.id ? { ...h, ...hospitalForm } : h
        )
      );
      closeEditModal();
      toast.success("Hospital updated successfully");
    } catch (error) {
      toast.error("Error updating hospital: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHospitalForm((prev) => ({ ...prev, [name]: value }));
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
        .from("hospital-proof")
        .upload(`proof-documents/${Date.now()}_${file.name}`, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw error;
      }

      const proofDocumentUrl = `https://pnglcnwerkxshicljpet.supabase.co/storage/v1/object/public/hospital-proof/${data.path}`;
      setHospitalForm((prev) => ({ ...prev, proofDocument: proofDocumentUrl }));

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

  // Update handleSubmit to handle duplicate validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hospitalForm),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle duplicate errors
        if (data.error?.includes("duplicate key error")) {
          if (data.error.includes("name")) {
            setValidationErrors((prev) => ({
              ...prev,
              name: "A hospital with this name already exists",
            }));
            toast.error("A hospital with this name already exists");
          } else if (data.error.includes("id")) {
            setValidationErrors((prev) => ({
              ...prev,
              id: "This Hospital ID is already in use",
            }));
            toast.error("This Hospital ID is already in use");
          }
        } else {
          throw new Error(data.error || "Failed to add hospital");
        }
        return;
      }

      toast.success("Hospital added successfully");
      setHospitals((prev) => [...prev, data.hospital]);
      setHospitalForm({
        name: "",
        id: "",
        location: "",
        proofDocument: "",
      });
      setValidationErrors({});
    } catch (error) {
      toast.error("Error adding hospital: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Hospital
  const handleDeleteHospital = async (id) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return;

    try {
      const res = await fetch(`/api/hospitals/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete hospital");

      setHospitals((prev) => prev.filter((h) => h.id !== id));
      toast.success("Hospital deleted successfully");
    } catch (error) {
      toast.error("Error deleting hospital: " + error.message);
    }
  };

  if (showSkeleton) {
    return <DashboardSkeleton />;
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <Building2 className="mr-2 h-5 w-5" />
                Total Hospitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{hospitals.length}</div>
              <p className="mt-1 text-sm opacity-80">Registered facilities</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                Cities Covered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{cities.length}</div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Locations with hospitals
              </p>
            </CardContent>
          </Card>
        </div>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-bold">
              Hospitals Directory
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search hospitals..."
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
                <span>Loading hospitals...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="font-medium">Name</TableHead>
                      <TableHead className="font-medium">ID</TableHead>
                      <TableHead className="font-medium">Location</TableHead>
                      <TableHead className="font-medium">
                        Proof Document
                      </TableHead>
                      <TableHead className="text-right font-medium">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHospitals.length > 0 ? (
                      filteredHospitals.map((hospital) => (
                        <TableRow
                          key={hospital.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="font-medium">
                            {hospital.name}
                          </TableCell>
                          <TableCell>{hospital.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3 text-gray-400" />
                              <span>{hospital.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {hospital.proofDocument ? (
                              <a
                                href={hospital.proofDocument}
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
                                  aria-label={`Open menu for ${hospital.name}`}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEditModal(hospital)}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteHospital(hospital.id)
                                  }
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Hospital
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
                              <p>No hospitals found matching {searchTerm} </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                              <p>No hospitals available.</p>
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
              <Plus className="mr-2 h-5 w-5 text-primary" />
              Add New Hospital
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Hospital Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={hospitalForm.name}
                  onChange={handleInputChange}
                  placeholder="Hospital Name"
                  required
                  className={`w-full ${
                    validationErrors.name ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="id">Hospital ID</Label>
                <Input
                  id="id"
                  name="id"
                  value={hospitalForm.id}
                  onChange={handleInputChange}
                  placeholder="HOSP-12345"
                  required
                  className={`w-full ${
                    validationErrors.id ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.id && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.id}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={hospitalForm.location}
                  onValueChange={(value) => {
                    setHospitalForm((prev) => ({ ...prev, location: value }));
                    setValidationErrors((prev) => ({ ...prev, location: "" }));
                  }}
                >
                  <SelectTrigger
                    id="location"
                    className={`w-full ${
                      validationErrors.location ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city._id} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.location && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.location}
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
                {validationErrors.proofDocument && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.proofDocument}
                  </p>
                )}
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
                {hospitalForm.proofDocument && !isUploading && (
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
                      Add Hospital
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Dialog
          open={editModalOpen}
          onClose={closeEditModal}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="sm:max-w-md bg-white text-black border border-white p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
              <DialogTitle className="flex items-center text-xl font-semibold text-black">
                <FileText className="mr-2 h-5 w-5 text-black" />
                Edit Hospital
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-gray-600">
                Update the details of the hospital below and save your changes.
              </DialogDescription>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-black">
                    Hospital Name
                  </Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={hospitalForm.name}
                    onChange={handleInputChange}
                    placeholder="Hospital Name"
                    className="bg-white text-black"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-id" className="text-black">
                    Hospital ID
                  </Label>
                  <Input
                    id="edit-id"
                    name="id"
                    value={hospitalForm.id}
                    onChange={handleInputChange}
                    placeholder="HOSP-12345"
                    className="bg-white text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location" className="text-black">
                    Location
                  </Label>
                  <Select
                    value={hospitalForm.location}
                    onValueChange={(value) =>
                      setHospitalForm((prev) => ({ ...prev, location: value }))
                    }
                  >
                    <SelectTrigger
                      id="edit-location"
                      className="bg-white text-black"
                    >
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      {cities.map((city) => (
                        <SelectItem
                          key={city._id}
                          value={city.name}
                          className="text-black"
                        >
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-proofDocument" className="text-black">
                    Proof Document
                  </Label>
                  <div className="mt-1">
                    <label className="flex w-full cursor-pointer items-center rounded-md border border-dashed border-gray-300 p-3 text-sm text-gray-500 hover:border-primary/50 dark:border-gray-700">
                      <Upload className="mr-2 h-4 w-4" />
                      <span>Upload new document</span>
                      <input
                        id="edit-proofDocument"
                        type="file"
                        className="sr-only"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  {hospitalForm.proofDocument && (
                    <div className="mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <FileText className="mr-1 h-4 w-4" />
                      <a
                        href={hospitalForm.proofDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Current Document
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 justify-end mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEditModal}
                    className="border-black text-black hover:bg-gray-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateHospital}
                    className="bg-white text-black hover:bg-gray-300"
                    disabled={isSubmitting || isUploading}
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
