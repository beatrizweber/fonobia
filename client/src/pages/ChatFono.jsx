import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Send, ArrowLeft, Headphones, MessageSquare, CheckCircle2, Star, ThumbsUp, ThumbsDown, Meh} from 'lucide-react';

export default function ChatFono() {
  const { id: atendimentoId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [usuario, setUsuario] = useState(null);
  const [atendimento, setAtendimento] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [encerrando, setEncerrando] = useState(false);

  // Estados para o Formulário de Avaliação Rápida
  const [avaliacaoFono, setAvaliacaoFono] = useState(0);
  const [facilidadeSite, setFacilidadeSite] = useState('');
  const [recado, setRecado] = useState('');
  const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [erroAvaliacao, setErroAvaliacao] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const usuarioSalvo = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!usuarioSalvo.id) {
      navigate('/login');
      return;
    }

    setUsuario(usuarioSalvo);
    carregarDadosAtendimento();

    const interval = setInterval(() => {
      carregarMensagens();
    }, 3000);

    return () => clearInterval(interval);
  }, [atendimentoId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  async function carregarDadosAtendimento() {
    try {
      const resAtendimento = await fetch(`http://localhost:3001/api/atendimentos/${atendimentoId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (resAtendimento.ok) {
        const dataAtendimento = await resAtendimento.json();
        setAtendimento(dataAtendimento);
      }
      await carregarMensagens();
    } catch (err) {
      console.error('Erro ao carregar chat:', err);
    } finally {
      setLoading(false);
    }
  }

  async function carregarMensagens() {
    try {
      const resMsg = await fetch(`http://localhost:3001/api/atendimentos/${atendimentoId}/mensagens`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (resMsg.ok) {
        const dataMsg = await resMsg.json();
        setMensagens(dataMsg);
      }
    } catch (err) {
      console.error('Erro ao atualizar mensagens:', err);
    }
  }

  async function handleEnviar(e) {
    e.preventDefault();
    if (!novaMensagem.trim() || enviando || atendimento?.status === 'encerrada') return;

    setEnviando(true);

    try {
      const response = await fetch(`http://localhost:3001/api/atendimentos/${atendimentoId}/mensagens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ conteudo: novaMensagem })
      });

      if (response.ok) {
        setNovaMensagem('');
        await carregarMensagens();
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setEnviando(false);
    }
  }

  // 🔒 Encerra o atendimento no banco
  async function handleEncerrarAtendimento() {
    if (!window.confirm('Deseja realmente encerrar este atendimento?')) return;

    setEncerrando(true);
    try {
      const response = await fetch(`http://localhost:3001/api/atendimentos/${atendimentoId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'encerrada' })
      });

      if (response.ok) {
        setAtendimento(prev => ({ ...prev, status: 'encerrada' }));
      }
    } catch (err) {
      console.error('Erro ao encerrar atendimento:', err);
    } finally {
      setEncerrando(false);
    }
  }

  const handleEnviarAvaliacao = async (e) => {
    e.preventDefault();
    setEnviandoAvaliacao(true);
    setErroAvaliacao('');

    try {
      const response = await fetch(`http://localhost:3001/api/atendimentos/${atendimentoId}/avaliacao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nota_fono: avaliacaoFono,
          facilidade_site: facilidadeSite,
          comentario: recado || null
        })
      });

      if (response.ok) {
        setAvaliacaoEnviada(true);
      } else {
        const data = await response.json();
        setErroAvaliacao(data.error || 'Erro ao enviar avaliação.');
      }
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      setErroAvaliacao('Não foi possível se conectar ao servidor.');
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-semibold text-sm">
        Carregando sala de atendimento...
      </div>
    );
  }

  const isEncerrado = atendimento?.status === 'encerrada';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

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
                Atendimento #{atendimentoId}
              </h1>
              <p className="text-xs text-slate-500">
                {isEncerrado 
                  ? 'Atendimento finalizado' 
                  : atendimento?.status === 'aguardando_voluntario' 
                  ? 'Aguardando um profissional...' 
                  : 'Em comunicação com fonoaudiologia'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isEncerrado
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : atendimento?.status === 'aguardando_voluntario' 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}>
              {isEncerrado ? 'Finalizado' : atendimento?.status === 'aguardando_voluntario' ? 'Aguardando' : 'Em Atendimento'}
            </span>

            {!isEncerrado && (
              <button
                onClick={handleEncerrarAtendimento}
                disabled={encerrando}
                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-colors"
              >
                {encerrando ? 'Encerrando...' : 'Concluir'}
              </button>
            )}
          </div>
        </div>

        {/* ÁREA DE MENSAGENS */}
        <div className="flex-1 bg-slate-100/70 border-x border-slate-200 p-4 overflow-y-auto max-h-[550px] min-h-[380px] space-y-4">
          {mensagens.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Nenhuma mensagem trocada ainda.
            </div>
          ) : (
            mensagens.map((msg) => {
              const isMinhaMensagem = msg.remetente_id === usuario.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMinhaMensagem ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-500">
                      {isMinhaMensagem ? 'Você' : msg.nome_remetente || 'Profissional'}
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
            })
          )}
          <div ref={messagesEndRef} />
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

                  {erroAvaliacao && (
                    <p className="text-xs text-red-600 text-center font-medium">{erroAvaliacao}</p>
                  )}

                  <button
                    type="submit"
                    disabled={!avaliacaoFono || !facilidadeSite || enviandoAvaliacao}
                    className="w-full py-2.5 bg-[#34a094] hover:bg-[#2b8379] text-white font-bold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-40"
                  >
                    {enviandoAvaliacao ? 'Enviando...' : 'Enviar Avaliação'}
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
                disabled={!novaMensagem.trim() || enviando}
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