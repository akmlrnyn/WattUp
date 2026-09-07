export function getRoles(role: unknown): string[] {
  if (typeof role !== "string") {
    return [];
  }

  return role
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(role: unknown): boolean {
  return getRoles(role).includes("admin");
}