export async function generatePassword(payload) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API error");
  }

  return res.json();
}