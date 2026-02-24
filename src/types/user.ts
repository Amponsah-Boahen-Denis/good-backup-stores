export type UserStatus = "active" | "blocked" | "on_hold";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  planType?: "starter" | "pro" | "business";
  logo?: string | null;
  createdAt: number;
  updatedAt: number;
};


