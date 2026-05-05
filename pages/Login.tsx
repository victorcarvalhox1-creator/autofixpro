
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

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
                backgroundImage: "url('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=1920')" 
            }}
        ></div>
        {/* Gradiente Overlay */}
        <div className="absolute inset-0 bg-brand-midnight/90 z-10 mix-blend-multiply"></div>
        
        <div className="relative z-20 flex flex-col justify-center px-16 text-white h-full pb-16">
            <div className="mb-12">
               <BrandLogo dark horizontal={false} showSubtitle className="scale-[1.2] origin-left" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold font-mono text-brand-snow mb-6 leading-tight">
                Inteligência em dados para o seu negócio
            </h1>
            <p className="text-lg text-brand-gray-light font-sans max-w-lg leading-relaxed">
                Junte-se a dezenas de oficinas que utilizam inteligência para gerenciar serviços, controle financeiro e aumentar a produtividade.
            </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-[40%] flex items-center justify-center bg-brand-gray-bg p-8 font-sans">
        <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden flex justify-center mb-8">
                <BrandLogo horizontal={false} showSubtitle />
            </div>

            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-mono font-bold text-brand-midnight tracking-tight">Bem-vindo de volta</h2>
                <p className="text-brand-gray mt-2 font-sans">Entre com suas credenciais para acessar.</p>
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
                        <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">Esqueceu a senha?</Link>
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
