import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BookOpen, Search, ChevronRight, X, HelpCircle } from 'lucide-react';

// Dados das FAQs expandidos com respostas completas
const faqData = [
  {
    category: "Uso no dia a dia",
    items: [
      { 
        title: "Como colocar o aparelho na orelha", 
        description: "O encaixe correto faz toda a diferença na escuta.",
        answer: "Certifique-se de identificar o lado correto (geralmente vermelho para o ouvido direito e azul para o esquerdo). Posicione o corpo do aparelho atrás da orelha e, suavemente, insira a oliva/molde no canal auditivo até sentir que está firme e confortável."
      },
      { 
        title: "Posso usar o aparelho na chuva ou no banho?", 
        description: "Cuidados com água, suor e umidade.",
        answer: "Não. A maioria dos aparelhos auditivos não é à prova d'água. Retire-os sempre antes do banho, ao nadar ou em chuvas fortes. Se molhar sem querer, desligue imediatamente, remova a pilha (se houver) e coloque no desumidificador."
      }
    ]
  },
  {
    category: "Carga e pilha",
    items: [
      { 
        title: "Como carregar o aparelho auditivo", 
        description: "Passo a passo simples para deixar seu aparelho com bateria cheia.",
        answer: "Coloque os aparelhos no carregador fornecido, garantindo que os contatos de recarga estejam limpos e bem encaixados. A luz do carregador geralmente piscará enquanto carrega e ficará fixa quando a carga estiver completa."
      },
      { 
        title: "Meu aparelho não liga, o que faço?", 
        description: "Veja o que verificar antes de procurar a assistência.",
        answer: "1. Verifique se a pilha/bateria tem carga.\n2. Veja se a gaveta de pilha está totalmente fechada.\n3. Confira se a saída de som não está entupida por cera de ouvido.\n4. Certifique-se de que o aparelho está ligado."
      },
      { 
        title: "Como trocar a pilha do aparelho", 
        description: "Para aparelhos que usam pilha (não recarregáveis).",
        answer: "Abra a gaveta da pilha, remova a pilha gasta e retire o adesivo de proteção da pilha nova. Espere 1 minuto para a pilha 'respirar' antes de inseri-la com o lado positivo (+) voltado para cima. Feche a gaveta."
      }
    ]
  },
  {
    category: "Limpeza e cuidados",
    items: [
      { 
        title: "Como limpar o molde do aparelho", 
        description: "A limpeza diária aumenta a vida útil do aparelho.",
        answer: "Use um pano seco e macio ou uma flanela para limpar o aparelho todos os dias. Para o molde de silicone, você pode usar a escovinha apropriada para remover o excesso de cera. Nunca use álcool ou produtos químicos."
      },
      { 
        title: "Como guardar o aparelho à noite", 
        description: "Guardar do jeito certo evita umidade e dano.",
        answer: "Abra a gavetinha da pilha para desligar e economizar energia. Guarde o aparelho dentro do estojo protetor junto com o sílica gel (desumidificador) em um local seco e fora do alcance de crianças e animais domésticos."
      }
    ]
  },
  {
    category: "Problemas comuns",
    items: [
      { 
        title: "Meu aparelho está apitando, o que fazer?", 
        description: "O apito (microfonia) tem causas simples de resolver.",
        answer: "O apito acontece quando o som sai do aparelho e entra de volta no microfone. Verifique se o molde/oliva está bem encaixado na orelha. Se continuar apitando mesmo bem posicionado, procure seu fonoaudiólogo para verificar se há cera no ouvido ou necessidade de ajuste."
      },
      { 
        title: "Quando devo voltar ao SUS para revisão?", 
        description: "Revisões periódicas mantêm seu aparelho funcionando bem.",
        answer: "O acompanhamento recomendado é de pelo menos 1 vez a cada 6 meses, ou sempre que notar alteração na sua audição, desconforto no som ou avaria no aparelho."
      }
    ]
  },
  {
    category: "Conectar ao celular",
    items: [
      { 
        title: "Como conectar o aparelho ao celular", 
        description: "Alguns aparelhos modernos se conectam ao celular por Bluetooth.",
        answer: "Ative o Bluetooth do celular, abra as configurações de 'Acessibilidade' ou o aplicativo próprio do fabricante do seu aparelho auditivo e coloque o aparelho em modo de pareamento (desligando e ligando novamente)."
      }
    ]
  }
];

// Componente para um item da FAQ
const FaqItem = ({ title, description, onClick }) => (
  <div 
    onClick={onClick}
    className="rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm flex h-full items-start justify-between gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-[#34a094] hover:shadow-md cursor-pointer"
  >
    <div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-base text-slate-600">{description}</p>
    </div>
    <ChevronRight className="h-6 w-6 shrink-0 text-[#34a094] mt-0.5" />
  </div>
);

export default function Faq() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaq, setSelectedFaq] = useState(null);

  const normalizeText = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const normalizedSearch = normalizeText(searchTerm);

  const filteredFaqData = faqData.map(group => ({
    ...group,
    items: group.items.filter(item => 
      normalizeText(item.title).includes(normalizedSearch) || 
      normalizeText(item.description).includes(normalizedSearch)
    )
  })).filter(group => group.items.length > 0);

  const hasResults = filteredFaqData.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased font-sans">
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

          {/* FAQ LIST */}
          <div className="mt-10 space-y-10">
            {hasResults ? (
              filteredFaqData.map(group => (
                <section key={group.category}>
                  <h2 className="mb-4 text-2xl font-bold text-slate-800 border-b border-slate-200 pb-2">{group.category}</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {group.items.map(item => (
                      <FaqItem 
                        key={item.title} 
                        {...item} 
                        onClick={() => setSelectedFaq(item)}
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : searchTerm !== '' && (
              <div className="text-center py-12 text-slate-500 text-lg">
                Nenhuma dúvida encontrada para o termo digitado.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE RESPOSTA */}
      {selectedFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedFaq(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 text-[#34a094] mb-3">
              <HelpCircle className="w-7 h-7 shrink-0" />
              <h3 className="text-xl font-bold text-slate-900 pr-6">{selectedFaq.title}</h3>
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