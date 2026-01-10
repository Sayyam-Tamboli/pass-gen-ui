import { useState } from "react";

export default function PasswordForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    master: "",
    context: "",
    length: 16,
    charset: "all",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        name="master"
        placeholder="Master Key"
        required
        onChange={handleChange}
      />

      <input
        type="text"
        name="context"
        placeholder="Context (gmail, github)"
        required
        onChange={handleChange}
      />

      <input
        type="number"
        name="length"
        min="8"
        max="64"
        value={form.length}
        onChange={handleChange}
      />

      <select name="charset" onChange={handleChange}>
        <option value="all">All</option>
        <option value="alphanumeric">Alphanumeric</option>
      </select>

      <button disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>
    </form>
  );
}