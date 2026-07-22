import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MessageSquare, Mic, Send, HelpCircle, X, UserCheck, Loader2 } from 'lucide-react';

export default function ChatIa() {
  const [messages, setMessages] = useState([
    {
      sender: 'ia',
      text: 'Olá! Sou a assistente do EscutaBem. Conte sua dúvida sobre seu aparelho auditivo do SUS que vou te ajudar. Você pode escrever ou tocar no microfone.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFonoModal, setShowFonoModal] = useState(false);

  // PROMPT DE SISTEMA: Instrui a IA sobre seu papel e limites de atuação
  const SYSTEM_INSTRUCTION = `
    Você é a assistente virtual do projeto "EscutaBem", especialista em auxiliar pacientes usuários de aparelhos auditivos (AASI) do SUS.
    Sua linguagem deve ser extremamente simples, acolhedora, direta e acessível para idosos ou pessoas com pouca afinidade com tecnologia.
    
    Diretrizes:
    1. Forneça orientações práticas sobre troca de pilhas/baterias, limpeza de cera, substituição de olivas (borrachinhas), ajuste do volume e eliminação de chiados/apitos (efeito microfonia).
    2. NUNCA faça diagnósticos médicos ou recomende alteração de regulagem interna do aparelho sem acompanhamento profissional.
    3. Em casos graves ou de dúvida persistente, recomende procurar o fonoaudiólogo da unidade de saúde (SUS) responsável.
    4. Mantenha respostas curtas e divididas em passos simples (ex: Passo 1, Passo 2).
  `;

  // Função para chamar a API da IA
  const fetchIaResponse = async (userText, chatHistory) => {
    // Insira sua API Key de testes ou use uma variável de ambiente (import.meta.env.VITE_GEMINI_API_KEY)
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!API_KEY) {
      // Fallback amigável caso não haja chave de API configurada
      return "Desculpe, estou em manutenção no momento. Verifique se o aparelho está bem encaixado na orelha e limpo. Caso precise de ajuda, clique no botão para falar com um fonoaudiólogo.";
    }

    try {
      // Formata o histórico no formato esperado pela API do Gemini
      const contents = [
        { role: 'user', parts: [{ text: SYSTEM_INSTRUCTION }] },
        ...chatHistory.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: userText }] }
      ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        }
      );

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Erro na chamada da IA:', error);
      return 'Ops, tive um problema ao tentar entender sua dúvida. Pode tentar enviar novamente?';
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    const updatedHistory = [...messages, { sender: 'user', text: userText }];
    
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    // Chama a IA real
    const iaResponseText = await fetchIaResponse(userText, messages);

    setMessages((prev) => [...prev, { sender: 'ia', text: iaResponseText }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('O reconhecimento de voz não é suportado neste navegador. Recomendamos o Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = () => setIsListening(false);

    recognition.start();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased font-sans">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto flex max-w-3xl flex-col px-4 py-8 md:py-10" style={{ minHeight: 'calc(100vh - 10rem)' }}>
          
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-[#34a094]" />
            <h1 className="text-3xl font-extrabold text-slate-900">Pergunte à IA</h1>
          </div>

          {/* HISTÓRICO DE MENSAGENS */}
          <div className="mt-6 flex-1 space-y-6 overflow-y-auto pb-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[95%] whitespace-pre-wrap text-lg leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#34a094] text-white p-4 rounded-2xl' 
                      : 'text-slate-900 bg-slate-100 p-4 rounded-2xl'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* INDICADOR DE CARREGAMENTO (IA PENSANDO) */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-600 p-4 rounded-2xl flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#34a094]" />
                  <span>Analisando sua dúvida...</span>
                </div>
              </div>
            )}
          </div>

          {/* ÁREA DE INPUT */}
          <div className="rounded-xl border border-slate-200 bg-white text-slate-900 shadow mt-2 p-3">
            <div className="flex items-end gap-2">
              <button 
                type="button" 
                onClick={handleMicClick}
                aria-label="Gravar áudio"
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors border rounded-md h-14 w-14 shrink-0 ${
                  isListening 
                    ? 'bg-red-500 text-white border-red-500 animate-pulse' 
                    : 'border-slate-200 bg-white shadow-sm hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Mic className="h-6 w-6" />
              </button>
              
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={isListening ? "Ouvindo você..." : "Escreva sua pergunta..."}
                rows={2}
                className="flex w-full rounded-md bg-transparent px-3 py-2 placeholder:text-slate-400 focus-visible:outline-none min-h-[56px] resize-none border-0 text-lg focus-visible:ring-0 disabled:opacity-50"
              />
              
              <button 
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label="Enviar"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors bg-[#34a094] text-white shadow hover:bg-[#2d8a80] rounded-md h-14 w-14 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button 
              type="button"
              onClick={() => setShowFonoModal(true)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 h-9 px-4 py-2 text-base text-slate-700 cursor-pointer"
            >
              <HelpCircle className="mr-1 h-5 w-5 text-slate-600" /> 
              Não resolveu? Falar com um fonoaudiólogo
            </button>
          </div>

        </div>
      </main>

      {showFonoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button 
              onClick={() => setShowFonoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 text-[#34a094] mb-4">
              <UserCheck className="w-8 h-8" />
              <h2 className="text-xl font-bold text-slate-900">Atendimento Humano</h2>
            </div>

            <p className="text-slate-600 text-base leading-relaxed mb-6">
              Nossa equipe de fonoaudiólogos voluntários está à disposição para te ajudar em casos mais complexos do seu aparelho.
            </p>

            <div className="space-y-3">
              <button 
                onClick={() => {
                  alert("Redirecionando para a fila de atendimento voluntário...");
                  setShowFonoModal(false);
                }}
                className="w-full bg-[#34a094] hover:bg-[#2d8a80] text-white font-bold py-3 px-4 rounded-xl transition-colors text-center"
              >
                Iniciar Atendimento Humano
              </button>

              <button 
                onClick={() => setShowFonoModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-colors text-center"
              >
                Voltar para a IA
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}