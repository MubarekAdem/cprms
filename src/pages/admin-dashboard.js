import DashboardHeader from "@/components/admin-dashboard/dashboard-header";
import DashboardStats from "@/components/admin-dashboard/dashboard-stats";
import HospitalDistributionChart from "@/components/admin-dashboard/hospital-distribution-chart";
import PatientRecordsChart from "@/components/admin-dashboard/patient-records-chart";
import StaffDistributionChart from "@/components/admin-dashboard/staff-distribution-chart";
import RecentPatients from "@/components/admin-dashboard/recent-patients";
import HospitalMap from "@/components/admin-dashboard/hospital-map";
import DashboardSidebar from "@/components/admin-dashboard/dashboard-sidebar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardSidebar />
      <main className="md:ml-64">
        {" "}
        {/* Add margin-left to account for sidebar width */}
        <div className="p-6 md:p-8">
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
        </div>
      </main>
    </div>
  );
}
