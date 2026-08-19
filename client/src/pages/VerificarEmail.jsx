import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MailCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { API_URL } from '../config';

export default function VerificarEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState(token ? 'carregando' : 'sem-token'); // 'carregando' | 'sucesso' | 'erro' | 'sem-token'
  const [mensagem, setMensagem] = useState('');

  const [emailReenvio, setEmailReenvio] = useState('');
  const [reenviando, setReenviando] = useState(false);
  const [reenvioFeito, setReenvioFeito] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function confirmar() {
      try {
        const response = await fetch(`${API_URL}/api/auth/verificar-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await response.json();

        if (response.ok) {
          setStatus('sucesso');
          setMensagem(data.message);
        } else {
          setStatus('erro');
          setMensagem(data.error || 'Não foi possível confirmar seu e-mail.');
        }
      } catch (err) {
        setStatus('erro');
        setMensagem('Não foi possível se conectar ao servidor.');
      }
    }

    confirmar();
  }, [token]);

  async function handleReenviar(e) {
    e.preventDefault();
    setReenviando(true);
    try {
      await fetch(`${API_URL}/api/auth/reenviar-verificacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailReenvio })
      });
      setReenvioFeito(true);
    } catch (err) {
      // silencioso — a mensagem genérica já é mostrada de qualquer forma
      setReenvioFeito(true);
    } finally {
      setReenviando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">

          {status === 'carregando' && (
            <div className="space-y-3">
              <Loader2 className="w-10 h-10 text-[#34a094] mx-auto animate-spin" />
              <h1 className="text-xl font-extrabold text-slate-900">Confirmando seu e-mail...</h1>
            </div>
          )}

          {status === 'sucesso' && (
            <div className="space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h1 className="text-xl font-extrabold text-slate-900">E-mail confirmado!</h1>
              <p className="text-sm text-slate-500">{mensagem}</p>
              <Link to="/login" className="inline-block font-bold text-[#34a094] hover:underline text-sm pt-2">
                Ir para o login
              </Link>
            </div>
          )}

          {(status === 'erro' || status === 'sem-token') && (
            <div className="space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h1 className="text-xl font-extrabold text-slate-900">
                {status === 'sem-token' ? 'Link incompleto' : 'Link inválido ou expirado'}
              </h1>
              <p className="text-sm text-slate-500">
                {status === 'sem-token'
                  ? 'Esse link de confirmação está incompleto.'
                  : mensagem}
              </p>

              {reenvioFeito ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
                  Se esse e-mail estiver cadastrado e ainda não confirmado, reenviamos o link de confirmação. Confira sua caixa de entrada.
                </div>
              ) : (
                <form onSubmit={handleReenviar} className="space-y-3 text-left pt-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Reenviar e-mail de confirmação
                    </label>
                    <input
                      type="email"
                      value={emailReenvio}
                      onChange={(e) => setEmailReenvio(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="w-full p-3 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-[#34a094]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={reenviando}
                    className="w-full flex items-center justify-center gap-2 bg-[#34a094] hover:bg-[#2d8a80] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm"
                  >
                    <MailCheck className="w-4 h-4" />
                    {reenviando ? 'Enviando...' : 'Reenviar link'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer minimal={true} />
    </div>
  );
}
