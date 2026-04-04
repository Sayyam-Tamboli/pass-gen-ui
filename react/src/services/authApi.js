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

export async function addPasswordEntry(userId, context, site, charset, passwordLength) {
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
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to save password entry");
  }

  return res.json();
}

export async function getPasswordEntries(userId) {
  const res = await fetch(`${API_BASE}/api/passwords/${userId}`);

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch password entries");
  }

  return res.json();
}
