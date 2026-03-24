import { useEffect, useState } from "react";
import { payrollApi } from "@/lib/payrollApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";



export default function PayrollPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const load = async () => {
    try {
      const { data } = await payrollApi.list();
      console.log("data",data)
      setRecords(Array.isArray(data) ? data : data.results || []);
    } catch {
      toast.error("Failed to load payrolls");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRunPayroll = async () => {
    setRunning(true);

    try {
      await payrollApi.run({
        month: Number(form.month),
        year: Number(form.year),
      });

      toast.success("Payroll processed successfully");
      setDialogOpen(false);
      load();
    } catch {
      toast.error("Failed to run payroll");
    }

    setRunning(false);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Payroll</h1>
          <p className="page-subtitle">Run and manage monthly payroll</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Run Payroll
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Run Payroll</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 pt-2">

              

              <div>
                <label className="text-sm">Month</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  className="w-full border p-2 rounded"
                  value={form.month}
                  onChange={(e) =>
                    setForm({ ...form, month: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm">Year</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  value={form.year}
                  onChange={(e) =>
                    setForm({ ...form, year: e.target.value })
                  }
                />
              </div>

              <Button
                className="w-full"
                onClick={handleRunPayroll}
                disabled={running}
              >
                {running ? "Processing..." : "Run Payroll"}
              </Button>

            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {records.map((r) => (
                <TableRow
  key={r.id}
  onClick={() => navigate(`/payroll/${r.id}`)}
  className="cursor-pointer hover:bg-muted"
>
                  <TableCell className="font-medium">
                    {r.month}/{r.year}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        r.status === "paid"
                          ? "default"
                          : r.status === "processed"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {r.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}

              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    {loading ? "Loading..." : "No payroll runs yet"}
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