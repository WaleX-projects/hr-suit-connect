import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { positionApi } from "@/lib/employeesApi";

export default function PostionPage() {
  const { id, dept_name } = useParams();

  const [positions, setPositions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    basic_salary: "",
    components: [{ name: "", value: "" }],
  });

  // FETCH
  useEffect(() => {
    const getPosition = async () => {
      try {
        const { data } = await positionApi.get(id);
        setPositions(data.results || data);
      } catch {
        toast.error("Failed to load positions");
      }
    };

    getPosition();
  }, [id]);

  // HANDLE INPUT
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // HANDLE COMPONENT CHANGE
  const handleComponentChange = (index: number, field: string, value: any) => {
    const updated = [...form.components];
    updated[index][field] = value;
    setForm({ ...form, components: updated });
  };

  // ADD COMPONENT FIELD
  const addComponent = () => {
    setForm({
      ...form,
      components: [...form.components, { name: "", value: "" }],
    });
  };

  // SUBMIT
  const handleSubmit = async () => {
      console.log('sending form', form);
    try {
      await positionApi.create({
        ...form,
        department: id,
      });

      toast.success("Position created");
      setOpen(false);
    } catch {
      toast.error("Failed to create position");
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {dept_name} Department
          </h1>
          <p className="text-sm text-gray-500">Manage positions</p>
        </div>

        {/* ADD POSITION */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add position
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Position</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input name="title" onChange={handleChange} />
              </div>

              <div>
                <Label>Basic Salary</Label>
                <Input
                  name="basic_salary"
                  type="number"
                  onChange={handleChange}
                />
              </div>

              {/* SALARY COMPONENTS */}
              <div>
                <Label>Salary Components</Label>

                {form.components.map((comp, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      placeholder="Component Name"
                      value={comp.name}
                      onChange={(e) =>
                        handleComponentChange(index, "name", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Value"
                      type="number"
                      value={comp.value}
                      onChange={(e) =>
                        handleComponentChange(index, "value", e.target.value)
                      }
                    />
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={addComponent}
                >
                  + Add Component
                </Button>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                Create Position
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLE */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {positions.map((pos) => (
                <TableRow key={pos.id}>
                  <TableCell>{pos.id}</TableCell>
                  <TableCell>{pos.title}</TableCell>

                  <TableCell>
                    <Button size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}