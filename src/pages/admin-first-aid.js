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
import { toast } from "sonner";
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
  const showSkeleton = useDelayedLoading(status === "loading" || isLoading);
  const triggerRef = useRef(null);

  // Restrict access
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

  // Delete first aid responder
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this first aid responder?"))
      return;

    try {
      const res = await fetch(`/api/first-aid/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete first aid responder");
      setFirstAids(firstAids.filter((responder) => responder._id !== id));
      toast.success("First aid responder deleted successfully");
    } catch (error) {
      toast.error("Error deleting first aid responder: " + error.message);
    }
  };

  // Open edit modal
  const openEditModal = (responder) => {
    const [firstName, ...lastNameParts] = responder.name.split(" ");
    setSelectedFirstAid({
      ...responder,
      firstName,
      lastName: lastNameParts.join(" "),
    });
    setEditModalOpen(true);
  };

  // Handle edit form input
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedFirstAid((prev) => ({ ...prev, [name]: value }));
  };

  // Update first aid responder
  const handleEditSubmit = async () => {
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
          hospital: selectedFirstAid.hospital,
        }),
      });
      if (!res.ok) throw new Error("Failed to update first aid responder");
      await fetchFirstAids();
      setEditModalOpen(false);
      setSelectedFirstAid(null);
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
      toast.success("First aid responder updated successfully");
    } catch (error) {
      toast.error("Error updating first aid responder: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFirstAidForm((prev) => ({ ...prev, [name]: value }));
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

  // Add First Aid Responder
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/first-aid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firstAidForm),
      });

      if (!res.ok)
        throw new Error(
          (await res.json()).error || "Failed to add first aid responder"
        );

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
    } catch (error) {
      toast.error("Error adding first aid responder: " + error.message);
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
                <Building2 className="mr-2 h-5 w-5 text-primary" />
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
                        <TableCell colSpan={5} className="h-24 text-center">
                          {searchTerm ? (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <Search className="h-8 w-8 mb-2 text-gray-400" />
                              <p>No responders found matching {searchTerm}</p>
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
          <CardHeader className="bg-gradient-to-r from-primary to-accent">
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
                  className="w-full"
                />
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
                  className="w-full"
                />
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
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={firstAidForm.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  required
                  className="w-full"
                />
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
                  className="w-full"
                />
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
                  onValueChange={(value) =>
                    setFirstAidForm({ ...firstAidForm, hospital: value })
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
                <Label htmlFor="firstAidId">First Aid ID</Label>
                <Input
                  id="firstAidId"
                  name="firstAidId"
                  value={firstAidForm.firstAidId}
                  onChange={handleInputChange}
                  placeholder="FA-12345"
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
                {firstAidForm.proofDocument && !isUploading && (
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
                <FileText className="mr-2 h-5 w-5 text-black" />
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
                    value={selectedFirstAid?.lastName || ""}
                    onChange={handleEditChange}
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
                    value={selectedFirstAid?.email || ""}
                    onChange={handleEditChange}
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
                    value={selectedFirstAid?.phone || ""}
                    onChange={handleEditChange}
                    placeholder="Phone number"
                    className="bg-white text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hospital" className="text-black">
                    Hospital
                  </Label>
                  <Select
                    value={selectedFirstAid?.hospital || ""}
                    onValueChange={(value) =>
                      setSelectedFirstAid({
                        ...selectedFirstAid,
                        hospital: value,
                      })
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
                    onClick={() => {
                      setSelectedFirstAid(null);
                      setEditModalOpen(false);
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
