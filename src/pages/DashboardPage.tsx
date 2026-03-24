import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CalendarOff, DollarSign, Building2, Activity } from "lucide-react";
import { dashboardApi } from "@/lib/dashboardApi";

interface Stats {
  totalEmployees: number;
  activeLeaves: number;
  totalPayroll: number;
  activeCompanies: number;
}

export default function DashboardPage() {
  const { user, isSuperAdmin } = useAuth();

  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    activeLeaves: 0,
    totalPayroll: 0,
    activeCompanies: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.stats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Active Leaves",
      value: stats.activeLeaves,
      icon: CalendarOff,
      color: "text-warning",
    },
    {
      label: "Total Payroll",
      value: `₦${stats.totalPayroll.toLocaleString()}`, // 🇳🇬 switched to Naira
      icon: DollarSign,
      color: "text-success",
    },
    ...(isSuperAdmin
      ? [
          {
            label: "Companies",
            value: stats.activeCompanies,
            icon: Building2,
            color: "text-secondary",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-header">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.first_name}!</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="stat-card">
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-3xl font-bold mt-1">
                  {loading ? "—" : s.value}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${s.color}`}
              >
                <s.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </h3>
          <p className="text-sm text-muted-foreground">
            Activity feed will populate from API data as events come in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}