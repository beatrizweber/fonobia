import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ear } from 'lucide-react';

const SECOES = [
  {
    titulo: 'Nossa missão',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: 'Quem somos',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: 'O problema que queremos resolver',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: 'Como o AjudaÁudio funciona',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: 'Fale com a gente',
    texto: 'FAZER TEXTO',
  },
];

export default function Sobre() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 font-sans">
      <Header />

      <main className="flex-1">
        <section className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0d9488] text-white grid place-items-center mx-auto mb-5 shadow-md">
            <Ear className="w-8 h-8" />
          </div>
          <span className="text-sm font-bold tracking-wider text-[#0d9488] uppercase block mb-3">
            Sobre o Projeto
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            AjudaÁudio
          </h1>
        </section>

        <section className="container mx-auto max-w-3xl px-4 pb-16 space-y-10">
          {SECOES.map((secao) => (
            <div key={secao.titulo}>
              <h2 className="text-xl font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">
                {secao.titulo}
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{secao.texto}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
