const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function generatePassword(payload) {
  const isCustom = payload.charset === "custom";

  const body = isCustom
    ? {
        charset: "custom",
        input: payload.input,
        ...(payload.context && { context: payload.context.trim() }),
        ...(payload.length && { length: payload.length }),
      }
    : {
        master: payload.master.trim(),
        context: payload.context.trim(),
        length: payload.length,
        charset: payload.charset || "all",
      };

  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "API error");
  }

  return res.json();
}
