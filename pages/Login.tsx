
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: loginError } = await login(email, password);
      
      if (loginError) {
        if (loginError.message.includes("Invalid login credentials")) {
            setError("Email ou senha incorretos.");
        } else {
            setError(loginError.message);
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Erro inesperado ao tentar logar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
      style={{ 
        // Substitua esta URL pela URL da sua foto se desejar
        backgroundImage: "url('https://escwcpcpdbwfdairdacp.supabase.co/storage/v1/object/sign/VictorCarvalho/_MG_5619.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNzhjOWUxYy03ODJhLTRlMGEtODRjOC1iMmFhYWNiMmYxNjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJWaWN0b3JDYXJ2YWxoby9fTUdfNTYxOS5qcGciLCJpYXQiOjE3NjM3NjQyNzMsImV4cCI6MTc5NTMwMDI3M30.FolA1jbhFJox_f8YIG1YvASWiMluHIYn128xyuRd37I')" 
      }}
    >
      {/* Overlay Escuro para dar destaque ao formulário */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 z-10 mx-4 border border-white/20">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <Wrench size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">AutoFix Pro</h1>
          <p className="text-gray-500 mt-2">Sistema de Gestão de Funilaria</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white/50 focus:bg-white"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white/50 focus:bg-white"
                placeholder="••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? 'Entrando...' : 'Acessar Sistema'}
            {!isLoading && <ArrowRight size={18} />}
          </button>

          <div className="text-center mt-4 border-t pt-4">
            <p className="text-sm text-gray-600">
              Ainda não tem conta? <Link to="/register" className="text-blue-600 font-bold hover:underline">Cadastre-se</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
