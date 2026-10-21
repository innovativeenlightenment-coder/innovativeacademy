"use client"
import PageContainer from "@/app/(DashboardLayout)/dashboard/components/container/PageContainer";
import DashboardRouter from "./components/dashboard/DashboardRouter";

export default function DashboardPage() {
  return (
    <PageContainer
      title="Dashboard"
      description="Innovative Academy Dashboard"
    >
      <DashboardRouter />
    </PageContainer>
  );
}
