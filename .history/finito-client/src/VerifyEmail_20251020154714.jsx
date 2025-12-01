import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const { id, hash } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/email/verify/${id}/${hash}`,
          {
            method: "GET",
            credentials: "include", // send cookies if using Sanctum
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            // Not authenticated, redirect to SPA login
            window.location.href = "http://localhost:3000/logar";
            return;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (data.verified) {
          alert(data.message || "Email verified!");
          // Redirect to SPA perfil page
          navigate("/perfil");
        } else {
          alert("Verification failed.");
        }
      } catch (err) {
        console.error("Email verification error:", err);
        alert("Email verification failed. Please try again.");
      }
    };

    verifyEmail();
  }, [id, hash, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Verifying your email, please wait...</p>
    </div>
  );
}
