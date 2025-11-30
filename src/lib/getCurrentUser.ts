import Cookies from "js-cookie";

export async function getCurrentUser() {
  const token = Cookies.get("token");
  if (!token) return null;

  try {
    const res = await fetch("/api/auth/get-current-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    if (data?.success) return data.user;
    return null;
  } catch {
    return null;
  }
}
