import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { departmentApi } from "@/lib/employeesApi";
import {holidayApi} from '@/lib/attendanceApi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Plus, Eye } from "lucide-react";
import { toast } from "sonner";

// ================= COMPONENT =================
export default function OrganizationPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);

  const [deptName, setDeptName] = useState("");

  const [holidayForm, setHolidayForm] = useState({
    name: "",
    date: "",
  });

  // ================= FETCH =================
  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.list();
      setDepartments(res.data.results || res.data);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchHolidays = async () => {
  try {
    const res = await holidayApi.list();

    console.log("data", res.data);

    const holidays = res.data.results;

    setHolidays(holidays);

    console.log("holidays", holidays);
  } catch {
    toast.error("Failed to fetch holidays");
  }
};

  useEffect(() => {
    fetchDepartments();
    fetchHolidays();
  }, []);

  // ================= CREATE =================
  const handleCreateDepartment = async () => {
    if (!deptName) return;

    try {
      await departmentApi.create({ name: deptName });
      setDeptName("");
      fetchDepartments();
    } catch (error) {
      console.error("Failed to create department:", error);
    }
  };

  const handleHolidayChange = (e: any) => {
    setHolidayForm({
      ...holidayForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateHoliday = async () => {
    if (!holidayForm.name || !holidayForm.date) {
      toast.error("All fields required");
      return;
    }

    try {
      await fetch("/api/holidays/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(holidayForm),
      });

      toast.success("Holiday created");
      setHolidayForm({ name: "", date: "" });
      fetchHolidays();
    } catch {
      toast.error("Failed to create holiday");
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      await fetch(`/api/holidays/${id}/`, {
        method: "DELETE",
      });

      toast.success("Deleted");
      fetchHolidays();
    } catch {
      toast.error("Delete failed");
    }
  };
  

  // ================= UI =================
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Organization</h1>

      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>

        {/* ================= DEPARTMENTS ================= */}
        <TabsContent value="departments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Departments</CardTitle>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>+ Add Department</Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Department</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Input
                      placeholder="Department name"
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                    />

                    <Button onClick={handleCreateDepartment}>
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department name</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell>
                        <Link to={`/position/${dept.id}/${dept.name}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= HOLIDAYS ================= */}
        <TabsContent value="holidays">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Holidays</CardTitle>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Holiday
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Holiday</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Input
                      name="name"
                      placeholder="Holiday name"
                      value={holidayForm.name}
                      onChange={handleHolidayChange}
                    />

                    <Input
                      type="date"
                      name="date"
                      value={holidayForm.date}
                      onChange={handleHolidayChange}
                    />

                    <Button onClick={handleCreateHoliday}>
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {holidays.map((h) => (
                      
                    <TableRow key={h.id}>
                      <TableCell>{h.name}</TableCell>
                      <TableCell>{h.date}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteHoliday(h.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}