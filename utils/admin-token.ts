function decodeJwtPayload(token: string): unknown {
  const segment = token.split(".")[1];
  if (!segment) return null;

  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad =
    padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));

  return JSON.parse(atob(padded + pad)) as unknown;
}

export function isAdminToken(token: string | null): boolean {
  if (!token) return false;

  try {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload !== "object") return false;

    const roles = (payload as { roles?: unknown }).roles;
    const values = Array.isArray(roles)
      ? roles
      : typeof (payload as { role?: unknown }).role === "string"
        ? [(payload as { role: string }).role]
        : [];

    return values.some(
      (role) => typeof role === "string" && role.toLowerCase().includes("admin"),
    );
  } catch {
    return false;
  }
}
