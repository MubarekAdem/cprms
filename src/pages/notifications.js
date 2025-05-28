"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { Smartphone, Download, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function NotificationsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error logging out: " + error.message);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      console.log(`Approving role request ${requestId}`);
      const res = await fetch(`/api/role-requests/${requestId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(
          `Failed to approve request ${requestId}: ${res.status}, Response: ${errorText}`
        );
        throw new Error(
          `Failed to approve request: ${res.status} - ${errorText}`
        );
      }
      const data = await res.json();
      console.log(`Approval response:`, data);
      toast.success("Role request approved successfully");
      setRequests(requests.filter((req) => req._id !== requestId));
    } catch (error) {
      console.error("Error approving role request:", error);
      toast.error("Error approving role request: " + error.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      console.log(`Rejecting role request ${requestId}`);
      const res = await fetch(`/api/role-requests/${requestId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(
          `Failed to reject request ${requestId}: ${res.status}, Response: ${errorText}`
        );
        throw new Error(
          `Failed to reject request: ${res.status} - ${errorText}`
        );
      }
      const data = await res.json();
      console.log(`Rejection response:`, data);
      toast.success("Role request rejected successfully");
      setRequests(requests.filter((req) => req._id !== requestId));
    } catch (error) {
      console.error("Error rejecting role request:", error);
      toast.error("Error rejecting role request: " + error.message);
    }
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching role requests from: /api/role-requests");
        const res = await fetch("/api/role-requests");
        if (!res.ok) {
          const errorText = await res.text();
          console.error(
            `Failed to fetch requests: ${res.status}, Response: ${errorText}`
          );
          throw new Error(`Failed to fetch requests: ${res.status}`);
        }
        const data = await res.json();
        console.log("Fetched requests:", data);

        // Filter unique requests by user and requestedRole, handling null users
        const uniqueRequests = data.reduce((acc, req) => {
          if (!req.user) {
            console.warn(`Skipping request with null user: ${req._id}`);
            return acc; // Skip requests with null user
          }
          const key = `${req.user._id}-${req.requestedRole}`;
          if (
            !acc[key] ||
            new Date(req.createdAt) > new Date(acc[key].createdAt)
          ) {
            acc[key] = req;
          }
          return acc;
        }, {});
        setRequests(Object.values(uniqueRequests));
      } catch (error) {
        console.error("Error fetching role requests:", error);
        toast.error("Error fetching role requests: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (
      status === "authenticated" &&
      (!session?.user?.role || session?.user?.role === "None")
    ) {
      fetchRequests();
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    return null; // The useEffect will handle the redirect
  }

  // Show mobile app prompt for first-aid role
  if (session?.user?.role === "first-aid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="border-none shadow-md max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">
              Use Our Mobile App
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <Smartphone className="h-12 w-12 text-primary" />
            <p className="text-gray-600 dark:text-gray-300">
              Please use our mobile app to access first-aid features.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary hover:underline"
              >
                <Download className="h-5 w-5" />
                <span>App Store</span>
              </a>
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary hover:underline"
              >
                <Download className="h-5 w-5" />
                <span>Google Play</span>
              </a>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="mt-4 flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check for unauthorized roles
  if (
    session &&
    session?.user?.role &&
    session?.user?.role !== "None" &&
    session?.user?.role !== "first-aid"
  ) {
    console.log(
      "Unauthorized - Session:",
      session,
      "Role:",
      session?.user?.role
    );
    return <p className="text-center text-red-500 mt-10">Unauthorized</p>;
  }

  // Rest of the original code for other roles
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Role Request Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                <span>Loading requests...</span>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                <p>No role requests available.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="font-medium">User Name</TableHead>
                      <TableHead className="font-medium">Email</TableHead>
                      <TableHead className="font-medium">
                        Requested Role
                      </TableHead>
                      <TableHead className="font-medium">Request ID</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="text-right font-medium">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow
                        key={request._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="font-medium">
                          {request.user?.name ||
                            request.user?.email ||
                            "Unknown User"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="mr-1 h-3 w-3 text-gray-400" />
                            {request.user?.email || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {request.requestedRole}
                          </Badge>
                        </TableCell>
                        <TableCell>{request._id}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary Grand"
                            className="text-right space-x-2"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveRequest(request._id)}
                              disabled={request.status !== "pending"}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectRequest(request._id)}
                              disabled={request.status !== "pending"}
                            >
                              Reject
                            </Button>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
