import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao realizar login.');
      }

      // Salva os dados do usuário autenticado no navegador
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // Redireciona para o chat ou página principal
      navigate('/chat');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          
          {/* TÍTULO E SUBTÍTULO NEUTROS */}
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Acesse sua Conta
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Entre para acessar suas conversas e informações.
            </p>
          </div>

          {/* MENSAGEM DE ERRO (CASO EXISTA) */}
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
              {erro}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full p-3 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-[#34a094]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-3 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-[#34a094]"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#34a094] hover:bg-[#2d8a80] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 mt-6 text-base"
            >
              <LogIn className="w-5 h-5" /> 
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Ainda não tem conta?{' '}
              <Link to="/cadastro" className="font-bold text-[#34a094] hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer minimalista */}
      <Footer minimal={true} />
    </div>
  );
}