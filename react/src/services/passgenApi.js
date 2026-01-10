const API_BASE =import.meta.env.VITE_API_BASE_URL || "";

export async function generatePassword(payload) {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      master: payload.master.trim(),
      context: payload.context.trim(),
      length: payload.length,
      charset: payload.charset || "all",
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "API error");
  }

  return res.json();
}