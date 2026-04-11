import { useEffect, useState } from "react";
import { attendanceApi } from "@/lib/attendanceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "present":
      return "default" as const;
    case "late":
      return "secondary" as const;
    case "absent":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  // Dashboard data
  const [dashboard, setDashboard] = useState({
    presentToday: 0,
    totalToday: 300,
    lateToday: 0,
    absentToday: 0,
    monthlyAverage: 93.4,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const loadDash = async () => {
    try {
      const { data } = await attendanceApi.dashboard();
      console.log("dashboard", data);


      setDashboard({
        presentToday: data.attendance_count_currentday || '--',
        totalToday: data.total_employee_count || data.total_today || '--',
        lateToday: data.late_count || data.late_count || '--',
        absentToday: data.absent_today_count || data.absent_count || '--',
        monthlyAverage: data.monthly_average || 93.4,
      });
    } catch (err) {
      toast.error("Failed to load dashboard data");
      console.error(err);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        page_size: pageSize,
        search,
        start_date: startDate,
        end_date: endDate,
      };

      if (status && status !== "all") {
        params.status = status;
      }

      const { data } = await attendanceApi.list(params);

      setRecords(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      toast.error("Failed to load attendance records");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDash();
  }, []);

  useEffect(() => {
    load();
  }, [page, pageSize, search, status, startDate, endDate]);

  const totalPages = Math.ceil(count / pageSize);

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const presentPercentage = dashboard.totalToday > 0
    ? ((dashboard.presentToday / dashboard.totalToday) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Monitor daily attendance for all employees
          </p>
        </div>
        <Button>Export CSV</Button>
      </div>

      {/* KPI Summary Cards - Only this part was updated */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboard.presentToday} / {dashboard.totalToday}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {presentPercentage}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboard.lateToday}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboard.absentToday}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.monthlyAverage}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - unchanged */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[260px]">
          <Input
            placeholder="Search by employee name or ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setPage(1);
          }}
        />

        <Input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(1);
          }}
        />

        <Button variant="outline" onClick={resetFilters}>
          Clear Filters
        </Button>
      </div>

      {/* Main Table - unchanged */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    Loading attendance records...
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No records found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => (
                  <TableRow key={r.id || r.employee_id}>
                    <TableCell className="font-medium">
                      {r.employee_name || "Unknown"}
                    </TableCell>
                    <TableCell>{r.department || "-"}</TableCell>
                    <TableCell>
                      {r.date ? new Date(r.date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>{r.clock_in|| "-"}</TableCell>
                    <TableCell>{r.clock_out|| "-"}</TableCell>
                    <TableCell>
                      {r.total_hours ? Number(r.total_hours).toFixed(1) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(r.status)}>
                        {r.status ? r.status.toUpperCase() : "UNKNOWN"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination - unchanged */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Showing {records.length} of {count} records
          </span>

          <Select
            value={pageSize.toString()}
            onValueChange={(val) => {
              setPageSize(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}