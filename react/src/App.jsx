import { useState } from "react";
import PasswordForm from "./components/PasswordForm";
import ResultBox from "./components/ResultBox";
import ErrorBox from "./components/ErrorBox";
import { generatePassword } from "./services/passgenApi";

export default function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate(payload) {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await generatePassword(payload);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Password Generator</h1>
      <PasswordForm onSubmit={handleGenerate} loading={loading} />
      <ErrorBox error={error} />
      <ResultBox result={result} />
    </div>
  );
}