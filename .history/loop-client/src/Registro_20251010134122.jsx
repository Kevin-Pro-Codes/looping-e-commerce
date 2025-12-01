import React, { useState } from "react";
import axios from "axios";

export default function Registrar() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); // <-- store errors
  const [successMsg, setSuccessMsg] = useState("");

  axios.defaults.baseURL = "http://localhost:8000";
  axios.defaults.withCredentials = true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");   // clear previous error
    setSuccessMsg(""); // clear previous success

    try {
      // Step 1: Fetch CSRF cookie
      await axios.get("/sanctum/csrf-cookie");

      // Step 2: Send registration POST request
      const res = await axios.post("/register", {
        name,
        email,
        password,
        password_confirmation: password,
      });

      setSuccessMsg(res.data.message);
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      // Handle Laravel validation errors (object) or other messages
      if (error.response?.data?.errors) {
        // Convert object to string for display
        const messages = Object.entries(error.response.data.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join("\n");
        setErrorMsg(messages);
      } else if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-24">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 mt-18">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">Registrar</h1>

        {/* Success message */}
        {successMsg && (
          <div
            style={{ color: "green", whiteSpace: "pre-wrap", marginBottom: "1rem", userSelect: "text" }}
          >
            {successMsg}
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <pre
            style={{
              color: "red",
              whiteSpace: "pre-wrap",
              marginBottom: "1rem",
              padding: "0.5rem",
              backgroundColor: "#fee",
              borderRadius: "0.5rem",
              userSelect: "text", // makes it copyable
            }}
          >
            {errorMsg}
          </pre>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500"
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500"
            required
            minLength="6"
          />
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-all duration-200"
          >
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
}
