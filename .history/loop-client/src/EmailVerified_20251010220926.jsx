// pages/EmailVerified.jsx
import { useSearchParams } from "react-router-dom";

export default function EmailVerified() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user");

  return (
    <div>
      <h1>Email confirmado com sucesso!</h1>
      <p>User ID: {userId}</p>
      {/* optionally call your backend to log in the user or show a message */}
    </div>
  );
}
