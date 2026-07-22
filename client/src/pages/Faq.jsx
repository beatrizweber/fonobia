import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer'

// Dados das FAQs (para limpar o JSX)
const faqData = [
  {
    category: "Uso no dia a dia",
    items: [
      { title: "Como colocar o aparelho na orelha", description: "O encaixe correto faz toda a diferença na escuta." },
      { title: "Posso usar o aparelho na chuva ou no banho?", description: "Cuidados com água, suor e umidade." }
    ]
  },
  {
    category: "Carga e pilha",
    items: [
      { title: "Como carregar o aparelho auditivo", description: "Passo a passo simples para deixar seu aparelho com bateria cheia." },
      { title: " Meu aparelho não liga, o que faço?", description: "Veja o que verificar antes de procurar a assistência." },
      { title: "Como trocar a pilha do aparelho", description: "Para aparelhos que usam pilha (não recarregáveis)." }
    ]
  },
  {
    category: "Limpeza e cuidados",
    items: [
      { title: "Como limpar o molde do aparelho", description: "A limpeza diária aumenta a vida útil do aparelho." },
      { title: "Como guardar o aparelho à noite", description: "Guardar do jeito certo evita umidade e dano." }
    ]
  },
  {
    category: "Problemas comuns",
    items: [
      { title: "Meu aparelho está apitando, o que fazer?", description: "O apito (microfonia) tem causas simples de resolver." },
      { title: "Quando devo voltar ao SUS para revisão?", description: "Revisões periódicas mantêm seu aparelho funcionando bem." }
    ]
  },
  {
    category: "Conectar ao celular",
    items: [
      { title: "Como conectar o aparelho ao celular", description: "Alguns aparelhos modernos se conectam ao celular por Bluetooth." }
    ]
  }
];

// Componente para um item da FAQ
const FaqItem = ({ title, description }) => (
  <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm flex h-full items-start justify-between gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md cursor-pointer">
    <div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-base text-muted-foreground">{description}</p>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 shrink-0 text-primary mt-0.5" aria-hidden="true">
      <path d="m9 18 6-6-6-6"></path>
    </svg>
  </div>
);

export default function Faq() {
  // Estado para a busca
  const [searchTerm, setSearchTerm] = useState('');

  // Função para normalizar texto (remover acentos)
  const normalizeText = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const normalizedSearch = normalizeText(searchTerm);

  // Filtra os dados da FAQ com base no termo de busca
  const filteredFaqData = faqData.map(group => ({
    ...group,
    items: group.items.filter(item => 
      normalizeText(item.title).includes(normalizedSearch) || 
      normalizeText(item.description).includes(normalizedSearch)
    )
  })).filter(group => group.items.length > 0); // Remove grupos vazios

  const hasResults = filteredFaqData.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased font-sans">
      <Header />

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 py-10 md:py-14">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
            <h1 className="text-3xl font-extrabold text-foreground md:text-4xl">Dúvidas comuns</h1>
          </div>
          <p className="mt-2 text-lg text-muted-foreground">Escolha um assunto e toque na pergunta para ver a resposta.</p>
          
          {/* SEARCH INPUT - Lógica de busca refatorada */}
          <div className="mt-6 relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
            <input 
              type="search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex w-full rounded-xl border border-input bg-transparent px-3 py-1 shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary h-14 pl-12 text-lg" 
              placeholder="Buscar dúvida (ex.: carregar, apito, parear)..." 
            />
          </div>

          {/* FAQ LIST - Renderização dinâmica baseada na busca */}
          <div className="mt-10 space-y-10">
            {hasResults ? (
              filteredFaqData.map(group => (
                <section key={group.category}>
                  <h2 className="mb-4 text-2xl font-bold text-foreground">{group.category}</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {group.items.map(item => (
                      <FaqItem key={item.title} {...item} />
                    ))}
                  </div>
                </section>
              ))
            ) : searchTerm !== '' && (
              <div className="text-center py-12 text-muted-foreground text-lg">
                Nenhuma dúvida encontrada para o termo digitado.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}