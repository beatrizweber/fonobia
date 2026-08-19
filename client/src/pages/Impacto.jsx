import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GraficoLinha from '../components/GraficoLinha';
import { Headphones, UserCheck, Star, HandHeart, TrendingUp } from 'lucide-react';
import { API_URL } from '../config';

export default function Impacto() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serie, setSerie] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/estatisticas`)
      .then((res) => res.json())
      .then(setStats)
      .catch((err) => console.error('Erro ao buscar estatísticas:', err))
      .finally(() => setLoading(false));

    fetch(`${API_URL}/api/estatisticas/serie`)
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setSerie(data))
      .catch((err) => console.error('Erro ao buscar série de estatísticas:', err));
  }, []);

  const cards = [
    {
      icon: Headphones,
      label: 'Atendimentos realizados',
      valor: stats?.totalAtendimentos,
      cor: 'text-[#0d9488]',
      bg: 'bg-[#0d9488]/10',
    },
    {
      icon: UserCheck,
      label: 'Voluntários ativos',
      valor: stats?.voluntariosAtivos,
      cor: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Star,
      label: 'Satisfação média',
      valor: stats?.satisfacaoMedia ? `${stats.satisfacaoMedia} / 5.0` : null,
      cor: 'text-amber-500',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 font-sans">
      <Header />

      <main className="flex-1">
        <section className="container mx-auto max-w-4xl px-4 py-16 text-center">
          <span className="text-sm font-bold tracking-wider text-[#0d9488] uppercase block mb-3">
            Impacto Social
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Nosso impacto até agora
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            O AjudaÁudio conecta pacientes usuários de aparelho auditivo do SUS a fonoaudiólogos
            e estagiários voluntários. Estes números mostram o alcance real da plataforma.
          </p>
        </section>

        <section className="container mx-auto max-w-4xl px-4 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {cards.map(({ icon: Icon, label, valor, cor, bg }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                <div className={`w-14 h-14 rounded-full ${bg} ${cor} grid place-items-center mx-auto mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <p className="text-4xl font-black text-slate-900">
                  {loading ? '—' : (valor ?? '0')}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          {!loading && stats?.voluntariosDisponiveisAgora > 0 && (
            <p className="mt-4 text-center text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl py-2.5">
              {stats.voluntariosDisponiveisAgora} {stats.voluntariosDisponiveisAgora === 1 ? 'profissional está' : 'profissionais estão'} disponíveis pra atender agora
            </p>
          )}
        </section>

        <section className="container mx-auto max-w-4xl px-4 pb-16">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Evolução dos atendimentos (últimos 30 dias)</h2>
          </div>
          <GraficoLinha
            titulo="Atendimentos realizados"
            subtitulo="Chamados com fonoaudiólogo por dia"
            dados={serie}
            campo="atendimentos"
            cor="#0d9488"
          />
        </section>

        <section className="w-full bg-[#f0fdfa] py-16">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <HandHeart className="w-10 h-10 text-[#0d9488] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Faça parte desse impacto
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Seja fonoaudiólogo(a), estagiário(a) voluntário(a) ou alguém que precisa de ajuda com
              seu aparelho auditivo — o AjudaÁudio é feito por e para essa comunidade.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/cadastro"
                className="inline-flex items-center justify-center gap-2 font-semibold transition-all bg-[#0d9488] text-white shadow-md hover:bg-teal-700 h-12 rounded-xl px-6 text-base"
              >
                Seja voluntário
              </Link>
              <Link
                to="/atendimento"
                className="inline-flex items-center justify-center gap-2 font-semibold transition-all bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-50 h-12 rounded-xl px-6 text-base"
              >
                Pedir atendimento
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
