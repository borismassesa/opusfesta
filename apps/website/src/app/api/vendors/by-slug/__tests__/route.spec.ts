/**
 * API tests for GET /api/vendors/by-slug/[slug].
 * Covers: unauthenticated teaser (exact + fallback slug), authenticated full payload, 404, slug normalization.
 *
 * Manual UI smoke test: As a guest, open /vendors/all, click a vendor card, and confirm the vendor
 * detail page renders (no "Vendor not found"). Repeat after signing in to confirm full content.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockVendor = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  slug: "hyatt-regency-dar-es-salaam",
  user_id: "660e8400-e29b-41d4-a716-446655440001",
  business_name: "Hyatt Regency Dar es Salaam",
  category: "Venues",
  subcategories: [],
  bio: "A beautiful venue.",
  description: "Full description here.",
  logo: null,
  cover_image: null,
  location: { city: "Dar es Salaam", country: "Tanzania" },
  price_range: "$$$",
  verified: true,
  tier: "pro",
  stats: { viewCount: 0, inquiryCount: 0, saveCount: 0, averageRating: 4.5, reviewCount: 10 },
  contact_info: {},
  social_links: {},
  years_in_business: null,
  team_size: null,
  services_offered: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const emptyThenable = {
  then(resolve: (v: { data: unknown[]; error: null }) => void) {
    return Promise.resolve({ data: [], error: null }).then(resolve);
  },
};

function createChainableMock(initialSingle: { data: unknown; error: { message: string } | null }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(initialSingle),
    order: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    ...emptyThenable,
  };
  return {
    from: vi.fn().mockReturnValue(chain),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    ...chain,
  };
}

let mockSupabase: ReturnType<typeof createChainableMock>;

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabase),
}));

const mockGetAuthenticatedUser = vi.fn().mockResolvedValue(null);
vi.mock("@/lib/api-auth", () => ({
  getAuthenticatedUser: (...args: unknown[]) => mockGetAuthenticatedUser(...args),
}));

vi.mock("@/lib/vendor-columns", () => ({
  VENDOR_COLUMNS: "id,slug,user_id,business_name,category",
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthenticatedUser.mockResolvedValue(null);
  mockSupabase = createChainableMock({ data: null, error: { message: "PGRST116" } });
  mockSupabase.rpc.mockResolvedValue({ data: [], error: null });
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
});

async function getRoute() {
  const mod = await import("@/app/api/vendors/by-slug/[slug]/route");
  return mod.GET;
}

describe("GET /api/vendors/by-slug/[slug]", () => {
  it("returns 404 for unknown slug when exact and fallback miss", async () => {
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: "PGRST116" } });
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

    const GET = await getRoute();
    const req = new NextRequest("http://localhost/api/vendors/by-slug/nonexistent-vendor");
    const res = await GET(req, { params: Promise.resolve({ slug: "nonexistent-vendor" }) });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Vendor not found");
  });

  it("returns 200 teaser for unauthenticated user when exact slug matches", async () => {
    mockSupabase.single.mockResolvedValue({ data: mockVendor, error: null });

    const GET = await getRoute();
    const req = new NextRequest("http://localhost/api/vendors/by-slug/hyatt-regency-dar-es-salaam");
    const res = await GET(req, { params: Promise.resolve({ slug: "hyatt-regency-dar-es-salaam" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.vendor).toBeDefined();
    expect(body.vendor.slug).toBe("hyatt-regency-dar-es-salaam");
    expect(body.vendor.business_name).toBe("Hyatt Regency Dar es Salaam");
    expect(body.isAuthenticated).toBe(false);
    expect(body.vendor.description).toBeNull();
  });

  it("returns 200 teaser for unauthenticated user when fallback resolves by name-based slug", async () => {
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: "PGRST116" } });
    mockSupabase.rpc.mockResolvedValue({ data: [mockVendor], error: null });

    const GET = await getRoute();
    const req = new NextRequest("http://localhost/api/vendors/by-slug/hyatt-regency-dar-es-salaam");
    const res = await GET(req, { params: Promise.resolve({ slug: "hyatt-regency-dar-es-salaam" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.vendor).toBeDefined();
    expect(body.vendor.slug).toBe("hyatt-regency-dar-es-salaam");
    expect(body.isAuthenticated).toBe(false);
  });

  it("normalizes slug (trim and lowercase) before lookup", async () => {
    mockSupabase.single.mockResolvedValue({ data: mockVendor, error: null });

    const GET = await getRoute();
    const req = new NextRequest("http://localhost/api/vendors/by-slug/Hyatt-Regency-Dar-Es-Salaam ");
    const res = await GET(req, { params: Promise.resolve({ slug: "Hyatt-Regency-Dar-Es-Salaam " }) });

    expect(res.status).toBe(200);
    expect(mockSupabase.from).toHaveBeenCalledWith("vendors");
    expect(mockSupabase.eq).toHaveBeenCalledWith("slug", "hyatt-regency-dar-es-salaam");
  });

  it("returns 404 for empty slug after trim", async () => {
    const GET = await getRoute();
    const req = new NextRequest("http://localhost/api/vendors/by-slug/   ");
    const res = await GET(req, { params: Promise.resolve({ slug: "   " }) });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Vendor not found");
  });

  it("returns 200 full payload for authenticated user when exact slug matches", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({
      id: "660e8400-e29b-41d4-a716-446655440001",
      clerkId: "user_2abc",
      email: "user@example.com",
    });
    mockSupabase.single.mockResolvedValue({ data: mockVendor, error: null });
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

    const GET = await getRoute();
    const req = new NextRequest("http://localhost/api/vendors/by-slug/hyatt-regency-dar-es-salaam");
    const res = await GET(req, { params: Promise.resolve({ slug: "hyatt-regency-dar-es-salaam" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.vendor).toBeDefined();
    expect(body.isAuthenticated).toBe(true);
    expect(Array.isArray(body.portfolio)).toBe(true);
    expect(Array.isArray(body.reviews)).toBe(true);
    expect(Array.isArray(body.similarVendors)).toBe(true);
  });
});


