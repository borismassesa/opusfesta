import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      console.error("[isAdmin] No authorization header");
      return false;
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      console.error("[isAdmin] No token in authorization header");
      return false;
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      console.error("[isAdmin] Error getting user:", error.message);
      return false;
    }

    if (!user) {
      console.error("[isAdmin] No user found");
      return false;
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("[isAdmin] Error fetching user role:", userError.message);
      return false;
    }

    const isAdminUser = userData?.role === "admin";
    if (!isAdminUser) {
      console.error("[isAdmin] User is not admin. Role:", userData?.role);
    }

    return isAdminUser;
  } catch (error: any) {
    console.error("[isAdmin] Unexpected error:", error.message);
    return false;
  }
}

// User create schema
const userCreateSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  phone: z.union([z.string(), z.null(), z.undefined()]).optional(),
  avatar: z.union([z.string().url(), z.string().length(0), z.null(), z.undefined()]).optional(),
  role: z.enum(["user", "vendor", "admin"]).default("user"),
  userType: z.enum(["couple", "vendor"]).optional(),
});

// User update schema
const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.union([z.string(), z.null(), z.undefined()]).optional(),
  avatar: z.union([z.string().url(), z.string().length(0), z.null(), z.undefined()]).optional(),
  role: z.enum(["user", "vendor", "admin"]).optional(),
});

// GET - List users by type (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const search = searchParams.get("search") || "";

    let users: any[] = [];

    if (type === "vendors") {
      // Get users who are vendors - join with vendors table
      const { data: vendorsData, error: vendorsError } = await supabaseAdmin
        .from("vendors")
        .select(`
          id,
          business_name,
          category,
          slug,
          user_id,
          users (
            id,
            email,
            name,
            phone,
            avatar,
            role,
            created_at,
            updated_at
          )
        `)
        .order("created_at", { ascending: false });

      if (vendorsError) {
        console.error("Error fetching vendors:", vendorsError);
        return NextResponse.json(
          { error: "Failed to fetch vendors" },
          { status: 500 }
        );
      }

      // Transform the data to match user structure
      // Note: Supabase returns users as an object (not array) for one-to-one relationships
      users = (vendorsData || [])
        .filter((vendor) => vendor.users && !Array.isArray(vendor.users))
        .map((vendor) => {
          const user = Array.isArray(vendor.users) ? vendor.users[0] : vendor.users;
          return {
            ...user,
            vendor: {
              id: vendor.id,
              business_name: vendor.business_name,
              category: vendor.category,
              slug: vendor.slug,
            },
          };
        });

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(
          (user) =>
            user.name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.phone?.toLowerCase().includes(searchLower) ||
            user.vendor?.business_name?.toLowerCase().includes(searchLower)
        );
      }
    } else if (type === "couples") {
      // Get users who are couples (role = 'user' and not vendors)
      const { data: allUsers, error: usersError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("role", "user")
        .order("created_at", { ascending: false });

      if (usersError) {
        console.error("Error fetching couples:", usersError);
        return NextResponse.json(
          { error: "Failed to fetch couples" },
          { status: 500 }
        );
      }

      // Get all vendor user IDs
      const { data: vendors, error: vendorsError } = await supabaseAdmin
        .from("vendors")
        .select("user_id");

      if (vendorsError) {
        console.error("Error fetching vendors for filtering:", vendorsError);
        return NextResponse.json(
          { error: "Failed to fetch vendors" },
          { status: 500 }
        );
      }

      const vendorUserIds = new Set((vendors || []).map((v) => v.user_id));

      // Filter out users who are vendors
      users = (allUsers || []).filter((user) => !vendorUserIds.has(user.id));

      // Apply search filter
      if (search) {
        users = users.filter(
          (user) =>
            user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase()) ||
            user.phone?.toLowerCase().includes(search.toLowerCase())
        );
      }
    } else if (type === "applicants") {
      // Get users who have submitted job applications
      const { data: applications, error: appsError } = await supabaseAdmin
        .from("job_applications")
        .select("user_id, created_at")
        .eq("is_draft", false)
        .not("user_id", "is", null)
        .order("created_at", { ascending: false });

      if (appsError) {
        console.error("Error fetching applications:", appsError);
        return NextResponse.json(
          { error: "Failed to fetch applications" },
          { status: 500 }
        );
      }

      // Get unique user IDs and their application counts
      const userAppMap = new Map<string, { count: number; latestDate: string }>();
      (applications || []).forEach((app) => {
        if (app.user_id) {
          const existing = userAppMap.get(app.user_id);
          if (existing) {
            existing.count += 1;
            if (new Date(app.created_at) > new Date(existing.latestDate)) {
              existing.latestDate = app.created_at;
            }
          } else {
            userAppMap.set(app.user_id, {
              count: 1,
              latestDate: app.created_at,
            });
          }
        }
      });

      const applicantUserIds = Array.from(userAppMap.keys());

      if (applicantUserIds.length === 0) {
        users = [];
      } else {
        const { data: applicantUsers, error: usersError } = await supabaseAdmin
          .from("users")
          .select("*")
          .in("id", applicantUserIds)
          .order("created_at", { ascending: false });

        if (usersError) {
          console.error("Error fetching applicant users:", usersError);
          return NextResponse.json(
            { error: "Failed to fetch applicant users" },
            { status: 500 }
          );
        }

        users = (applicantUsers || []).map((user) => ({
          ...user,
          application_count: userAppMap.get(user.id)?.count || 0,
          latest_application_date: userAppMap.get(user.id)?.latestDate || null,
        }));

        // Apply search filter
        if (search) {
          users = users.filter(
            (user) =>
              user.name?.toLowerCase().includes(search.toLowerCase()) ||
              user.email?.toLowerCase().includes(search.toLowerCase()) ||
              user.phone?.toLowerCase().includes(search.toLowerCase())
          );
        }
      }
    } else {
      // Get all users
      let query = supabaseAdmin.from("users").select("*");

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
        );
      }

      const { data: allUsers, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
          { error: "Failed to fetch users" },
          { status: 500 }
        );
      }

      users = allUsers || [];
    }

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update user (admin only)
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if trying to update admin role - prevent changing admin role
    const supabaseAdmin = getSupabaseAdmin();
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent changing admin role
    if (existingUser?.role === "admin" && updateData.role && updateData.role !== "admin") {
      return NextResponse.json(
        { error: "Cannot change admin role" },
        { status: 400 }
      );
    }

    // Prevent non-admins from becoming admins (this should be restricted)
    if (updateData.role === "admin" && existingUser?.role !== "admin") {
      return NextResponse.json(
        { error: "Cannot assign admin role" },
        { status: 400 }
      );
    }

    // Normalize email to lowercase if being updated
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
      
      // Check if normalized email already exists (case-insensitive)
      const { data: existingEmailUser } = await supabaseAdmin
        .from("users")
        .select("id, email")
        .ilike("email", updateData.email)
        .neq("id", id)
        .maybeSingle();

      if (existingEmailUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
    }

    const validationResult = userUpdateSchema.safeParse(updateData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // Clean up data - convert empty strings to null
    const cleanedData: any = {};
    if (validationResult.data.name !== undefined) {
      cleanedData.name = validationResult.data.name;
    }
    if (validationResult.data.email !== undefined) {
      // Email is already normalized above, just use it
      cleanedData.email = validationResult.data.email;
    }
    if (validationResult.data.phone !== undefined) {
      cleanedData.phone =
        validationResult.data.phone && validationResult.data.phone.trim() !== ""
          ? validationResult.data.phone
          : null;
    }
    if (validationResult.data.avatar !== undefined) {
      cleanedData.avatar =
        validationResult.data.avatar && validationResult.data.avatar.trim() !== ""
          ? validationResult.data.avatar
          : null;
    }
    if (validationResult.data.role !== undefined) {
      cleanedData.role = validationResult.data.role;
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update(cleanedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = userCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabaseAdmin = getSupabaseAdmin();

    // Normalize email to lowercase for consistency
    const normalizedEmail = data.email.toLowerCase().trim();

    // Check if user already exists (case-insensitive)
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth (use normalized email)
    const userType = data.userType || (data.role === "vendor" ? "vendor" : "couple");
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: data.password,
      email_confirm: true, // Auto-confirm for admin-created users
      user_metadata: {
        full_name: data.name,
        user_type: userType,
        phone: data.phone || null,
      },
    });

    if (authError || !authData?.user) {
      console.error("Error creating auth user:", authError);
      return NextResponse.json(
        { error: authError?.message || "Failed to create user" },
        { status: 500 }
      );
    }

    // Create user record in database (use normalized email)
    const { data: user, error: dbError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        email: normalizedEmail,
        password: "$2a$10$placeholder_password_not_used_with_supabase_auth",
        name: data.name,
        phone: data.phone || null,
        avatar: data.avatar || null,
        role: data.role,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error creating user record:", dbError);
      // Try to clean up auth user if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to create user record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/admin/users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user is admin - prevent deletion
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user?.role === "admin") {
      return NextResponse.json(
        { error: "Cannot delete admin user" },
        { status: 400 }
      );
    }

    // Delete user from auth first, then database (cascade will handle related data)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (authError) {
      console.error("Error deleting auth user:", authError);
      // Continue with database deletion even if auth deletion fails
    }

    const { error } = await supabaseAdmin.from("users").delete().eq("id", id);

    if (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
