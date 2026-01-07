import { Breadcrumbs } from "../../components/breadcrumbs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumbs />
      {children}
    </div>
  );
}

