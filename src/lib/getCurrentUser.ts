export async function getCurrentUser() {
  // 1️⃣ Try session first
  const cached = sessionStorage.getItem("currentUser");
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      sessionStorage.removeItem("currentUser");
    }
  }

  // 2️⃣ Fetch if not in session
  const res = await fetch("/api/auth/Get-Current-User", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch user");

  const data = await res.json();

  // 3️⃣ Save full response
  sessionStorage.setItem("currentUser", JSON.stringify(data));

  return data;
}
