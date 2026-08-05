import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  MessageSquare, Mic, Send, HelpCircle, X, UserCheck, Loader2,
  BatteryCharging, AlertCircle, Sparkles, Smartphone, Volume2, Ear
} from 'lucide-react';

// Mesmos temas e mesmas perguntas usados na Home e em /duvidas —
// clicar já manda a pergunta pronta pra IA.
const PERGUNTAS_RAPIDAS = [
  { icon: BatteryCharging, label: 'Como carregar', pergunta: 'Como carregar o aparelho auditivo?' },
  { icon: AlertCircle, label: 'Não liga', pergunta: 'Meu aparelho não liga, o que faço?' },
  { icon: Sparkles, label: 'Como limpar', pergunta: 'Como limpar o molde do aparelho?' },
  { icon: Smartphone, label: 'Ligar no celular', pergunta: 'Como conectar o aparelho ao celular?' },
  { icon: Volume2, label: 'Está apitando', pergunta: 'Meu aparelho está apitando, o que fazer?' },
  { icon: Ear, label: 'Como colocar', pergunta: 'Como colocar o aparelho na orelha?' },
];

const MENSAGEM_INICIAL = {
  sender: 'ia',
  text: 'Olá! Sou a assistente do **AjudaÁudio**. Conte sua dúvida sobre seu aparelho auditivo do SUS que vou te ajudar. Você pode escrever ou tocar no microfone.'
};

// 🟢 Função para converter **texto** em negrito nativo sem bibliotecas extras
const formatarTextoComNegrito = (texto) => {
  if (!texto) return '';

  const partes = texto.split(/(\*\*.*?\*\*)/g);

  return partes.map((parte, index) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-slate-900">
          {parte.slice(2, -2)}
        </strong>
      );
    }
    return parte;
  });
};

export default function ChatIa() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([MENSAGEM_INICIAL]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFonoModal, setShowFonoModal] = useState(false);

  // Se estiver logado como paciente, carrega o histórico salvo da conversa com a IA
  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!token || usuario?.tipo !== 'paciente') return;

    (async () => {
      try {
        const response = await fetch('http://localhost:3001/api/chat/historico', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) return;

        const historico = await response.json();
        if (historico.length > 0) {
          setMessages([
            MENSAGEM_INICIAL,
            ...historico.map((m) => ({ sender: m.remetente === 'ia' ? 'ia' : 'user', text: m.conteudo }))
          ]);
        }
      } catch (err) {
        console.error('Erro ao carregar histórico da IA:', err);
      }
    })();
  }, []);

  // Função para enviar mensagem ao Backend Fastify via fetch
  const handleSend = async (e, textoForcado) => {
    e?.preventDefault();
    const userText = textoForcado || input;
    if (!userText.trim() || isLoading) return;

    const updatedHistory = [...messages, { sender: 'user', text: userText }];

    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: userText, historico: updatedHistory.slice(0, -1) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na resposta do servidor.');
      }

      setMessages((prev) => [...prev, { sender: 'ia', text: data.text }]);
    } catch (error) {
      console.error('Erro ao conectar com o backend:', error);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ia',
          text: 'Ops, tive um problema de conexão com o servidor. Verifique se o backend está ligado e tente novamente.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePerguntaRapida = (pergunta) => {
    handleSend(null, pergunta);
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

  // Direciona direto para a página de Atendimento
  const handleIniciarAtendimentoHumano = () => {
    setShowFonoModal(false);
    navigate('/atendimento');
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

          {/* PERGUNTAS RÁPIDAS — só no início, some depois que a conversa começa */}
          {messages.length === 1 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {PERGUNTAS_RAPIDAS.map(({ icon: Icon, label, pergunta }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handlePerguntaRapida(pergunta)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-[#34a094] hover:text-[#34a094] transition-colors disabled:opacity-50"
                >
                  <Icon className="h-4 w-4 text-[#34a094]" />
                  {label}
                </button>
              ))}
            </div>
          )}

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
                  {/* 🟢 Formatação tratada aqui */}
                  {msg.sender === 'ia' ? formatarTextoComNegrito(msg.text) : msg.text}
                </div>
              </div>
            ))}

            {/* INDICADOR DE CARREGAMENTO */}
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

      {/* MODAL FONOAUDIÓLOGO */}
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
                onClick={handleIniciarAtendimentoHumano}
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