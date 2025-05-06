import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/admin-dashboard/dashboard-header";
import DashboardStats from "@/components/admin-dashboard/dashboard-stats";
import HospitalDistributionChart from "@/components/admin-dashboard/hospital-distribution-chart";
import PatientRecordsChart from "@/components/admin-dashboard/patient-records-chart";
import StaffDistributionChart from "@/components/admin-dashboard/staff-distribution-chart";
import RecentPatients from "@/components/admin-dashboard/recent-patients";
import HospitalMap from "@/components/admin-dashboard/hospital-map";
import DashboardSidebar from "@/components/admin-dashboard/dashboard-sidebar";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session || session.user.role !== "admin") {
    return <p className="text-center text-red-500 text-xl">Unauthorized</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <Navbar />
        <main className="flex-1 p-6 md:p-8">
          <DashboardHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <DashboardStats />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <HospitalDistributionChart />
            <PatientRecordsChart />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <StaffDistributionChart />
            <HospitalMap />
            <RecentPatients />
          </div>
        </main>
      </div>
    </div>
  );
}
