import { useEffect, useState } from "react";
import { leaveApi } from "@/lib/leaveApi";
import { employeesApi } from "@/lib/employeesApi";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

// ================= STATUS BADGE =================
const statusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "default";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function LeavePage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    employee: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  // ================= FETCH DATA =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const [leaveRes, empRes] = await Promise.all([
        leaveApi.list(),
        employeesApi.list(),
      ]);

      setLeaves(leaveRes.data?.results || leaveRes.data || []);
      setEmployees(empRes.data?.results || empRes.data || []);

      // OPTIONAL: if you have summary endpoint
      if (leaveApi.summary) {
        const sumRes = await leaveApi.summary();
        setSummary(sumRes.data || []);
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= VALIDATION =================
  const isFormValid =
    form.employee &&
    form.start_date &&
    form.end_date &&
    form.reason;

  // ================= APPLY LEAVE =================
  const handleApply = async () => {
    if (!isFormValid) {
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);

    try {
      await leaveApi.create(form);

      toast.success("Leave applied successfully");

      setForm({
        employee: "",
        start_date: "",
        end_date: "",
        reason: "",
      });

      setOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to apply for leave");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= UPDATE STATUS =================
  const handleStatus = async (id: string, status: string) => {
    try {
      await leaveApi.update(id, { status });
      toast.success(`Leave ${status}`);
      fetchData();
    } catch {
      toast.error("Failed to update leave status");
    }
  };

  // ================= UI =================
  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Leave Management</h1>
          <p className="text-sm text-gray-500">
            Manage employee leave requests
          </p>
        </div>

        {/* APPLY LEAVE */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Apply Leave
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* EMPLOYEE SELECT */}
              <div>
                <Label>Select Employee</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={form.employee}
                  onChange={(e) =>
                    setForm({ ...form, employee: e.target.value })
                  }
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DATES */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm({ ...form, end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* REASON */}
              <div>
                <Label>Reason</Label>
                <Textarea
                  placeholder="Enter reason..."
                  value={form.reason}
                  onChange={(e) =>
                    setForm({ ...form, reason: e.target.value })
                  }
                />
              </div>

              <Button
                className="w-full"
                onClick={handleApply}
                disabled={!isFormValid || submitting}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 🔥 SUMMARY CARDS */}
      {summary.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {summary.map((s) => (
            <Card key={s.leave_type}>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">{s.leave_type}</p>
                <p className="text-xl font-bold">{s.remaining} days</p>
                <p className="text-xs text-gray-400">
                  {s.used} used / {s.total} total
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">
                    {leave.employee_name || leave.employee}
                  </TableCell>

                  <TableCell>{leave.start_date}</TableCell>
                  <TableCell>{leave.end_date}</TableCell>

                  <TableCell className="max-w-[200px] truncate">
                    {leave.reason}
                  </TableCell>

                  <TableCell>
                    <Badge variant={statusVariant(leave.status)}>
                      {leave.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    {leave.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleStatus(leave.id, "approved")
                          }
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleStatus(leave.id, "rejected")
                          }
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {leaves.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-400"
                  >
                    {loading
                      ? "Loading leave requests..."
                      : "No leave requests found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}