export type UserType = "couple" | "vendor" | "admin";
export type UserRole = "user" | "vendor" | "admin";

export interface OpusFestaUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  role: UserRole;
  userType: UserType;
  imageUrl: string | null;
}
