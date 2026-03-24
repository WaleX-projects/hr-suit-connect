import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { employeesApi, departmentListApi, positionListApi } from "@/lib/employeesApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye } from "lucide-react";
import { toast } from "sonner";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [positionsCache, setPositionsCache] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(false);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    hire_date: "",
    department: "",
    position: ""
  });

  // 🔹 Load employees
  const loadEmployees = async () => {
    try {
      const { data } = await employeesApi.list(search || undefined);
      setEmployees(Array.isArray(data) ? data : data.results || []);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load departments once
  const loadDepartments = async () => {
    try {
      const { data } = await departmentListApi.list();
      setDepartments(data);
    } catch {
      toast.error("Failed to load departments");
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [search]);

  useEffect(() => {
    loadDepartments();
  }, []);

  // 🔥 Department change (with caching)
  const handleDepartmentChange = async (deptId) => {
    setForm((prev) => ({
      ...prev,
      department: deptId,
      position: ""
    }));

    if (!deptId) {
      setPositions([]);
      return;
    }

    // ✅ Use cache
    if (positionsCache[deptId]) {
      setPositions(positionsCache[deptId]);
      return;
    }

    try {
      setLoadingPositions(true);

      const { data } = await positionListApi.get(deptId);

      setPositions(data);

      // ✅ Save cache
      setPositionsCache((prev) => ({
        ...prev,
        [deptId]: data
      }));
    } catch {
      toast.error("Failed to load positions");
    } finally {
      setLoadingPositions(false);
    }
  };

  // 🔹 Create employee
  const handleCreate = async () => {
    try {
      await employeesApi.create(form);
      toast.success("Employee created");

      setDialogOpen(false);

      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        hire_date: "",
        department: "",
        position: ""
      });

      loadEmployees();
    } catch {
      toast.error("Failed to create employee");
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Employees</h1>
          <p className="page-subtitle">Manage your workforce</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Employee</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 pt-2">

              {/* NAME */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name</Label>
                  <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>

              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>

              {/* 🔥 DEPARTMENT */}
              <div>
                <Label>Department</Label>
                <select
                  className="w-full border rounded p-2"
                  value={form.department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 🔥 POSITION */}
              <div>
                <Label>Position</Label>
                <select
                  className="w-full border rounded p-2"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  disabled={!form.department || loadingPositions}
                >
                  <option value="">
                    {loadingPositions ? "Loading..." : "Select Position"}
                  </option>

                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Hire Date</Label>
                <Input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} />
              </div>

              <Button className="w-full" onClick={handleCreate}>
                Create Employee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
        <Input
          placeholder="Search..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
              
                              <TableHead>ID</TableHead>
              
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id}>
                <TableCell>{e.id}</TableCell>
                  <TableCell>{e.first_name} {e.last_name}</TableCell>
                  <TableCell>{e.email}</TableCell>
                  <TableCell>{e.position_detail|| "—"}</TableCell>
                  <TableCell>
                    <Badge>{e.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/employees/${e.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {loading ? "Loading..." : "No employees found"}
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