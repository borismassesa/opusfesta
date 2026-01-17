"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  DialogTitle
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
  Search, 
  MoreHorizontal, 
  FileText, 
  Trash2, 
  Pencil, 
  UserPlus,
  Upload,
  Loader2,
  X,
  Download,
  Eye,
  Image as ImageIcon,
  User
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import { toast } from "@/lib/toast";

// Employee Data Interfaces
interface EmergencyContact {
  fullName?: string;
  phone?: string;
  address?: string;
  relationship?: string;
  email?: string;
}

interface EmployeeDocuments {
  resume?: string;
  introLetter?: string;
  photoId?: string;
  birthCert?: string;
  schoolCert?: string;
}

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  title: string;
  startDate: string;
  tin: string;
  govId: string;
  avatar?: string;
  emergencyContact: EmergencyContact;
  documents: EmployeeDocuments;
}

export default function Employees() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Check for edit query parameter after employees are loaded
    if (!loading && employees.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get("edit");
      if (editId) {
        // Find employee and open edit dialog
        const employeeToEdit = employees.find(emp => emp.id === editId);
        if (employeeToEdit) {
          setEditingEmployee(employeeToEdit);
          setIsAddDialogOpen(true);
          // Clean up URL
          window.history.replaceState({}, "", "/org/employees");
        }
      }
    }
  }, [loading, employees]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const url = searchTerm 
        ? getAdminApiUrl(`/api/admin/employees?search=${encodeURIComponent(searchTerm)}`)
        : getAdminApiUrl(`/api/admin/employees`);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      // Transform database format to frontend format
      const transformedEmployees = (data.employees || []).map((emp: any) => ({
        id: emp.id,
        employeeId: emp.employee_id || "",
        firstName: emp.first_name,
        lastName: emp.last_name,
        email: emp.email,
        phone: emp.phone || "",
        address: emp.address || "",
        title: emp.title || "",
        startDate: emp.start_date || "",
        tin: emp.tin || "",
        govId: emp.gov_id || "",
        avatar: emp.avatar || "",
        emergencyContact: emp.emergency_contact || {},
        documents: emp.documents || {},
      }));
      setEmployees(transformedEmployees);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (!loading) {
        fetchEmployees();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const response = await fetch(getAdminApiUrl(`/api/admin/employees?id=${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete employee");
      }

      // Show success toast
      toast.success("Employee deleted successfully!", 3000);
      
      // Refresh list
      fetchEmployees();
    } catch (err) {
      console.error("Error deleting employee:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete employee",
        5000
      );
    }
  };

  const handleSubmit = async (data: Employee) => {
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Clean up documents - ensure empty strings are used instead of undefined
      const cleanedDocuments: EmployeeDocuments = {};
      if (data.documents) {
        Object.keys(data.documents).forEach(key => {
          const value = data.documents[key as keyof EmployeeDocuments];
          cleanedDocuments[key as keyof EmployeeDocuments] = value || "";
        });
      }

      // Clean up emergency contact - ensure empty strings for optional fields
      const cleanedEmergencyContact: EmergencyContact = {};
      if (data.emergencyContact) {
        cleanedEmergencyContact.fullName = data.emergencyContact.fullName || "";
        cleanedEmergencyContact.phone = data.emergencyContact.phone || "";
        cleanedEmergencyContact.address = data.emergencyContact.address || "";
        cleanedEmergencyContact.relationship = data.emergencyContact.relationship || "";
        cleanedEmergencyContact.email = data.emergencyContact.email || "";
      }

      // Clean up optional fields - convert empty strings to null for optional fields
      const cleanedData = {
        ...data,
        employeeId: data.employeeId && data.employeeId.trim() !== "" ? data.employeeId : null,
        phone: data.phone && data.phone.trim() !== "" ? data.phone : null,
        address: data.address && data.address.trim() !== "" ? data.address : null,
        title: data.title && data.title.trim() !== "" ? data.title : null,
        startDate: data.startDate && data.startDate.trim() !== "" ? data.startDate : null,
        tin: data.tin && data.tin.trim() !== "" ? data.tin : null,
        govId: data.govId && data.govId.trim() !== "" ? data.govId : null,
        documents: cleanedDocuments,
        emergencyContact: cleanedEmergencyContact,
      };

      const url = getAdminApiUrl(`/api/admin/employees`);
      const method = editingEmployee ? "PUT" : "POST";
      const body = editingEmployee ? { ...cleanedData, id: editingEmployee.id } : cleanedData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Format detailed error message
        let errorMessage = errorData.error || "Failed to save employee";
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.details && Array.isArray(errorData.details)) {
          const details = errorData.details.map((d: any) => {
            const field = d.path?.join('.') || 'unknown';
            return `${field}: ${d.message}`;
          }).join('; ');
          errorMessage = `Validation failed: ${details}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      setIsAddDialogOpen(false);
      setEditingEmployee(null);
      
      // Show success toast
      toast.success(
        editingEmployee 
          ? "Employee updated successfully!" 
          : "Employee added successfully!",
        3000
      );
      
      fetchEmployees();
    } catch (err) {
      console.error("Error saving employee:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save employee";
      
      // Show error toast with detailed message
      toast.error(errorMessage, 5000);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage organization staff and records.</p>
        </div>
        <Button 
          onClick={() => { 
            setEditingEmployee(null); 
            setIsAddDialogOpen(true); 
          }} 
          className="gap-2 w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 border border-destructive/50 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle>Staff Directory</CardTitle>
            <CardDescription>
              Total Employees: {loading ? "..." : employees.length}
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
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
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                              <AvatarFallback>
                                {employee.firstName[0]}{employee.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span>{employee.firstName} {employee.lastName}</span>
                              <span className="text-xs text-muted-foreground">
                                {employee.employeeId || `ID: ${employee.id.slice(0, 8)}...`}
                              </span>
                            </div>
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
                            current={Object.values(employee.documents).filter((url): url is string => !!url).length} 
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
                              <DropdownMenuItem onClick={() => router.push(`/org/employees/${employee.id}`)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { 
                                setEditingEmployee(employee); 
                                setIsAddDialogOpen(true); 
                              }}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive" 
                                onClick={() => handleDelete(employee.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Employee
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EmployeeDialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingEmployee(null);
          }
        }}
        initialData={editingEmployee}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}

function EmployeeDialog({ 
  open, 
  onOpenChange, 
  initialData, 
  onSubmit,
  submitting
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  initialData: Employee | null;
  onSubmit: (data: Employee) => void;
  submitting: boolean;
}) {
  const [formData, setFormData] = useState<Employee>({
    id: "",
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    title: "",
    startDate: "",
    tin: "",
    govId: "",
    avatar: "",
    emergencyContact: {},
    documents: {},
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          id: "",
          employeeId: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          title: "",
          startDate: "",
          tin: "",
          govId: "",
          avatar: "",
          emergencyContact: {
            fullName: "",
            phone: "",
            address: "",
            relationship: "",
            email: ""
          },
          documents: {
            resume: "",
            introLetter: "",
            photoId: "",
            birthCert: "",
            schoolCert: ""
          }
        });
      }
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof Employee, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateEmergency = (field: keyof EmergencyContact, value: any) => {
    setFormData((prev) => ({ 
      ...prev, 
      emergencyContact: { ...prev.emergencyContact, [field]: value } 
    }));
  };

  const updateDocument = (field: keyof EmployeeDocuments, value: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [field]: value }
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
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <AvatarUpload
                    value={formData.avatar || ""}
                    onChange={(url) => updateField('avatar', url)}
                    employeeId={initialData?.id || "new"}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input 
                      required 
                      placeholder="Juma" 
                      value={formData.firstName}
                      onChange={e => updateField('firstName', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input 
                      required 
                      placeholder="Mkwawa" 
                      value={formData.lastName}
                      onChange={e => updateField('lastName', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input 
                    placeholder="EMP-001" 
                    value={formData.employeeId}
                    onChange={e => updateField('employeeId', e.target.value)} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Organization-specific employee identification number
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title / Position</Label>
                    <Input 
                      placeholder="Event Manager" 
                      value={formData.title}
                      onChange={e => updateField('title', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input 
                      type="date" 
                      value={formData.startDate}
                      onChange={e => updateField('startDate', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email Address *</Label>
                    <Input 
                      type="email" 
                      required
                      placeholder="juma@example.com" 
                      value={formData.email}
                      onChange={e => updateField('email', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input 
                      placeholder="+255..." 
                      value={formData.phone}
                      onChange={e => updateField('phone', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Physical Address</Label>
                  <Input 
                    placeholder="Street, City, Region" 
                    value={formData.address}
                    onChange={e => updateField('address', e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Government ID (NIDA)</Label>
                    <Input 
                      placeholder="NIDA Number" 
                      value={formData.govId}
                      onChange={e => updateField('govId', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>TIN Number</Label>
                    <Input 
                      placeholder="TRA TIN" 
                      value={formData.tin}
                      onChange={e => updateField('tin', e.target.value)} 
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="emergency" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Contact Person Name" 
                    value={formData.emergencyContact?.fullName || ""}
                    onChange={e => updateEmergency('fullName', e.target.value)} 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input 
                      placeholder="Spouse, Parent, etc." 
                      value={formData.emergencyContact?.relationship || ""}
                      onChange={e => updateEmergency('relationship', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input 
                      placeholder="+255..." 
                      value={formData.emergencyContact?.phone || ""}
                      onChange={e => updateEmergency('phone', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="contact@email.com" 
                    value={formData.emergencyContact?.email || ""}
                    onChange={e => updateEmergency('email', e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Physical Address</Label>
                  <Input 
                    placeholder="Contact Address" 
                    value={formData.emergencyContact?.address || ""}
                    onChange={e => updateEmergency('address', e.target.value)} 
                  />
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "resume" as const, label: "Resume / CV" },
                    { id: "introLetter" as const, label: "Barua ya Utambulisho" },
                    { id: "photoId" as const, label: "Photo ID (Passport/NIDA)" },
                    { id: "birthCert" as const, label: "Birth Certificate" },
                    { id: "schoolCert" as const, label: "School Certificates" }
                  ].map((doc) => (
                    <DocumentUpload
                      key={doc.id}
                      label={doc.label}
                      documentType={doc.id}
                      value={formData.documents[doc.id] || ""}
                      onChange={(url) => updateDocument(doc.id, url)}
                      employeeId={initialData?.id || "new"}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t bg-muted/10">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="employee-form" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              initialData ? "Save Changes" : "Add Employee"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DocumentUpload({
  label,
  documentType,
  value,
  onChange,
  employeeId,
}: {
  label: string;
  documentType: keyof EmployeeDocuments;
  value: string;
  onChange: (url: string) => void;
  employeeId: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp"
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("File must be PDF, Word document, or image (JPG, PNG, WebP)");
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split(".").pop() || "pdf";
      // Use "temp" folder for new employees, actual employee ID for existing
      const folderId = employeeId === "new" ? `temp-${timestamp}` : employeeId;
      const fileName = `${folderId}/${documentType}/${timestamp}-${randomStr}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from("employees")
        .upload(fileName, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload document");
      }

      if (!data) {
        throw new Error("Upload failed: No data returned");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("employees")
        .getPublicUrl(data.path);

      onChange(urlData.publicUrl);
    } catch (err: any) {
      console.error("Error uploading document:", err);
      setError(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasDocument = !!value;

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-2 bg-muted/20">
      <div className="flex justify-between items-center">
        <Label className="font-medium">{label}</Label>
        {hasDocument ? (
          <Badge variant="default" className="text-xs">Uploaded</Badge>
        ) : (
          <Badge variant="outline" className="text-xs">Pending</Badge>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {hasDocument ? (
        <div className="flex items-center gap-2 mt-2">
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            View Document
          </a>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-6 px-2"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-2">
          <Input
            ref={fileInputRef}
            type="file"
            className="text-xs h-8 cursor-pointer"
            onChange={handleFileSelect}
            disabled={uploading}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          />
          {uploading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
}

function AvatarUpload({
  value,
  onChange,
  employeeId,
}: {
  value: string;
  onChange: (url: string) => void;
  employeeId: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - only images for avatar
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("File must be an image (JPG, PNG, WebP, or GIF)");
      return;
    }

    // Validate file size (5MB for avatar)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 5MB");
      return;
    }

    setError(null);
    
    // Create immediate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setPreview(previewUrl);
      // Update parent immediately with preview URL so avatar updates in real-time
      // Use a small delay to ensure state updates properly
      setTimeout(() => {
        onChange(previewUrl);
      }, 0);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split(".").pop() || "jpg";
      // Use "temp" folder for new employees, actual employee ID for existing
      const folderId = employeeId === "new" ? `temp-${timestamp}` : employeeId;
      const fileName = `${folderId}/avatar/${timestamp}-${randomStr}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from("employees")
        .upload(fileName, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload avatar");
      }

      if (!data) {
        throw new Error("Upload failed: No data returned");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("employees")
        .getPublicUrl(data.path);

      // Update with final URL and clear preview
      setPreview(null);
      onChange(urlData.publicUrl);
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      setError(err.message || "Failed to upload avatar");
      // Clear preview on error
      setPreview(null);
      // Revert to original value on error
      onChange(value);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasAvatar = !!value || !!preview;
  const displayUrl = preview || value || "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage 
            src={displayUrl || undefined} 
            alt="Avatar"
            key={displayUrl} // Force re-render when URL changes
          />
          <AvatarFallback>
            <User className="h-10 w-10" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {hasAvatar ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Change Avatar
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Avatar
                  </>
                )}
              </Button>
            )}
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP, or GIF. Max 5MB.
          </p>
        </div>
      </div>
      <Input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp,image/gif"
      />
    </div>
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
