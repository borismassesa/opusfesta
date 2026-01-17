"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Loader2,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  FileText,
  Download,
  UserCircle,
  Building2,
  IdCard,
  CreditCard
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  createdAt?: string;
  updatedAt?: string;
}

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const fetchEmployee = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        getAdminApiUrl(`/api/admin/employees?id=${employeeId}`),
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Employee not found");
        }
        throw new Error("Failed to fetch employee");
      }

      const data = await response.json();
      setEmployee(data.employee);
    } catch (err) {
      console.error("Error fetching employee:", err);
      setError(err instanceof Error ? err.message : "Failed to load employee");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        getAdminApiUrl(`/api/admin/employees?id=${employeeId}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete employee");
      }

      toast.success("Employee deleted successfully!", 3000);
      router.push("/org/employees");
    } catch (err) {
      console.error("Error deleting employee:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete employee",
        5000
      );
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">{error || "Employee not found"}</p>
        <Button onClick={() => router.push("/org/employees")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Employees
        </Button>
      </div>
    );
  }

  const documentCount = Object.values(employee.documents || {}).filter(
    (url): url is string => !!url
  ).length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/org/employees")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-16 w-16">
            <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
            <AvatarFallback>
              {employee.firstName[0]}{employee.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {employee.title || "Employee Details"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/org/employees?edit=${employee.id}`)}
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact & Emergency</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </p>
                </div>
                {employee.employeeId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Employee ID</p>
                    <p className="font-medium">{employee.employeeId}</p>
                  </div>
                )}
                {employee.title && (
                  <div>
                    <p className="text-sm text-muted-foreground">Title / Position</p>
                    <p className="font-medium">{employee.title}</p>
                  </div>
                )}
                {employee.startDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {new Date(employee.startDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
                {employee.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{employee.phone}</p>
                  </div>
                )}
                {employee.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{employee.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IdCard className="h-5 w-5" />
                  Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.govId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Government ID (NIDA)</p>
                    <p className="font-medium">{employee.govId}</p>
                  </div>
                )}
                {employee.tin && (
                  <div>
                    <p className="text-sm text-muted-foreground">TIN Number</p>
                    <p className="font-medium">{employee.tin}</p>
                  </div>
                )}
                {!employee.govId && !employee.tin && (
                  <p className="text-sm text-muted-foreground">No identification records</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Documents Uploaded</p>
                    <p className="text-2xl font-bold">{documentCount} / 5</p>
                  </div>
                  <Badge
                    variant={
                      documentCount === 5
                        ? "default"
                        : documentCount >= 3
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {documentCount === 5
                      ? "Complete"
                      : documentCount >= 3
                      ? "Partial"
                      : "Incomplete"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {(employee.createdAt || employee.updatedAt) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Record Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {employee.createdAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {new Date(employee.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {employee.updatedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {new Date(employee.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
              <CardDescription>
                Contact information for emergency situations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employee.emergencyContact &&
              Object.keys(employee.emergencyContact).length > 0 &&
              Object.values(employee.emergencyContact).some((v) => v) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.emergencyContact.fullName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">
                        {employee.emergencyContact.fullName}
                      </p>
                    </div>
                  )}
                  {employee.emergencyContact.relationship && (
                    <div>
                      <p className="text-sm text-muted-foreground">Relationship</p>
                      <p className="font-medium">
                        {employee.emergencyContact.relationship}
                      </p>
                    </div>
                  )}
                  {employee.emergencyContact.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {employee.emergencyContact.phone}
                      </p>
                    </div>
                  )}
                  {employee.emergencyContact.email && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">
                        {employee.emergencyContact.email}
                      </p>
                    </div>
                  )}
                  {employee.emergencyContact.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {employee.emergencyContact.address}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No emergency contact information available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Employee Documents
              </CardTitle>
              <CardDescription>
                View and manage employee documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "resume" as const, label: "Resume / CV" },
                  { id: "introLetter" as const, label: "Barua ya Utambulisho" },
                  { id: "photoId" as const, label: "Photo ID (Passport/NIDA)" },
                  { id: "birthCert" as const, label: "Birth Certificate" },
                  { id: "schoolCert" as const, label: "School Certificates" },
                ].map((doc) => {
                  const url = employee.documents[doc.id];
                  return (
                    <div
                      key={doc.id}
                      className="border rounded-lg p-4 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{doc.label}</p>
                        {url ? (
                          <Badge variant="default">Uploaded</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                      {url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full"
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            View Document
                          </a>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {employee.firstName}{" "}
              {employee.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
