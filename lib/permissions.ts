export type Role = "admin" | "employee" | "trainer" | "client";

export type Capability =
  | "dashboard:read"
  | "members:write"
  | "payments:write"
  | "access:write"
  | "routines:write"
  | "reports:read"
  | "settings:write";

const roleCapabilities: Record<Role, Capability[]> = {
  admin: ["dashboard:read", "members:write", "payments:write", "access:write", "routines:write", "reports:read", "settings:write"],
  employee: ["dashboard:read", "members:write", "payments:write", "access:write", "reports:read"],
  trainer: ["dashboard:read", "routines:write", "access:write"],
  client: ["dashboard:read"]
};

export function can(role: Role, capability: Capability) {
  return roleCapabilities[role].includes(capability);
}
