"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Loader2, Mail, Search, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/admin-dashboard/dashboard-skeleton";

export default function SuperAdminDashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [roleRequests, setRoleRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("super-admin");

  useEffect(() => {
    if (status === "loading") {
      const timer = setTimeout(() => {
        update();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, update]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/admins");
      if (!res.ok) throw new Error(`Failed to fetch admins: ${res.status}`);
      const data = await res.json();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Error fetching admins: " + error.message);
    }
  }, []);

  const fetchRoleRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/role-requests");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `Failed to fetch role requests: ${res.status}`
        );
      }
      const data = await res.json();
      setRoleRequests(data);
    } catch (error) {
      console.error("Error fetching role requests:", error);
      toast.error("Failed to load role request statuses. Please try again.");
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "super-admin") {
      fetchUsers();
      fetchAdmins();
      fetchRoleRequests();
    }
  }, [fetchUsers, fetchAdmins, fetchRoleRequests, session, status]);

  const filteredUsers = users.filter(
    (user) =>
      user?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const handleRequestAdminRole = async (userId) => {
    try {
      const res = await fetch("/api/role-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, requestedRole: "admin" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `Failed to request role: ${res.status}`
        );
      }
      toast.success("Admin role request sent successfully");
      fetchRoleRequests();
    } catch (error) {
      console.error("Error requesting admin role:", error);
      toast.error(`Error requesting role: ${error.message}`);
    }
  };

  const handleRemoveRole = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}/remove-role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `Failed to remove role: ${res.status}`
        );
      }
      toast.success("Admin role removed successfully");
      fetchUsers();
      fetchAdmins();
      fetchRoleRequests();
    } catch (error) {
      console.error("Error removing admin role:", error);
      toast.error(`Error removing admin role: ${error.message}`);
    }
  };

  // Group users by role, only including admin-related roles
  const groupedUsers = filteredUsers.reduce((acc, user) => {
    const role =
      user.role === "super-admin" || user.role === "admin" ? user.role : "None";
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {});

  // Define role order for display
  const roleOrder = ["super-admin", "admin", "None"];

  // Filter roles that have users
  const availableRoles = roleOrder.filter(
    (role) => (groupedUsers[role] || []).length > 0
  );

  // Ensure selectedRole is valid
  useEffect(() => {
    if (!availableRoles.includes(selectedRole) && availableRoles.length > 0) {
      setSelectedRole(availableRoles[0]);
    }
  }, [groupedUsers, selectedRole, availableRoles]);

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (!session || session?.user?.role !== "super-admin") {
    return <p className="text-center text-red-500 mt-10">Unauthorized</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-primary to-accent text-white shadow-lg">
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
                <User className="mr-2 h-5 w-5 text-primary" />
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
              <div className="flex">
                <div className="w-48 bg-gray-100 dark:bg-gray-800 p-4 rounded-l-md">
                  <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-300">
                    Roles
                  </h3>
                  <ul className="space-y-1">
                    {availableRoles.map((role) => (
                      <li key={role}>
                        <button
                          onClick={() => setSelectedRole(role)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                            selectedRole === role
                              ? "bg-blue-500 text-white"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {role === "None" ? "No Role" : role.replace("-", " ")}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 pl-4 overflow-hidden">
                  {availableRoles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      {searchTerm ? (
                        <>
                          <Search className="h-8 w-8 mb-2 text-gray-400" />
                          <p>No users found matching `{searchTerm}`</p>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                          <p>No users available.</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div
                      className="transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(0)` }}
                    >
                      {selectedRole && (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50 dark:bg-gray-800">
                                <TableHead className="font-medium">
                                  Name
                                </TableHead>
                                <TableHead className="font-medium">
                                  Email
                                </TableHead>
                                <TableHead className="font-medium">
                                  Role
                                </TableHead>
                                <TableHead className="font-medium">
                                  Request Status
                                </TableHead>
                                <TableHead className="text-right font-medium">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(groupedUsers[selectedRole] || []).map(
                                (user) => {
                                  const pendingRequest = roleRequests.find(
                                    (req) =>
                                      req.user &&
                                      req.user._id === user._id &&
                                      req.status === "pending"
                                  );
                                  return (
                                    <TableRow
                                      key={user._id || Math.random()}
                                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                      <TableCell className="font-medium">
                                        {`${user.firstName} ${user.lastName}` ||
                                          "N/A"}
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
                                      <TableCell>
                                        {pendingRequest ? (
                                          <Badge variant="secondary">
                                            Pending
                                          </Badge>
                                        ) : (
                                          "None"
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right space-x-2">
                                        {user.role === "admin" ? (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleRemoveRole(user._id)
                                            }
                                            disabled={pendingRequest}
                                          >
                                            Remove Admin Role
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleRequestAdminRole(user._id)
                                            }
                                            disabled={
                                              pendingRequest ||
                                              user.role === "admin" ||
                                              user.role === "super-admin"
                                            }
                                            className={
                                              pendingRequest ||
                                              user.role === "admin" ||
                                              user.role === "super-admin"
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }
                                          >
                                            Request Admin Role
                                          </Button>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                }
                              )}
                              {(groupedUsers[selectedRole] || []).length ===
                                0 && (
                                <TableRow>
                                  <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-gray-500"
                                  >
                                    No users in this role.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <style jsx>{`
        .transition-transform {
          transition: transform 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
