import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

async function isAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.replace("Bearer ", "");
  const supabaseAdmin = getSupabaseAdmin();
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) return false;

  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return userData?.role === "admin";
}

const postSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  image_alt: z.string().nullable().optional(),
  author_name: z.string().nullable().optional(),
  author_avatar_url: z.string().nullable().optional(),
  category: z.string().min(1, "Category is required"),
  read_time: z.number().int().min(1).max(60).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  published_at: z.string().datetime().nullable().optional(),
});

const normalizePayload = (payload: Record<string, unknown>) => {
  const cleaned: Record<string, unknown> = { ...payload };
  const nullableFields = [
    "content",
    "image_url",
    "image_alt",
    "author_name",
    "author_avatar_url",
    "published_at",
  ];

  for (const field of nullableFields) {
    if (cleaned[field] === "") {
      cleaned[field] = null;
    }
  }

  return cleaned;
};

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const includeUnpublished = searchParams.get("includeUnpublished") === "true";

    let query = supabaseAdmin
      .from("advice_ideas_posts")
      .select("*")
      .order("published_at", { ascending: false });

    if (!includeUnpublished) {
      query = query.eq("published", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching advice posts:", error);
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }

    return NextResponse.json({ posts: data || [] });
  } catch (error: any) {
    console.error("Error in GET /api/admin/advice-ideas/posts:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const cleaned = normalizePayload(body);
    const validation = postSchema.safeParse(cleaned);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const payload = validation.data;
    if (payload.published && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("advice_ideas_posts")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error creating advice post:", error);
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/admin/advice-ideas/posts:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...rest } = body || {};

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const cleaned = normalizePayload(rest);
    const validation = postSchema.partial().safeParse(cleaned);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const payload = validation.data;
    if (payload.published && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("advice_ideas_posts")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating advice post:", error);
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }

    return NextResponse.json({ post: data });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/advice-ideas/posts:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const id = body?.id as string | undefined;

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from("advice_ideas_posts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting advice post:", error);
      return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/advice-ideas/posts:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
