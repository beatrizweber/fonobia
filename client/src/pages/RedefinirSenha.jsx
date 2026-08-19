import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/redefinir-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir a senha.');
      }

      setSucesso(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground antialiased font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h1 className="text-xl font-extrabold text-slate-900">Link inválido</h1>
            <p className="text-sm text-slate-500">
              Esse link de redefinição de senha está incompleto. Peça um novo link na tela de login.
            </p>
            <Link to="/esqueci-senha" className="inline-block font-bold text-[#34a094] hover:underline text-sm">
              Pedir novo link
            </Link>
          </div>
        </main>
        <Footer minimal={true} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">

          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#34a094]/10 text-[#34a094] grid place-items-center mx-auto mb-4">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Redefinir senha</h1>
            <p className="text-sm text-slate-500 mt-1">Escolha uma nova senha para sua conta.</p>
          </div>

          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
              {erro}
            </div>
          )}

          {sucesso ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="font-semibold">Senha redefinida com sucesso!</p>
              <p>Redirecionando para o login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nova senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full p-3 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-[#34a094]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmar nova senha</label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full p-3 border rounded-xl text-base focus:outline-none ${
                    confirmarSenha && confirmarSenha !== novaSenha
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-slate-200 focus:border-[#34a094]'
                  }`}
                />
                {confirmarSenha && confirmarSenha !== novaSenha && (
                  <p className="text-xs text-red-600 mt-1">As senhas não coincidem.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-[#34a094] hover:bg-[#2d8a80] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm text-base"
              >
                {carregando ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer minimal={true} />
    </div>
  );
}
