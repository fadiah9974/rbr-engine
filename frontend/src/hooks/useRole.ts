"use client";

import { useAuth } from "./useAuth";
import type { Role } from "@/services/authService";

export function useRole(role: Role) {
  const { user } = useAuth();
  return user?.role === role;
}
