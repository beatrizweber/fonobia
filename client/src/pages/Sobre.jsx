import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ear } from 'lucide-react';

const SECOES = [
  {
    titulo: 'Nossa missão',
    texto: `Facilitar o dia a dia daqueles que não têm condições de se consultar sempre que surge uma dúvida. Queremos ser a ponte acessível e prática para que você encontre respostas claras e orientação sem complicações.`,
  },
  {
    titulo: 'Quem somos',
    texto: `Acreditamos que a comunicação é um direito de todos — seja por meio da voz, da audição, da visão ou de qualquer outro sentido. Por isso, existimos para facilitar esse caminho. Queremos ser o suporte de confiança para você se expressar, ouvir e se conectar com o mundo da forma mais simples possível.`,
  },
  {
    titulo: 'O problema que queremos resolver',
    texto: `Tirar dúvidas sobre audição ou aparelhos muitas vezes custa caro, exige consultas demoradas e envolve termos técnicos difíceis de entender. Com isso, muita gente fica sem suporte no dia a dia. Nós existimos para acabar com essa distância e tornar o acesso à informação algo simples e ao alcance de todos.`,
  },
  {
    titulo: 'Como o AjudaÁudio funciona',
    itens: [
      'Você envia sua dúvida: Sem burocracia ou termos difíceis.',
      'Profissionais analisam o seu caso: Buscamos a orientação ou solução mais prática para o que você precisa.',
      'Você resolve no seu tempo: Recebe um direcionamento claro para seguir com tranquilidade no dia a dia.',
    ],
  },
  {
    titulo: 'Fale com a gente',
    texto: 'Surgiu alguma dúvida ou quer conversar com a gente? Estamos aqui para ajudar:',
    itens: [
      'E-mail: interlagos.escuderia@gmail.com',
      { texto: 'Instagram: @interlagos_escuderia', url: 'https://www.instagram.com/interlagos_escuderia/' },
    ],
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
              {secao.texto && (
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{secao.texto}</p>
              )}
              {secao.itens && (
                <ul className="mt-2 space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed">
                  {secao.itens.map((item) => {
                    // Item pode ser um texto simples ou { texto, url } quando
                    // precisa virar link clicável (ex: Instagram).
                    const texto = typeof item === 'string' ? item : item.texto;
                    const url = typeof item === 'string' ? null : item.url;
                    return (
                      <li key={texto}>
                        {url ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#0d9488] hover:underline">
                            {texto}
                          </a>
                        ) : (
                          texto
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
