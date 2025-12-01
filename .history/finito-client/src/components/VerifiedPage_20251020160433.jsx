// pages/EmailVerified.jsx
import { useSearchParams, Link } from "react-router-dom";

export default function EmailVerified() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          Bem-vindo(a)!
        </h1>
        <p className="text-gray-700 mb-6">
          Seu e-mail foi confirmado com sucesso. 🎉
        </p>

        {userId && (
          <p className="text-gray-500 mb-6">
            ID do usuário: <span className="font-mono">{userId}</span>
          </p>
        )}

        <p className="text-gray-700 mb-6">
          Agora você já pode acessar sua conta e explorar nossos recursos.
        </p>

        <Link
          to="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Ir para o Dashboard
        </Link>
      </div>
    </div>
  );
}
