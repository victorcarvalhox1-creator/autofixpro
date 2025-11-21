
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
    <div className="min-h-screen flex w-full">
      {/* Lado Esquerdo - Imagem e Branding (Escondido em mobile) */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-slate-900 overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ 
                backgroundImage: "url('https://escwcpcpdbwfdairdacp.supabase.co/storage/v1/object/sign/VictorCarvalho/_MG_5619.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNzhjOWUxYy03ODJhLTRlMGEtODRjOC1iMmFhYWNiMmYxNjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJWaWN0b3JDYXJ2YWxoby9fTUdfNTYxOS5qcGciLCJpYXQiOjE3NjM3NjQyNzMsImV4cCI6MTc5NTMwMDI3M30.FolA1jbhFJox_f8YIG1YvASWiMluHIYn128xyuRd37I')" 
            }}
        ></div>
        {/* Gradiente Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-purple-900/80 z-10"></div>
        
        <div className="relative z-20 flex flex-col justify-center px-16 text-white">
            <div className="bg-white/10 backdrop-blur-md w-20 h-20 rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
                <Wrench size={40} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
                Gestão Inteligente para sua Oficina
            </h1>
            <p className="text-xl text-blue-100 max-w-lg leading-relaxed">
                Otimize processos, controle o financeiro e aumente a produtividade da sua funilaria com o AutoFix Pro.
            </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-[40%] flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900">Bem-vindo de volta</h2>
                <p className="text-gray-500 mt-2">Entre com suas credenciais para acessar.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle size={18} />
                {error}
                </div>
            )}

            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User size={20} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="seu@email.com"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-sm font-semibold text-gray-700">Senha</label>
                        <a href="#" className="text-sm text-blue-600 hover:underline font-medium">Esqueceu a senha?</a>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock size={20} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99]"
            >
                {isLoading ? 'Autenticando...' : 'Entrar na Plataforma'}
                {!isLoading && <ArrowRight size={20} />}
            </button>

            <div className="text-center pt-2">
                <p className="text-gray-500">
                Não tem uma conta? <Link to="/register" className="text-blue-600 font-bold hover:underline transition-colors">Crie agora gratuitamente</Link>
                </p>
            </div>
            </form>
            
            <div className="pt-8 mt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} AutoFix Pro. Todos os direitos reservados.
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
