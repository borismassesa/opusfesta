"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  CalendarDays,
  FileText,
  Sparkles,
  BookOpen,
  TrendingUp,
  Target,
  Tags,
  Mail,
  MessageSquare,
  Megaphone,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/careers/RichTextEditor";
import { AdviceIdeasContentProvider } from "@/context/AdviceIdeasContentContext";
import { AdviceIdeasPageContentEditor } from "./AdviceIdeasPageContentEditor";
import { AdviceIdeasPageEditor } from "./AdviceIdeasPageEditor";
import { ResponsivePreview } from "@/components/preview/ResponsivePreview";

interface AdvicePost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string | null;
  image_url: string | null;
  image_alt: string | null;
  author_name: string | null;
  author_avatar_url: string | null;
  category: string;
  read_time: number;
  featured: boolean;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

type SectionId =
  | "posts"
  | "hero"
  | "latest"
  | "trending"
  | "browseGoals"
  | "topics"
  | "newsletter"
  | "blog"
  | "cta"
  | "preview";

const CONTENT_NAV_GROUPS = [
  {
    label: "CONTENT",
    items: [{ id: "posts" as SectionId, label: "Posts", icon: FileText }],
  },
  {
    label: "SECTIONS",
    items: [
      { id: "hero" as SectionId, label: "Hero", icon: Sparkles },
      { id: "latest" as SectionId, label: "Latest Stories", icon: BookOpen },
      { id: "trending" as SectionId, label: "Trending", icon: TrendingUp },
      { id: "browseGoals" as SectionId, label: "Browse By Goal", icon: Target },
      { id: "topics" as SectionId, label: "Popular Topics", icon: Tags },
      { id: "newsletter" as SectionId, label: "Newsletter", icon: Mail },
      { id: "blog" as SectionId, label: "Blog", icon: MessageSquare },
      { id: "cta" as SectionId, label: "CTA", icon: Megaphone },
    ],
  },
  {
    label: "PREVIEW",
    items: [{ id: "preview" as SectionId, label: "Preview", icon: Eye }],
  },
];

const emptyForm: Omit<AdvicePost, "id" | "created_at" | "updated_at"> = {
  slug: "",
  title: "",
  description: "",
  content: "",
  image_url: "",
  image_alt: "",
  author_name: "",
  author_avatar_url: "",
  category: "",
  read_time: 5,
  featured: false,
  published: true,
  published_at: null,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const toDateInput = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

export default function AdviceIdeasEditorialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<AdvicePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<AdvicePost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [publishedAtInput, setPublishedAtInput] = useState("");
  const sectionParam = searchParams.get("section") as SectionId | null;
  const previewParam = searchParams.get("preview");
  const validSectionIds: SectionId[] = [
    "posts",
    "hero",
    "latest",
    "trending",
    "browseGoals",
    "topics",
    "newsletter",
    "blog",
    "cta",
    "preview",
  ];
  const [activeSection, setActiveSection] = useState<SectionId>(() => {
    if (previewParam === "true" || previewParam === "1") return "preview";
    if (sectionParam && validSectionIds.includes(sectionParam)) return sectionParam;
    return "posts";
  });
  const [previewNonce, setPreviewNonce] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleContentSaved = () => setPreviewNonce((prev) => prev + 1);
    window.addEventListener("content-saved", handleContentSaved);
    return () => window.removeEventListener("content-saved", handleContentSaved);
  }, []);

  useEffect(() => {
    const section = searchParams.get("section") as SectionId | null;
    const preview = searchParams.get("preview");
    if (preview === "true" || preview === "1") {
      setActiveSection("preview");
      if (section !== "preview") router.replace("/editorial/advice-ideas?preview=true", { scroll: false });
    } else if (section && validSectionIds.includes(section)) {
      setActiveSection(section);
    } else if (!section && !preview) {
      router.replace("/editorial/advice-ideas?section=posts", { scroll: false });
    }
  }, [searchParams, router]);

  const handleSectionClick = (section: SectionId) => {
    setActiveSection(section);
    if (section === "preview") {
      router.push("/editorial/advice-ideas?preview=true", { scroll: false });
    } else {
      router.push(`/editorial/advice-ideas?section=${section}`, { scroll: false });
    }
  };

  const getWebsiteUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
    if (envUrl) return envUrl;
    if (typeof window === "undefined") return "http://localhost:3001";
    try {
      const url = new URL(window.location.origin);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        const currentPort = url.port || "3000";
        url.port = currentPort === "3000" ? "3001" : currentPort === "3001" ? "3000" : "3001";
        return url.toString().replace(/\/$/, "");
      }
      if (url.hostname.startsWith("admin.")) {
        url.hostname = url.hostname.replace(/^admin\./, "");
        return url.toString().replace(/\/$/, "");
      }
      return url.toString().replace(/\/$/, "");
    } catch {
      return "http://localhost:3001";
    }
  };

  const previewUrl = `${getWebsiteUrl()}/advice-and-ideas?preview=draft&v=${previewNonce}`;
  const pageContentSectionIds: SectionId[] = ["hero", "latest", "trending", "browseGoals", "topics", "newsletter", "blog", "cta"];
  const isPageContentSection = pageContentSectionIds.includes(activeSection);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        getAdminApiUrl("/api/admin/advice-ideas/posts?includeUnpublished=true"),
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Error fetching advice posts:", err);
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const set = new Set(posts.map((post) => post.category).filter(Boolean));
    return Array.from(set).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (statusFilter === "published" && !post.published) return false;
      if (statusFilter === "draft" && post.published) return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.slug.toLowerCase().includes(query)
      );
    });
  }, [posts, searchQuery, statusFilter]);

  const openCreate = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setPublishedAtInput("");
    setDialogOpen(true);
  };

  const openEdit = (post: AdvicePost) => {
    setEditingPost(post);
    setForm({
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content ?? "",
      image_url: post.image_url ?? "",
      image_alt: post.image_alt ?? "",
      author_name: post.author_name ?? "",
      author_avatar_url: post.author_avatar_url ?? "",
      category: post.category,
      read_time: post.read_time ?? 5,
      featured: post.featured,
      published: post.published,
      published_at: post.published_at,
    });
    setPublishedAtInput(toDateInput(post.published_at));
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const slug = form.slug.trim() || slugify(form.title);
      if (!slug) {
        toast.error("Slug is required.");
        return;
      }

      const payload = {
        ...form,
        slug,
        read_time: Number(form.read_time) || 5,
        content: form.content?.trim() || null,
        image_url: form.image_url?.trim() || null,
        image_alt: form.image_alt?.trim() || null,
        author_name: form.author_name?.trim() || null,
        author_avatar_url: form.author_avatar_url?.trim() || null,
        published_at: publishedAtInput
          ? new Date(publishedAtInput).toISOString()
          : form.published
          ? new Date().toISOString()
          : null,
      };

      const response = await fetch(getAdminApiUrl("/api/admin/advice-ideas/posts"), {
        method: editingPost ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(editingPost ? { id: editingPost.id, ...payload } : payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to save post");
      }

      toast.success(editingPost ? "Post updated." : "Post created.");
      setDialogOpen(false);
      await fetchPosts();
    } catch (err) {
      console.error("Error saving post:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (post: AdvicePost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const response = await fetch(getAdminApiUrl("/api/admin/advice-ideas/posts"), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: post.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      toast.success("Post deleted.");
      await fetchPosts();
    } catch (err) {
      console.error("Error deleting post:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  return (
    <AdviceIdeasContentProvider>
      <div className="flex h-full min-h-0 overflow-hidden bg-background relative w-full flex-col md:flex-row">
        <div className="md:hidden border-b border-border/60 bg-background px-3 py-2 flex-shrink-0">
          <label className="sr-only" htmlFor="advice-ideas-section-select">
            Section
          </label>
          <select
            id="advice-ideas-section-select"
            value={activeSection}
            onChange={(event) => handleSectionClick(event.target.value as SectionId)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            {CONTENT_NAV_GROUPS.flatMap((group) => group.items).map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Secondary left sidebar - section nav (same as Homepage Editor) */}
        <aside className="hidden md:flex md:w-48 lg:w-56 flex-shrink-0 flex-col border-r border-border bg-background/95 overflow-hidden">
          <div className="px-3 py-4 border-b border-border/60 flex-shrink-0">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Sections
            </h2>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
            {CONTENT_NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-3">
                <div className="px-2 mb-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSectionClick(item.id as SectionId)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left",
                          isActive
                            ? "bg-foreground text-background font-medium shadow-sm"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-4 h-4 shrink-0",
                            isActive ? "text-background" : "text-muted-foreground"
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 overflow-hidden bg-background flex flex-col max-w-full">
          {activeSection === "preview" ? (
            <div className="h-full w-full flex flex-col bg-background overflow-hidden">
              <div className="flex-1 min-h-0 overflow-hidden p-6">
                <ResponsivePreview
                  previewUrl={previewUrl}
                  previewNonce={previewNonce}
                  onRefresh={() => setPreviewNonce((prev) => prev + 1)}
                />
              </div>
            </div>
          ) : isPageContentSection ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              <AdviceIdeasPageEditor
                activeSection={activeSection as Exclude<SectionId, "posts" | "preview">}
                categories={categories}
              />
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-6 lg:p-8 space-y-6">
                <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-2xl">Advice & Ideas CMS</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Create, edit, and publish advice articles for weddings, kitchen parties, send-offs, and more.
                      </p>
                    </div>
                    <Button onClick={openCreate} className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Post
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="relative w-full sm:max-w-md">
                        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          placeholder="Search by title, category, or slug"
                          className="pl-9"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {(["all", "published", "draft"] as const).map((status) => (
                          <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                          >
                            {status === "all" ? "All" : status === "published" ? "Published" : "Drafts"}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {loading ? (
                      <div className="py-12 text-center text-sm text-muted-foreground">Loading posts...</div>
                    ) : error ? (
                      <div className="py-12 text-center text-sm text-destructive">{error}</div>
                    ) : filteredPosts.length === 0 ? (
                      <div className="py-12 text-center text-sm text-muted-foreground">No posts found.</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPosts.map((post) => (
                            <TableRow key={post.id}>
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span>{post.title}</span>
                                  <span className="text-xs text-muted-foreground">/{post.slug}</span>
                                </div>
                              </TableCell>
                              <TableCell>{post.category}</TableCell>
                              <TableCell>
                                <Badge variant={post.published ? "default" : "secondary"}>
                                  {post.published ? "Published" : "Draft"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4" />
                                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : "—"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={post.featured ? "default" : "outline"}>
                                  {post.featured ? "Featured" : "Standard"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => openEdit(post)}>
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleDelete(post)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>{editingPost ? "Edit Post" : "Create Post"}</DialogTitle>
                      <DialogDescription>
                        Manage the content that appears on the Advice & Ideas page.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={form.title}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, title: event.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Slug</label>
                        <Input
                          value={form.slug}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, slug: event.target.value }))
                          }
                          onBlur={() => {
                            if (!form.slug && form.title) {
                              setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
                            }
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave blank to auto-generate from the title.
                        </p>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          rows={3}
                          value={form.description}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, description: event.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-medium">Content</label>
                        <p className="text-xs text-muted-foreground mb-1">
                          Use the toolbar for bold, italic, lists, links, images, and more.
                        </p>
                        <RichTextEditor
                          key={editingPost?.id ?? "new"}
                          content={form.content ?? ""}
                          onChange={(html) =>
                            setForm((prev) => ({ ...prev, content: html }))
                          }
                          placeholder="Write your post content..."
                          minHeight="280px"
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Input
                          list="advice-categories"
                          value={form.category}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, category: event.target.value }))
                          }
                        />
                        <datalist id="advice-categories">
                          {categories.map((category) => (
                            <option key={category} value={category} />
                          ))}
                        </datalist>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Read Time (min)</label>
                        <Input
                          type="number"
                          min={1}
                          max={60}
                          value={form.read_time}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, read_time: Number(event.target.value) }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Image URL</label>
                        <Input
                          value={form.image_url ?? ""}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, image_url: event.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Image Alt Text</label>
                        <Input
                          value={form.image_alt ?? ""}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, image_alt: event.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Author Name</label>
                        <Input
                          value={form.author_name ?? ""}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, author_name: event.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Author Avatar URL</label>
                        <Input
                          value={form.author_avatar_url ?? ""}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, author_avatar_url: event.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Published Date</label>
                        <Input
                          type="datetime-local"
                          value={publishedAtInput}
                          onChange={(event) => setPublishedAtInput(event.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium">Flags</label>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={form.featured}
                            onCheckedChange={(checked) =>
                              setForm((prev) => ({ ...prev, featured: Boolean(checked) }))
                            }
                          />
                          <span className="text-sm">Featured</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={form.published}
                            onCheckedChange={(checked) =>
                              setForm((prev) => ({ ...prev, published: Boolean(checked) }))
                            }
                          />
                          <span className="text-sm">Published</span>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="mt-4">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit} disabled={isSaving} className="gap-2">
                        {isSaving ? "Saving..." : editingPost ? "Save changes" : "Create post"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AdviceIdeasContentProvider>
  );
}
