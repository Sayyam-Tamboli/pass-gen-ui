const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function register(username, email, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username.trim(),
      email: email.trim(),
      password,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registration failed");
  }

  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username.trim(),
      password,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }

  return res.json();
}

export async function addPasswordEntry(userId, context, site, charset, passwordLength, rules) {
  const res = await fetch(`${API_BASE}/api/passwords/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      context: context.trim(),
      site: site.trim(),
      charset,
      passwordLength,
      ...(rules && { rules }),
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to save password entry");
  }

  return res.json();
}

export async function regenerateEntry(id, master) {
  const res = await fetch(`${API_BASE}/api/passwords/${id}/regenerate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ master }),
  });

  if (!res.ok) {
    const text = await res.text();
    let errMsg = "Failed to regenerate";
    try { errMsg = JSON.parse(text).error || errMsg; } catch { /* non-JSON response */ }
    throw new Error(errMsg);
  }

  return res.json();
}

export async function getPasswordEntries(userId) {
  const url = `${API_BASE}/api/passwords/${userId}`;
  console.log("[authApi] GET", url);
  const res = await fetch(url);
  console.log("[authApi] GET passwords status:", res.status, res.ok);

  if (!res.ok) {
    const text = await res.text();
    console.error("[authApi] GET passwords error body:", text);
    let errMsg = "Failed to fetch password entries";
    try { errMsg = JSON.parse(text).error || errMsg; } catch { /* non-JSON response */ }
    throw new Error(errMsg);
  }

  const data = await res.json();
  console.log("[authApi] GET passwords data:", data);
  return data;
}
