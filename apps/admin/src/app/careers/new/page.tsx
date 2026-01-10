"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Loader2, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import Link from "next/link";
import { RichTextEditor } from "@/components/careers/RichTextEditor";
import { DragDropList } from "@/components/careers/DragDropList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const jobPostingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  employment_type: z.string().min(1, "Employment type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  salary_range: z.string().nullable().optional(),
  is_active: z.boolean(),
  // New template fields
  about_thefesta: z.string().nullable().optional(),
  benefits: z.array(z.string()),
  growth_description: z.string().nullable().optional(),
  hiring_process: z.array(z.string()),
  how_to_apply: z.string().nullable().optional(),
  equal_opportunity_statement: z.string().nullable().optional(),
});

type JobPostingFormData = z.infer<typeof jobPostingSchema>;

export default function NewJobPostingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic", "description", "requirements", "responsibilities", "about", "benefits", "growth", "hiring", "apply", "eoe"])
  );

  const form = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: "",
      department: "",
      location: "",
      employment_type: "Full-time",
      description: "",
      requirements: [],
      responsibilities: [],
      salary_range: "",
      is_active: true,
      // New template fields with defaults
      about_thefesta: "At OpusFesta, we build meaningful experiences and solutions that bring people, businesses, and communities together. We are a growing, people-first company driven by creativity, collaboration, and a passion for excellence. Our culture is built on trust, ownership, and continuous learning—where every voice matters and every team member has the opportunity to grow.",
      benefits: [],
      growth_description: "At OpusFesta, we believe in investing in our people. You'll have opportunities to learn new skills, take on new challenges, and grow your career alongside a talented and motivated team.",
      hiring_process: ["Application review", "Initial conversation with our team", "Role-specific interview", "Final discussion and offer"],
      how_to_apply: "If you're excited about this opportunity and believe you'd be a great fit for OpusFesta, we'd love to hear from you. 👉 Apply by submitting your resume through our careers page.",
      equal_opportunity_statement: "OpusFesta is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.",
    },
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const formProgress = useMemo(() => {
    const values = form.watch();
    const fields = [
      values.title,
      values.department,
      values.location,
      values.employment_type,
      values.description,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [form.watch()]);

  const onSubmit = async (data: JobPostingFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Use absolute URL with basePath to call admin app's own API
      const response = await fetch(getAdminApiUrl(`/api/admin/careers/jobs`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job posting");
      }

      router.push("/careers");
    } catch (err: any) {
      console.error("Error creating job posting:", err);
      setError(err.message || "Failed to create job posting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const SectionHeader = ({
    id,
    title,
    description,
  }: {
    id: string;
    title: string;
    description?: string;
  }) => {
    const isExpanded = expandedSections.has(id);
    return (
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => toggleSection(id)}
      >
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/careers">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Postings
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Progress: <span className="font-semibold text-foreground">{formProgress}%</span>
          </div>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${formProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">New Job Posting</h1>
        <p className="text-muted-foreground">
          Create a new job posting with all the details
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <SectionHeader
                id="basic"
                title="Basic Information"
                description="Job title, department, location, and employment type"
              />
            </CardHeader>
            {expandedSections.has("basic") && (
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <FormControl>
                          <Input placeholder="Engineering" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="Remote, Dar es Salaam, Hybrid" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="salary_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Range (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="$50k - $70k or TZS 2M - 3M" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        Enter salary range or leave blank if not disclosed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            )}
          </Card>

          {/* Description - The Role */}
          <Card>
            <CardHeader>
              <SectionHeader
                id="description"
                title="The Role"
                description="Describe the role and what makes this opportunity great"
              />
            </CardHeader>
            {expandedSections.has("description") && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RichTextEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder="We are looking for a [Job Title] to join our [Department] team at OpusFesta. In this role, you will play a key part in delivering high-quality solutions while working closely with cross-functional teams. This is an opportunity to make a real impact, take ownership of your work, and grow your career in a supportive and dynamic environment."
                        />
                      </FormControl>
                      <FormDescription>
                        This description will appear in the "The Role" section. Focus on the opportunity, impact, and growth potential.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            )}
          </Card>

          {/* Responsibilities - What You'll Do */}
          <Card>
            <CardHeader>
              <SectionHeader
                id="responsibilities"
                title="What You'll Do"
                description="Key responsibilities and duties for this role"
              />
            </CardHeader>
            {expandedSections.has("responsibilities") && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="responsibilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DragDropList
                          items={field.value || []}
                          onChange={field.onChange}
                          placeholder="Contribute to the design, development, and execution of projects..."
                          addButtonLabel="Add Responsibility"
                        />
                      </FormControl>
                      <FormDescription>
                        These will appear as bullet points in the "What You'll Do" section. Drag items to reorder. Click the X button to remove.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            )}
          </Card>

          {/* Requirements - What We're Looking For */}
          <Card>
            <CardHeader>
              <SectionHeader
                id="requirements"
                title="What We're Looking For"
                description="Required skills, experience, and qualifications"
              />
            </CardHeader>
            {expandedSections.has("requirements") && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DragDropList
                          items={field.value || []}
                          onChange={field.onChange}
                          placeholder="Relevant experience in [role-specific skills]..."
                          addButtonLabel="Add Requirement"
                        />
                      </FormControl>
                      <FormDescription>
                        These will appear as bullet points in the "What We're Looking For" section. Drag items to reorder. Click the X button to remove.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            )}
          </Card>

          {/* About OpusFesta */}
          <Card>
            <CardHeader>
              <SectionHeader
                id="about"
                title="About OpusFesta"
                description="Company mission and culture description"
              />
            </CardHeader>
            {expandedSections.has("about") && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="about_thefesta"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RichTextEditor
                          content={field.value || ""}
                          onChange={field.onChange}
                          placeholder="At OpusFesta, we build meaningful experiences and solutions that bring people, businesses, and communities together..."
                        />
                      </FormControl>
                      <FormDescription>
                        This will appear in the "About OpusFesta" section. Describe the company mission, culture, and values.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            )}
          </Card>

          {/* Why You'll Love Working at OpusFesta */}
          <Card>
            <CardHeader>
              <SectionHeader
                id="benefits"
                title="Why You'll Love Working at OpusFesta"
                description="Benefits and culture highlights"
              />
            </CardHeader>
            {expandedSections.has("benefits") && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DragDropList
                          items={field.value || []}
                          onChange={field.onChange}
                          placeholder="A collaborative, inclusive, and supportive team culture..."
                          addButtonLabel="Add Benefit"
                        />
                      </FormControl>
                      <FormDescription>
                        These will appear as bullet points in the "Why You'll Love Working at OpusFesta" section. Drag items to reorder. Click the X button to remove.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            )}
          </Card>

          {/* Growth at OpusFesta */}
          <Card>
            <CardHeader>
              <SectionHeader
                id="growth"
                title="Growth at OpusFesta"
                description="Career development information"
              />
            </CardHeader>
            {expandedSections.has("growth") && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="growth_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RichTextEditor
                          content={field.value || ""}
                          onChange={field.onChange}
                          placeholder="At OpusFesta, we believe in investing in our people. You'll have opportunities to learn new skills, take on new challenges, and grow your career alongside a talented and motivated team."
                        />
                      </FormControl>
                      <FormDescription>
                        This will appear in the "Growth at OpusFesta" section. Describe career development opportunities.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            )}
          </Card>

          {/* Our Hiring Process */}
          <Card>
            <CardHeader>
              <SectionHeader
                id="hiring"
                title="Our Hiring Process"
                description="Outline the hiring process steps"
              />
            </CardHeader>
            {expandedSections.has("hiring") && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="hiring_process"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DragDropList
                          items={field.value || []}
                          onChange={field.onChange}
                          placeholder="Application review..."
                          addButtonLabel="Add Step"
                        />
                      </FormControl>
                      <FormDescription>
                        These will appear as numbered steps in the "Our Hiring Process" section. Drag items to reorder. Click the X button to remove.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            )}
          </Card>

          {/* How to Apply */}
          <Card>
            <CardHeader>
              <SectionHeader
                id="apply"
                title="How to Apply"
                description="Call-to-action and application instructions"
              />
            </CardHeader>
            {expandedSections.has("apply") && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="how_to_apply"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RichTextEditor
                          content={field.value || ""}
                          onChange={field.onChange}
                          placeholder="If you're excited about this opportunity and believe you'd be a great fit for OpusFesta, we'd love to hear from you. 👉 Apply by submitting your resume through our careers page."
                        />
                      </FormControl>
                      <FormDescription>
                        This will appear in the "How to Apply" section. Include a call-to-action with emoji if desired.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            )}
          </Card>

          {/* Equal Opportunity Statement */}
          <Card>
            <CardHeader>
              <SectionHeader
                id="eoe"
                title="Equal Opportunity Statement"
                description="EEO statement and diversity commitment"
              />
            </CardHeader>
            {expandedSections.has("eoe") && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="equal_opportunity_statement"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RichTextEditor
                          content={field.value || ""}
                          onChange={field.onChange}
                          placeholder="OpusFesta is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees."
                        />
                      </FormControl>
                      <FormDescription>
                        This will appear in the "Equal Opportunity Statement" section at the bottom of the job description.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            )}
          </Card>

          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <SectionHeader
                id="publish"
                title="Publish Settings"
                description="Control when and how this job posting appears"
              />
            </CardHeader>
            {expandedSections.has("publish") && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Publish Immediately</FormLabel>
                        <FormDescription>
                          Make this job posting visible to applicants right away
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            )}
          </Card>

          <Separator />

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Job Posting
                </>
              )}
            </Button>
            <Link href="/careers">
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
            <div className="flex-1" />
            <Link href="/careers/new/preview" target="_blank">
              <Button type="button" variant="ghost" size="lg">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
