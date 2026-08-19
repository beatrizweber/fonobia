import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck } from 'lucide-react';

const SECOES = [
  {
    titulo: '1. Introdução',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: '2. Quais dados coletamos',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: '3. Como usamos os seus dados',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: '4. Com quem compartilhamos seus dados',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: '5. Seus direitos (LGPD)',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: '6. Segurança dos dados',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: '7. Termos de Uso da Plataforma',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: '8. Isenção de responsabilidade médica',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: '9. Contato',
    texto: 'FAZER TEXTO',
  },
];

export default function Privacidade() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-8 h-8 text-[#0d9488]" />
          <h1 className="text-3xl font-extrabold text-slate-900">Política de Privacidade e Termos de Uso</h1>
        </div>
        <p className="text-sm text-slate-500 mb-10">Última atualização: FAZER TEXTO</p>

        <div className="space-y-8">
          {SECOES.map((secao) => (
            <section key={secao.titulo}>
              <h2 className="text-lg font-bold text-slate-800 mb-2">{secao.titulo}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{secao.texto}</p>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
