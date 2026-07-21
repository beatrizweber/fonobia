import { useState } from 'react';

export default function ChatIa() {
  // Estado para o input do chat
  const [message, setMessage] = useState('');

  const isMessageEmpty = message.trim().length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased font-sans">
      {/* HEADER - Repetido */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
          <a href="index.html" className="flex items-center gap-3 text-2xl font-extrabold text-primary">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7"><path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"></path><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"></path></svg>
            </span>
            <span>EscutaBem</span>
          </a>
          
          <nav className="hidden items-center gap-1 md:flex">
            <a href="tela2.html" className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-base font-semibold text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-5 w-5"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
              <span>Dúvidas</span>
            </a>
            <a href="tela3.html" className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-base font-semibold bg-accent text-accent-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-5 w-5"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"></path></svg>
              <span>Chat</span>
            </a>
            <a href="tela1.html" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 rounded-md px-8 text-base ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="mr-2 h-5 w-5"><path d="m10 17 5-5-5-5"></path><path d="M15 12H3"></path><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path></svg> 
              Entrar
            </a>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <div className="container mx-auto flex max-w-3xl flex-col px-4 py-8 md:py-10" style={{ minHeight: 'calc(100vh - 10rem)' }}>
          
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-8 w-8 text-primary"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"></path></svg>
            <h1 className="text-3xl font-extrabold text-foreground">Pergunte à IA</h1>
          </div>

          {/* CHAT MESSAGES AREA */}
          <div className="mt-6 flex-1 space-y-4 overflow-y-auto pb-4">
            <div>
              <div className="max-w-[95%] whitespace-pre-wrap text-lg leading-relaxed text-foreground">
                Olá! Sou a assistente do EscutaBem. Conte sua dúvida sobre o aparelho auditivo que vou te ajudar. Você pode escrever ou tocar no microfone para gravar a pergunta.
              </div>
            </div>
          </div>

          {/* INPUT AREA */}
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow mt-2 p-3">
            <div className="flex items-end gap-2">
              {/* Mic Button */}
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md h-14 w-14 shrink-0" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-6 w-6"><path d="M12 19v3"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><rect x="9" y="2" width="6" height="13" rx="3"></rect></svg>
              </button>
              
              {/* Textarea - Lógica refatorada para usar estado */}
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex w-full rounded-md border-input bg-transparent px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none min-h-[56px] resize-none border-0 text-lg focus-visible:ring-0" 
                placeholder="Escreva sua pergunta..." 
                rows="2"
              />
              
              {/* Send Button - Lógica refatorada para desabilitar */}
              <button 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-md h-14 w-14 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={isMessageEmpty}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-6 w-6"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path></svg>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <a href="#" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 text-base">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="mr-2 h-5 w-5"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg> 
              Não resolveu? Falar com um fonoaudiólogo
            </a>
          </div>
        </div>
      </main>

      {/* FOOTER - Repetido */}
      <footer className="mt-16 border-t border-border bg-secondary/40">
        <div className="container mx-auto max-w-6xl px-4 py-10 text-center text-base text-muted-foreground">
          <p className="font-semibold text-foreground">EscutaBem</p>
          <p className="mt-2">Apoio para quem usa aparelho auditivo do SUS.</p>
          <p className="mt-3">
            <a href="tela4.html" className="font-semibold text-primary hover:underline">É fonoaudiólogo(a) ou estagiário(a)? Seja voluntário</a>
          </p>
          <p className="mt-3 text-sm">As respostas deste site não substituem consulta com fonoaudiólogo. Em emergências, procure uma unidade de saúde.</p>
        </div>
      </footer>
    </div>
  );
}