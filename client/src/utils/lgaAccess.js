// client/src/utils/lgaAccess.js
export function getLgaAccess() {
  const raw = localStorage.getItem("lgaAccess");

  if (!raw) return { scope: "none", lgas: [] };

  try {
    const parsed = JSON.parse(raw);

    if (parsed === "all") {
      return { scope: "all", lgas: [] };
    }

    if (Array.isArray(parsed)) {
      return { scope: "restricted", lgas: parsed };
    }

    return { scope: "none", lgas: [] };
  } catch {
    return { scope: "none", lgas: [] };
  }
}
