export default function ResultBox({ result }) {
  if (!result) return null;

  return (
    <div>
      <h3>Password</h3>
      <input value={result.password} readOnly />
      <small>Request ID: {result.requestId}</small>
    </div>
  );
}