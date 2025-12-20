"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileText, 
  Trash2, 
  Pencil, 
  UserPlus,
  Upload
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Mock Employee Data Interface
interface EmergencyContact {
  fullName: string;
  phone: string;
  address: string;
  relationship: string;
  email: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  title: string;
  startDate: string;
  tin: string;
  govId: string;
  emergencyContact: EmergencyContact;
  documents: {
    resume: boolean;
    introLetter: boolean;
    photoId: boolean;
    birthCert: boolean;
    schoolCert: boolean;
  };
}

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    firstName: "Juma",
    lastName: "Mkwawa",
    email: "juma.mkwawa@thefesta.com",
    phone: "+255 712 345 678",
    address: "123 Masaki, Dar es Salaam",
    title: "Senior Event Coordinator",
    startDate: "2023-01-15",
    tin: "123-456-789",
    govId: "NIDA-123456789",
    emergencyContact: {
      fullName: "Fatuma Mkwawa",
      phone: "+255 755 123 456",
      address: "123 Masaki, Dar es Salaam",
      relationship: "Spouse",
      email: "fatuma@email.com"
    },
    documents: {
      resume: true,
      introLetter: true,
      photoId: true,
      birthCert: true,
      schoolCert: true
    }
  },
  {
    id: "EMP-002",
    firstName: "Sarah",
    lastName: "Kimani",
    email: "sarah.k@thefesta.com",
    phone: "+255 655 987 654",
    address: "45 Mikocheni B, Dar es Salaam",
    title: "Marketing Manager",
    startDate: "2023-03-01",
    tin: "987-654-321",
    govId: "NIDA-987654321",
    emergencyContact: {
      fullName: "John Kimani",
      phone: "+255 688 111 222",
      address: "Arusha",
      relationship: "Father",
      email: "john.k@email.com"
    },
    documents: {
      resume: true,
      introLetter: false,
      photoId: true,
      birthCert: false,
      schoolCert: true
    }
  }
];

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage organization staff and records.</p>
        </div>
        <Button onClick={() => { setEditingEmployee(null); setIsAddDialogOpen(true); }} className="gap-2 w-full sm:w-auto">
          <UserPlus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle>Staff Directory</CardTitle>
            <CardDescription>
              Total Employees: {employees.length}
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Docs Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{employee.firstName} {employee.lastName}</span>
                        <span className="text-xs text-muted-foreground">{employee.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>{employee.title}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{employee.email}</span>
                        <span className="text-muted-foreground text-xs">{employee.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>{employee.startDate}</TableCell>
                    <TableCell>
                      <CircularProgress 
                        current={Object.values(employee.documents).filter(Boolean).length} 
                        total={5} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => { setEditingEmployee(employee); setIsAddDialogOpen(true); }}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" /> View Documents
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(employee.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Employee
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EmployeeDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        initialData={editingEmployee}
        onSubmit={(data) => {
          if (editingEmployee) {
            setEmployees(employees.map(e => e.id === editingEmployee.id ? { ...data, id: e.id } : e));
          } else {
            setEmployees([...employees, { ...data, id: `EMP-${String(employees.length + 1).padStart(3, '0')}` }]);
          }
          setIsAddDialogOpen(false);
        }}
      />
    </div>
  );
}

function EmployeeDialog({ 
  open, 
  onOpenChange, 
  initialData, 
  onSubmit 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  initialData: Employee | null;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState<any>({});

  // Reset form when dialog opens/closes or initialData changes
  useState(() => {
    if (open) {
      setFormData(initialData || {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        title: "",
        startDate: "",
        tin: "",
        govId: "",
        emergencyContact: {
          fullName: "",
          phone: "",
          address: "",
          relationship: "",
          email: ""
        },
        documents: {
          resume: false,
          introLetter: false,
          photoId: false,
          birthCert: false,
          schoolCert: false
        }
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateEmergency = (field: string, value: any) => {
    setFormData((prev: any) => ({ 
      ...prev, 
      emergencyContact: { ...prev.emergencyContact, [field]: value } 
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{initialData ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>
            Enter the employee's personal and professional details.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 py-4">
          <form id="employee-form" onSubmit={handleSubmit} className="space-y-6">
            
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input required placeholder="Juma" defaultValue={initialData?.firstName} onChange={e => updateField('firstName', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input required placeholder="Mkwawa" defaultValue={initialData?.lastName} onChange={e => updateField('lastName', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title / Position</Label>
                    <Input placeholder="Event Manager" defaultValue={initialData?.title} onChange={e => updateField('title', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" defaultValue={initialData?.startDate} onChange={e => updateField('startDate', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" placeholder="juma@example.com" defaultValue={initialData?.email} onChange={e => updateField('email', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input placeholder="+255..." defaultValue={initialData?.phone} onChange={e => updateField('phone', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Physical Address</Label>
                  <Input placeholder="Street, City, Region" defaultValue={initialData?.address} onChange={e => updateField('address', e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Government ID (NIDA)</Label>
                    <Input placeholder="NIDA Number" defaultValue={initialData?.govId} onChange={e => updateField('govId', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>TIN Number</Label>
                    <Input placeholder="TRA TIN" defaultValue={initialData?.tin} onChange={e => updateField('tin', e.target.value)} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="emergency" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Contact Person Name" defaultValue={initialData?.emergencyContact?.fullName} onChange={e => updateEmergency('fullName', e.target.value)} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input placeholder="Spouse, Parent, etc." defaultValue={initialData?.emergencyContact?.relationship} onChange={e => updateEmergency('relationship', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input placeholder="+255..." defaultValue={initialData?.emergencyContact?.phone} onChange={e => updateEmergency('phone', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" placeholder="contact@email.com" defaultValue={initialData?.emergencyContact?.email} onChange={e => updateEmergency('email', e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Physical Address</Label>
                  <Input placeholder="Contact Address" defaultValue={initialData?.emergencyContact?.address} onChange={e => updateEmergency('address', e.target.value)} />
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6 py-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: "resume", label: "Resume / CV" },
                      { id: "introLetter", label: "Barua ya Utambulisho" },
                      { id: "photoId", label: "Photo ID (Passport/NIDA)" },
                      { id: "birthCert", label: "Birth Certificate" },
                      { id: "schoolCert", label: "School Certificates" }
                    ].map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 flex flex-col gap-2 bg-muted/20">
                         <div className="flex justify-between items-center">
                            <Label className="font-medium">{doc.label}</Label>
                            {/* Mock Status for visual feedback */}
                            <Badge variant="outline" className="text-xs">Pending</Badge>
                         </div>
                         <div className="flex items-center gap-2 mt-2">
                           <Input type="file" className="text-xs h-8 cursor-pointer" />
                         </div>
                      </div>
                    ))}
                 </div>
              </TabsContent>
            </Tabs>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t bg-muted/10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="employee-form">{initialData ? "Save Changes" : "Add Employee"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CircularProgress({ current, total }: { current: number; total: number }) {
  const percentage = Math.round((current / total) * 100);
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Colors based on completion
  let strokeColor = "text-red-500";
  
  if (percentage === 100) {
    strokeColor = "text-emerald-500";
  } else if (percentage >= 80) {
    strokeColor = "text-blue-500";
  } else if (percentage >= 60) {
    strokeColor = "text-amber-500";
  } else if (percentage >= 40) {
    strokeColor = "text-orange-500";
  }

  return (
    <div className="relative flex items-center justify-start pl-2">
      <div className="relative h-10 w-10 group cursor-help">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
          {/* Background Circle */}
          <circle
            className="text-muted/20"
            strokeWidth="3"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="18"
            cy="18"
          />
          {/* Progress Circle */}
          <circle
            className={`transition-all duration-1000 ease-out ${strokeColor}`}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="18"
            cy="18"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
          {current}/{total}
        </div>
      </div>
    </div>
  );
}
