import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BookOpen, Search, ChevronRight, X, HelpCircle, MessageSquare } from 'lucide-react';
import { API_URL } from '../config';

// Componente para um item da FAQ — "destacado" marca visualmente sem
// esconder os demais; "piscando" dá um flash rápido só quando a pessoa
// acabou de chegar aqui clicando em algo (Home, IA, etc.)
const FaqItem = ({ title, description, onClick, destacado, piscando }) => (
  <div
    id={destacado ? 'faq-item-destacado' : undefined}
    onClick={onClick}
    className={`rounded-xl border bg-white text-slate-900 shadow-sm flex h-full items-start justify-between gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
      destacado
        ? 'border-[#0d9488] ring-2 ring-[#0d9488] bg-[#0d9488]/5'
        : 'border-slate-200 hover:border-[#34a094]'
    } ${piscando ? 'animate-destaque-flash' : ''}`}
  >
    <div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-base text-slate-600">{description}</p>
    </div>
    <ChevronRight className="h-6 w-6 shrink-0 text-[#34a094] mt-0.5" />
  </div>
);

export default function Faq() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [faqData, setFaqData] = useState([]);
  const [carregandoFaq, setCarregandoFaq] = useState(true);

  // Conteúdo gerenciado pelo admin — vem do banco, não é mais fixo no código.
  // Só aceita o resultado se vier 200 E for de fato um array — senão
  // faqData.map() mais abaixo quebraria a página inteira (tela branca)
  // ao tentar iterar um objeto de erro tipo { error: "..." }.
  useEffect(() => {
    fetch(`${API_URL}/api/faq`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => { if (Array.isArray(data)) setFaqData(data); })
      .catch((err) => console.error('Erro ao carregar perguntas frequentes:', err))
      .finally(() => setCarregandoFaq(false));
  }, []);

  // Acessibilidade: fecha o modal de resposta com a tecla Esc
  useEffect(() => {
    if (!selectedFaq) return;
    const handleEsc = (e) => { if (e.key === 'Escape') setSelectedFaq(null); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedFaq]);

  const normalizeText = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const [itemPiscando, setItemPiscando] = useState(null);

  // Chegou aqui vindo de um bot\u00e3o de "d\u00favida r\u00e1pida" (Home, IA, etc.) \u2014
  // destaca a pergunta relacionada e abre a resposta, SEM esconder as
  // outras d\u00favidas da lista.
  useEffect(() => {
    const pergunta = searchParams.get('q');
    if (!pergunta || faqData.length === 0) return;

    setSearchTerm(pergunta);

    const todosItens = faqData.flatMap((grupo) => grupo.items);
    const itemExato = todosItens.find((item) => normalizeText(item.title) === normalizeText(pergunta));
    if (itemExato) {
      setSelectedFaq(itemExato);
      setItemPiscando(itemExato.title);
      const t1 = setTimeout(() => setItemPiscando(null), 1800);
      const t2 = setTimeout(() => {
        document.getElementById('faq-item-destacado')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [searchParams, faqData]);

  const normalizedSearch = normalizeText(searchTerm);

  const itemDestacado = (item) =>
    normalizedSearch !== '' &&
    (normalizeText(item.title).includes(normalizedSearch) || normalizeText(item.description).includes(normalizedSearch));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased font-sans">
      <style>{`
        @keyframes destaque-flash {
          0%, 100% { box-shadow: 0 0 0 0 rgba(13,148,136,0.55); }
          50% { box-shadow: 0 0 0 10px rgba(13,148,136,0); }
        }
        .animate-destaque-flash { animation: destaque-flash 0.9s ease-in-out 2; }
      `}</style>
      <Header />

      <main className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 py-10 md:py-14">
          
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-[#34a094]" />
            <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">Dúvidas comuns</h1>
          </div>
          <p className="mt-2 text-lg text-slate-600">Escolha um assunto e toque na pergunta para ver a resposta completa.</p>
          
          {/* SEARCH INPUT */}
          <div className="mt-6 relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input 
              type="search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-1 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34a094] h-14 pl-12 text-lg text-slate-800" 
              placeholder="Buscar dúvida (ex.: carregar, apito, parear)..." 
            />
          </div>

          {/* FAQ LIST — nunca esconde itens; só destaca os que combinam com a busca */}
          {carregandoFaq ? (
            <div className="mt-10 text-center text-slate-400 text-sm py-12">Carregando perguntas...</div>
          ) : (
          <div className="mt-10 space-y-10">
            {faqData.map(group => (
              <section key={group.category}>
                <h2 className="mb-4 text-2xl font-bold text-slate-800 border-b border-slate-200 pb-2">{group.category}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {group.items.map(item => (
                    <FaqItem
                      key={item.title}
                      {...item}
                      destacado={itemDestacado(item)}
                      piscando={itemPiscando === item.title}
                      onClick={() => setSelectedFaq(item)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
          )}

          {/* CTA PRA IA */}
          <div className="mt-14 bg-[#f0fdfa] border border-[#0d9488]/20 rounded-2xl p-8 text-center">
            <MessageSquare className="w-9 h-9 text-[#0d9488] mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900">Não encontrou o que precisa?</h2>
            <p className="mt-1.5 text-slate-600">Utilize nossa IA — a Zélia responde sua dúvida na hora.</p>
            <Link
              to="/chat"
              className="mt-5 inline-flex items-center justify-center gap-2 font-semibold transition-all bg-[#0d9488] text-white shadow-md hover:bg-teal-700 h-12 rounded-xl px-6 text-base"
            >
              <MessageSquare className="h-5 w-5" />
              Conversar com a Zélia
            </Link>
          </div>
        </div>
      </main>

      {/* MODAL DE RESPOSTA */}
      {selectedFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="faq-modal-title" className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedFaq(null)}
              aria-label="Fechar"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 text-[#34a094] mb-3">
              <HelpCircle className="w-7 h-7 shrink-0" />
              <h3 id="faq-modal-title" className="text-xl font-bold text-slate-900 pr-6">{selectedFaq.title}</h3>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-2">
              <p className="text-slate-700 text-base leading-relaxed whitespace-pre-line">
                {selectedFaq.answer}
              </p>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => setSelectedFaq(null)}
                className="w-full bg-[#34a094] hover:bg-[#2d8a80] text-white font-bold py-3 px-4 rounded-xl transition-colors text-center"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}