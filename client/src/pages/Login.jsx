import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LogIn, MailCheck } from 'lucide-react';
import { API_URL } from '../config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [emailNaoVerificado, setEmailNaoVerificado] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [reenvioFeito, setReenvioFeito] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setEmailNaoVerificado(false);
    setReenvioFeito(false);
    setCarregando(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // 🟢 Corrigido o Content-Type
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.emailNaoVerificado) setEmailNaoVerificado(true);
        throw new Error(data.error || 'Falha ao realizar login.');
      }

      // 1. Salva os dados do usuário e o token de autenticação no navegador
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      localStorage.setItem('token', data.token);

      // 2. Redireciona conforme o perfil do usuário
      const tipo = (data.usuario?.tipo || '').toLowerCase();
      if (tipo === 'admin') {
        navigate('/paineladmin');
      } else if (tipo === 'fonoaudiologo' || tipo === 'estagiario') {
        navigate('/painelfono');
      } else {
        navigate('/atendimento');
      }
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleReenviarVerificacao = async () => {
    setReenviando(true);
    try {
      await fetch(`${API_URL}/api/auth/reenviar-verificacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setReenvioFeito(true);
    } catch (err) {
      setReenvioFeito(true);
    } finally {
      setReenviando(false);
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
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center space-y-2">
              <p>{erro}</p>
              {emailNaoVerificado && (
                reenvioFeito ? (
                  <p className="text-emerald-700 font-semibold">Se esse e-mail estiver cadastrado, reenviamos o link de confirmação.</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleReenviarVerificacao}
                    disabled={reenviando}
                    className="inline-flex items-center gap-1.5 font-bold text-[#34a094] hover:underline disabled:opacity-50"
                  >
                    <MailCheck className="w-4 h-4" />
                    {reenviando ? 'Reenviando...' : 'Reenviar e-mail de confirmação'}
                  </button>
                )
              )}
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-slate-700">
                  Senha
                </label>
                <Link to="/esqueci-senha" className="text-xs font-semibold text-[#34a094] hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
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