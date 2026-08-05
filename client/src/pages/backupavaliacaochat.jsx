import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Send, 
  ArrowLeft, 
  Headphones, 
  MessageSquare,
  CheckCircle2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Eye
} from 'lucide-react';

export default function ChatFono() {
  const navigate = useNavigate();

  // 🧪 ESTADOS SIMULADOS PARA TESTE VISUAL (Sem dependência de backend)
  const [statusSimulado, setStatusSimulado] = useState('com_voluntario'); // 'aguardando_voluntario', 'com_voluntario', 'encerrada'
  
  const [usuario] = useState({ id: '1', nome: 'Paciente Teste', tipo: 'paciente' });
  const [novaMensagem, setNovaMensagem] = useState('');
  const [mensagens, setMensagens] = useState([
    { id: 1, remetente_id: '1', nome_remetente: 'Você', conteudo: 'Olá! Meu aparelho auditivo está apitando muito.', criado_em: new Date().toISOString() },
    { id: 2, remetente_id: '2', nome_remetente: 'Dra. Ana (Fono)', conteudo: 'Olá! Vamos checar se o molde está bem encaixado no seu ouvido.', criado_em: new Date().toISOString() }
  ]);

  // Estados da Avaliação Rápida
  const [avaliacaoFono, setAvaliacaoFono] = useState(0);
  const [facilidadeSite, setFacilidadeSite] = useState('');
  const [recado, setRecado] = useState('');
  const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false);

  // Envio simulado de mensagem no chat
  function handleEnviar(e) {
    e.preventDefault();
    if (!novaMensagem.trim() || statusSimulado === 'encerrada') return;

    setMensagens(prev => [
      ...prev,
      {
        id: Date.now(),
        remetente_id: usuario.id,
        nome_remetente: 'Você',
        conteudo: novaMensagem,
        criado_em: new Date().toISOString()
      }
    ]);
    setNovaMensagem('');
  }

  // Envio simulado da avaliação
  const handleEnviarAvaliacao = (e) => {
    e.preventDefault();
    setAvaliacaoEnviada(true);
  };

  const isEncerrado = statusSimulado === 'encerrada';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      {/* 🛠️ BARRA DE CONTROLE TEMPORÁRIA (Para você testar todos os estados na tela) */}
      <div className="bg-slate-800 text-white py-2 px-4 text-center text-xs flex flex-wrap items-center justify-center gap-3">
        <span className="font-bold text-amber-400 flex items-center gap-1">
          <Eye className="w-4 h-4" /> Painel de Teste Visual:
        </span>
        <span>Simular Status do Atendimento:</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => { setStatusSimulado('aguardando_voluntario'); setAvaliacaoEnviada(false); }}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${statusSimulado === 'aguardando_voluntario' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Aguardando
          </button>
          <button
            onClick={() => { setStatusSimulado('com_voluntario'); setAvaliacaoEnviada(false); }}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${statusSimulado === 'com_voluntario' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Em Atendimento
          </button>
          <button
            onClick={() => { setStatusSimulado('encerrada'); setAvaliacaoEnviada(false); }}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${statusSimulado === 'encerrada' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Encerrado (Ver Avaliação)
          </button>
        </div>
      </div>

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-6 flex flex-col">
        
        {/* BARRA SUPERIOR DO CHAT */}
        <div className="bg-white rounded-t-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/atendimento')}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="bg-[#34a094]/10 p-2.5 rounded-xl text-[#34a094]">
              <Headphones className="w-5 h-5" />
            </div>

            <div>
              <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
                Atendimento #101
              </h1>
              <p className="text-xs text-slate-500">
                {isEncerrado 
                  ? 'Atendimento finalizado' 
                  : statusSimulado === 'aguardando_voluntario' 
                  ? 'Aguardando um profissional...' 
                  : 'Em comunicação com fonoaudiologia'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isEncerrado
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : statusSimulado === 'aguardando_voluntario' 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}>
              {isEncerrado ? 'Finalizado' : statusSimulado === 'aguardando_voluntario' ? 'Aguardando' : 'Em Atendimento'}
            </span>

            {!isEncerrado && (
              <button
                onClick={() => setStatusSimulado('encerrada')}
                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-colors"
              >
                Concluir
              </button>
            )}
          </div>
        </div>

        {/* ÁREA DE MENSAGENS */}
        <div className="flex-1 bg-slate-100/70 border-x border-slate-200 p-4 overflow-y-auto max-h-[550px] min-h-[300px] space-y-4">
          {mensagens.map((msg) => {
            const isMinhaMensagem = msg.remetente_id === usuario.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMinhaMensagem ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-500">
                    {msg.nome_remetente}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {new Date(msg.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                    isMinhaMensagem
                      ? 'bg-[#34a094] text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.conteudo}
                </div>
              </div>
            );
          })}
        </div>

        {/* ÁREA INFERIOR: ENVIAR MENSAGEM OU AVALIAÇÃO RÁPIDA */}
        <div className="bg-white rounded-b-2xl border border-slate-200 p-4 shadow-sm">
          {isEncerrado ? (
            avaliacaoEnviada ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                <h3 className="font-bold text-sm">Obrigado pelo seu feedback!</h3>
                <p className="text-xs text-emerald-700">Sua resposta ajuda a aprimorar nosso atendimento.</p>
              </div>
            ) : (
              /* CARD DE AVALIAÇÃO EXPRESSA DO SERVIÇO */
              <div className="space-y-5 py-2">
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Atendimento Finalizado
                  </h3>
                  <p className="text-xs text-slate-500">
                    Como foi sua experiência? Leva menos de 30 segundos!
                  </p>
                </div>

                <form onSubmit={handleEnviarAvaliacao} className="space-y-4 max-w-lg mx-auto">
                  {/* Pergunta 1: Fonoaudiólogo */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Como você avalia a ajuda do Profissional?
                    </label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((estrela) => (
                        <button
                          key={estrela}
                          type="button"
                          onClick={() => setAvaliacaoFono(estrela)}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              estrela <= avaliacaoFono
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pergunta 2: Facilidade da Plataforma */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      O site/sistema foi fácil de usar?
                    </label>
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFacilidadeSite('dificil')}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          facilidadeSite === 'dificil'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" /> Difícil
                      </button>

                      <button
                        type="button"
                        onClick={() => setFacilidadeSite('razoavel')}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          facilidadeSite === 'razoavel'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Meh className="w-3.5 h-3.5" /> Razoável
                      </button>

                      <button
                        type="button"
                        onClick={() => setFacilidadeSite('facil')}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          facilidadeSite === 'facil'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> Muito Fácil
                      </button>
                    </div>
                  </div>

                  {/* Pergunta 3: Campo Opcional */}
                  <div>
                    <input
                      type="text"
                      value={recado}
                      onChange={(e) => setRecado(e.target.value)}
                      placeholder="Deixe um comentário ou sugestão (opcional)..."
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#34a094]/30 focus:border-[#34a094]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!avaliacaoFono || !facilidadeSite}
                    className="w-full py-2.5 bg-[#34a094] hover:bg-[#2b8379] text-white font-bold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-40"
                  >
                    Enviar Avaliação
                  </button>
                </form>
              </div>
            )
          ) : (
            /* FORMULÁRIO DE ENVIO PADRÃO DO CHAT */
            <form onSubmit={handleEnviar} className="flex items-center gap-2">
              <input
                type="text"
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a094]/40 focus:border-[#34a094]"
              />
              <button
                type="submit"
                disabled={!novaMensagem.trim()}
                className="p-3 bg-[#34a094] hover:bg-[#2b8379] text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}