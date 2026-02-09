import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Check if user is admin
async function isAdmin(): Promise<boolean> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return false;

    const supabaseAdmin = getSupabaseAdmin();
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) return false;

    return userData.role === "admin";
  } catch (error: any) {
    console.error("[isAdmin] Unexpected error:", error.message);
    return false;
  }
}

// Emergency contact schema - allow null, empty string, or undefined for optional fields
const emergencyContactSchema = z.object({
  fullName: z.union([z.string(), z.null(), z.undefined()]).optional(),
  phone: z.union([z.string(), z.null(), z.undefined()]).optional(),
  address: z.union([z.string(), z.null(), z.undefined()]).optional(),
  relationship: z.union([z.string(), z.null(), z.undefined()]).optional(),
  email: z.union([
    z.string().email(),
    z.string().length(0),
    z.null(),
    z.undefined()
  ]).optional(),
});

// Documents schema - allow empty strings or valid URLs
const urlOrEmpty = z.union([
  z.string().url(),
  z.string().length(0),
  z.undefined()
]).optional();

const documentsSchema = z.object({
  resume: urlOrEmpty,
  introLetter: urlOrEmpty,
  photoId: urlOrEmpty,
  birthCert: urlOrEmpty,
  schoolCert: urlOrEmpty,
});

// Employee schema - allow null, empty string, or undefined for optional fields
const employeeSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  employee_id: z.union([z.string(), z.null(), z.undefined()]).optional(),
  phone: z.union([z.string(), z.null(), z.undefined()]).optional(),
  address: z.union([z.string(), z.null(), z.undefined()]).optional(),
  title: z.union([z.string(), z.null(), z.undefined()]).optional(),
  start_date: z.union([z.string(), z.null(), z.undefined()]).optional().nullable(),
  tin: z.union([z.string(), z.null(), z.undefined()]).optional(),
  gov_id: z.union([z.string(), z.null(), z.undefined()]).optional(),
  avatar: z.union([z.string().url(), z.string().length(0), z.null(), z.undefined()]).optional(),
  emergency_contact: emergencyContactSchema.optional().default({}),
  documents: documentsSchema.optional().default({}),
});

// GET - List all employees or get single employee by ID (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search");

    // If ID is provided, fetch single employee
    if (id) {
      const { data: employee, error } = await supabaseAdmin
        .from("employees")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching employee:", error);
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        );
      }

      // Transform to frontend format
      const frontendEmployee = {
        id: employee.id,
        employeeId: employee.employee_id || "",
        firstName: employee.first_name,
        lastName: employee.last_name,
        email: employee.email,
        phone: employee.phone || "",
        address: employee.address || "",
        title: employee.title || "",
        startDate: employee.start_date || "",
        tin: employee.tin || "",
        govId: employee.gov_id || "",
        avatar: employee.avatar || "",
        emergencyContact: employee.emergency_contact || {},
        documents: employee.documents || {},
        createdAt: employee.created_at,
        updatedAt: employee.updated_at,
      };

      return NextResponse.json({ employee: frontendEmployee });
    }

    // Otherwise, fetch all employees with optional search
    // Build query
    let query = supabaseAdmin.from("employees").select("*");

    // Apply search filter if provided
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,title.ilike.%${search}%,employee_id.ilike.%${search}%`
      );
    }

    const { data: employees, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching employees:", error);
      return NextResponse.json(
        { error: "Failed to fetch employees" },
        { status: 500 }
      );
    }

    return NextResponse.json({ employees: employees || [] });
  } catch (error: any) {
    console.error("Error in GET /api/admin/employees:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new employee (admin only)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Transform frontend format to database format
    // Convert empty strings to null for optional fields
    const dbData = {
      first_name: body.firstName,
      last_name: body.lastName,
      email: body.email,
      employee_id: body.employeeId && body.employeeId.trim() !== "" ? body.employeeId : null,
      phone: body.phone && body.phone.trim() !== "" ? body.phone : null,
      address: body.address && body.address.trim() !== "" ? body.address : null,
      title: body.title && body.title.trim() !== "" ? body.title : null,
      start_date: body.startDate && body.startDate.trim() !== "" ? body.startDate : null,
      tin: body.tin && body.tin.trim() !== "" ? body.tin : null,
      gov_id: body.govId && body.govId.trim() !== "" ? body.govId : null,
      avatar: body.avatar && body.avatar.trim() !== "" ? body.avatar : null,
      emergency_contact: body.emergencyContact || {},
      documents: body.documents || {},
    };

    const validationResult = employeeSchema.safeParse(dbData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: employee, error } = await supabaseAdmin
      .from("employees")
      .insert(validationResult.data)
      .select()
      .single();

    if (error) {
      console.error("Error creating employee:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { 
          error: "Failed to create employee",
          message: error.message || "Database error occurred",
          details: error.details || null
        },
        { status: 500 }
      );
    }

    // Transform back to frontend format
    const frontendEmployee = {
      id: employee.id,
      firstName: employee.first_name,
      lastName: employee.last_name,
      email: employee.email,
      phone: employee.phone || "",
      address: employee.address || "",
      title: employee.title || "",
      startDate: employee.start_date || "",
      tin: employee.tin || "",
      govId: employee.gov_id || "",
      avatar: employee.avatar || "",
      emergencyContact: employee.emergency_contact || {},
      documents: employee.documents || {},
      createdAt: employee.created_at,
      updatedAt: employee.updated_at,
    };

    return NextResponse.json({ employee: frontendEmployee }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/admin/employees:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update employee (admin only)
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Transform frontend format to database format
    // Convert empty strings to null for optional fields
    const dbUpdateData: any = {};
    if (updateData.firstName !== undefined) dbUpdateData.first_name = updateData.firstName;
    if (updateData.lastName !== undefined) dbUpdateData.last_name = updateData.lastName;
    if (updateData.email !== undefined) dbUpdateData.email = updateData.email;
    if (updateData.employeeId !== undefined) {
      dbUpdateData.employee_id = updateData.employeeId && updateData.employeeId.trim() !== "" ? updateData.employeeId : null;
    }
    if (updateData.phone !== undefined) {
      dbUpdateData.phone = updateData.phone && updateData.phone.trim() !== "" ? updateData.phone : null;
    }
    if (updateData.address !== undefined) {
      dbUpdateData.address = updateData.address && updateData.address.trim() !== "" ? updateData.address : null;
    }
    if (updateData.title !== undefined) {
      dbUpdateData.title = updateData.title && updateData.title.trim() !== "" ? updateData.title : null;
    }
    if (updateData.startDate !== undefined) {
      dbUpdateData.start_date = updateData.startDate && updateData.startDate.trim() !== "" ? updateData.startDate : null;
    }
    if (updateData.tin !== undefined) {
      dbUpdateData.tin = updateData.tin && updateData.tin.trim() !== "" ? updateData.tin : null;
    }
    if (updateData.govId !== undefined) {
      dbUpdateData.gov_id = updateData.govId && updateData.govId.trim() !== "" ? updateData.govId : null;
    }
    if (updateData.avatar !== undefined) {
      dbUpdateData.avatar = updateData.avatar && updateData.avatar.trim() !== "" ? updateData.avatar : null;
    }
    if (updateData.emergencyContact !== undefined) dbUpdateData.emergency_contact = updateData.emergencyContact;
    if (updateData.documents !== undefined) dbUpdateData.documents = updateData.documents;

    const validationResult = employeeSchema.partial().safeParse(dbUpdateData);

    if (!validationResult.success) {
      // Format validation errors for better user experience
      const errorMessages = validationResult.error.issues.map(issue => {
        const field = issue.path.join('.');
        return `${field}: ${issue.message}`;
      });
      
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.issues,
          message: errorMessages.join('; ')
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: employee, error } = await supabaseAdmin
      .from("employees")
      .update(validationResult.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating employee:", error);
      return NextResponse.json(
        { error: "Failed to update employee" },
        { status: 500 }
      );
    }

    // Transform back to frontend format
    const frontendEmployee = {
      id: employee.id,
      firstName: employee.first_name,
      lastName: employee.last_name,
      email: employee.email,
      employeeId: employee.employee_id || "",
      phone: employee.phone || "",
      address: employee.address || "",
      title: employee.title || "",
      startDate: employee.start_date || "",
      tin: employee.tin || "",
      govId: employee.gov_id || "",
      avatar: employee.avatar || "",
      emergencyContact: employee.emergency_contact || {},
      documents: employee.documents || {},
      createdAt: employee.created_at,
      updatedAt: employee.updated_at,
    };

    return NextResponse.json({ employee: frontendEmployee });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/employees:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete employee (admin only)
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from("employees").delete().eq("id", id);

    if (error) {
      console.error("Error deleting employee:", error);
      return NextResponse.json(
        { error: "Failed to delete employee" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/employees:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
