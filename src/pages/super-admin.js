// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
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
  Loader2,
  Mail,
  MoreHorizontal,
  Search,
  User,
  Users,
} from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
  const { data: session, status, update } = useSession(); // Add update method
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  console.log("SuperAdminDashboard - Status:", status, "Session:", session);
  console.log("Session user role:", session?.user?.role);
  console.log("Router pathname:", router.pathname);

  // Force session refresh if stuck on loading
  useEffect(() => {
    if (status === "loading") {
      const timer = setTimeout(() => {
        console.log("Status stuck on loading, forcing session update");
        update(); // Trigger session fetch
      }, 2000); // Wait 2 seconds
      return () => clearTimeout(timer);
    }
  }, [status, update]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Fetching users from: /api/users");
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
      const data = await res.json();
      console.log("Fetched users:", data);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch admin users
  const fetchAdmins = useCallback(async () => {
    try {
      console.log("Fetching admins from: /api/admins");
      const res = await fetch("/api/admins");
      if (!res.ok) throw new Error(`Failed to fetch admins: ${res.status}`);
      const data = await res.json();
      console.log("Fetched admins:", data);
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Error fetching admins: " + error.message);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "super-admin") {
      fetchUsers();
      fetchAdmins();
    }
  }, [fetchUsers, fetchAdmins, session, status]);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  // Open Edit Modal
  const handleEditClick = (user) => {
    setEditUser({ ...user, role: user.role || "None" });
    setIsEditModalOpen(true);
  };

  // Handle Role Change
  const handleEditSave = async () => {
    try {
      console.log("Updating user role for:", editUser._id);
      const res = await fetch(`/api/users/${editUser._id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editUser.role }),
      });

      if (!res.ok) throw new Error(`Failed to update user role: ${res.status}`);
      toast.success("User role updated successfully");
      fetchUsers();
      fetchAdmins();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Error updating user role: " + error.message);
    }
  };

  if (status === "loading") {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!session || session?.user?.role !== "super-admin") {
    console.log(
      "Unauthorized - Session:",
      session,
      "Role:",
      session?.user?.role
    );
    return <p className="text-center text-red-500 mt-10">Unauthorized</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <Users className="mr-2 h-5 w-5" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.length}</div>
              <p className="mt-1 text-sm opacity-80">Registered users</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <User className="mr-2 h-5 w-5 text-blue-500" />
                Admin Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{admins.length}</div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Users with admin privileges
              </p>
            </CardContent>
          </Card>
        </div>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-bold">Users Directory</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
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
                <span>Loading users...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="font-medium">Name</TableHead>
                      <TableHead className="font-medium">Email</TableHead>
                      <TableHead className="font-medium">Role</TableHead>
                      <TableHead className="text-right font-medium">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow
                          key={user._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="font-medium">
                            {user.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="mr-1 h-3 w-3 text-gray-400" />
                              {user.email || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {user.role || "None"}
                            </Badge>
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
                                  onClick={() => handleEditClick(user)}
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  Change Role
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          {searchTerm ? (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <Search className="h-8 w-8 mb-2 text-gray-400" />
                              <p>No users found matching `{searchTerm}`</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                              <p>No users available.</p>
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
        {isEditModalOpen && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-xl font-semibold">
                  <User className="mr-2 h-5 w-5" />
                  Change User Role
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editUser?.name || "N/A"}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    value={editUser?.email || "N/A"}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editUser?.role || "None"}
                    onValueChange={(value) =>
                      setEditUser({ ...editUser, role: value })
                    }
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="first-aid">First Aid</SelectItem>
                      <SelectItem value="registrar">Registrar</SelectItem>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex space-x-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditSave}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
