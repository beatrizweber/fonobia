import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { API_URL } from '../config';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/esqueci-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar e-mail de redefinição.');
      }

      setEnviado(true);
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

          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#34a094]/10 text-[#34a094] grid place-items-center mx-auto mb-4">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Esqueci minha senha
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Digite seu e-mail e enviaremos um link pra você escolher uma nova senha.
            </p>
          </div>

          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
              {erro}
            </div>
          )}

          {enviado ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="font-semibold">E-mail enviado!</p>
              <p>Se esse e-mail estiver cadastrado, um link de redefinição chegará em instantes. Confira também a caixa de spam.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-[#34a094] hover:bg-[#2d8a80] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm text-base"
              >
                {carregando ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-slate-100">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#34a094] hover:underline">
              <ArrowLeft className="w-4 h-4" /> Voltar para o login
            </Link>
          </div>
        </div>
      </main>

      <Footer minimal={true} />
    </div>
  );
}
