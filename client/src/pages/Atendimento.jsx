import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Headphones, Send, Clock, MessageSquare, CheckCircle2, XCircle, FileText, AlertCircle, LogOut, User, ShieldCheck, Filter, ChevronRight} from 'lucide-react';

export default function Atendimento() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [mensagemInicial, setMensagemInicial] = useState('');
  const [chamados, setChamados] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos' | 'abertos' | 'encerrados'
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [notificacao, setNotificacao] = useState({ tipo: '', msg: '' });

  // 🔒 1. Carrega dados e Protege a Rota
  useEffect(() => {
    const usuarioSalvo = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!usuarioSalvo.id) {
      navigate('/login');
      return;
    }

    setUsuario(usuarioSalvo);
    carregarChamados(usuarioSalvo.id);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  async function carregarChamados(pacienteId) {
    try {
      const response = await fetch(`http://localhost:3001/api/atendimentos/paciente/${pacienteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setChamados(data);
      }
    } catch (err) {
      console.error('Erro ao buscar solicitações:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!mensagemInicial.trim()) {
      setNotificacao({ tipo: 'erro', msg: 'Por favor, descreva o seu problema ou dúvida.' });
      return;
    }

    setEnviando(true);
    setNotificacao({ tipo: '', msg: '' });

    try {
      const response = await fetch('http://localhost:3001/api/atendimentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          mensagem: mensagemInicial,
          iniciado_por: 'voluntario'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNotificacao({ tipo: 'sucesso', msg: 'Solicitação enviada com sucesso! Um profissional atenderá você em breve.' });
        setMensagemInicial('');
        carregarChamados(usuario.id);
      } else {
        setNotificacao({ tipo: 'erro', msg: data.error || 'Erro ao enviar solicitação.' });
      }
    } catch (err) {
      console.error('Erro ao conectar ao servidor:', err);
      setNotificacao({ tipo: 'erro', msg: 'Não foi possível se conectar ao servidor.' });
    } finally {
      setEnviando(false);
    }
  }

  // 🔍 Lógica do Filtro
  const chamadosFiltrados = chamados.filter((item) => {
    if (filtroStatus === 'abertos') {
      return item.status === 'aguardando_voluntario' || item.status === 'com_voluntario';
    }
    if (filtroStatus === 'encerrados') {
      return item.status === 'encerrada';
    }
    return true; // 'todos'
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'aguardando_voluntario':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> Aguardando
          </span>
        );
      case 'com_voluntario':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <MessageSquare className="w-3 h-3" /> Em Atendimento
          </span>
        );
      case 'encerrada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Finalizada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-semibold text-sm">
        Carregando painel de atendimento...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 container mx-auto max-w-5xl px-4 py-10">
        
        {/* Cabeçalho */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#34a094] p-3 rounded-2xl text-white shadow-md">
              <Headphones className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                Atendimento Especializado
              </h1>
              <p className="text-slate-500 text-sm md:text-base">
                Solicite suporte e tire suas dúvidas diretamente com fonoaudiólogos
              </p>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm rounded-xl transition-colors border border-red-200/60"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA 1: FORMULÁRIO */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#34a094]" />
                Nova Solicitação de Atendimento
              </h2>
              <p className="text-slate-500 text-xs md:text-sm mb-6">
                Descreva detalhadamente o que você está sentindo ou o problema com o seu aparelho auditivo.
              </p>

              {notificacao.msg && (
                <div
                  className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                    notificacao.tipo === 'sucesso'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {notificacao.tipo === 'sucesso' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  {notificacao.msg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                    Descrição da Dúvida / Sinal / Sintoma
                  </label>
                  <textarea
                    rows={5}
                    value={mensagemInicial}
                    onChange={(e) => setMensagemInicial(e.target.value)}
                    placeholder="Ex: Meu aparelho auditivo está apitando bastante quando coloco no ouvido esquerdo, ou gostaria de ajustar o volume..."
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a094]/40 focus:border-[#34a094] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full sm:w-auto px-6 py-3 bg-[#34a094] hover:bg-[#2b8379] text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {enviando ? 'Enviando...' : 'Solicitar Atendimento'}
                </button>
              </form>
            </div>
          </div>

          {/* COLUNA 2: PERFIL + MEUS ATENDIMENTOS (COM FILTRO) */}
          <div className="space-y-6">
            
            {/* PERFIL */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#34a094]/10 text-[#34a094] rounded-full">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {usuario.nome || 'Usuário'}
                  </h2>
                  <p className="text-xs text-slate-500 truncate max-w-[180px]">{usuario.email}</p>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-[#34a094]" /> Perfil:
                </span>
                <span className="capitalize font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {usuario.tipo === 'fonoaudiologo' 
                    ? 'Fonoaudiólogo(a)' 
                    : usuario.tipo === 'estagiario' 
                    ? 'Estagiário(a)' 
                    : 'Paciente'}
                </span>
              </div>
            </div>

            {/* LISTA DE CHAMADOS COM FILTRO */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#34a094]" />
                  Meus Chamados
                </h2>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {chamadosFiltrados.length}
                </span>
              </div>

              {/* 🎛️ BARRINHA DE FILTROS */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                <button
                  onClick={() => setFiltroStatus('todos')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    filtroStatus === 'todos' ? 'bg-white text-[#34a094] shadow-sm' : 'hover:text-slate-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroStatus('abertos')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    filtroStatus === 'abertos' ? 'bg-white text-[#34a094] shadow-sm' : 'hover:text-slate-900'
                  }`}
                >
                  Abertos
                </button>
                <button
                  onClick={() => setFiltroStatus('encerrados')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    filtroStatus === 'encerrados' ? 'bg-white text-[#34a094] shadow-sm' : 'hover:text-slate-900'
                  }`}
                >
                  Finalizados
                </button>
              </div>

              {loading ? (
                <p className="text-xs text-slate-400 text-center py-6">Carregando seus chamados...</p>
              ) : chamadosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <XCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">
                    {filtroStatus === 'todos'
                      ? 'Nenhuma solicitação aberta no momento.'
                      : `Nenhum chamado no filtro "${filtroStatus}".`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chamadosFiltrados.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => item.status !== 'encerrada' && navigate(`/chat/${item.id}`)}
                      className={`p-4 rounded-xl border border-slate-100 bg-slate-50/60 transition-all space-y-2 ${
                        item.status !== 'encerrada' ? 'hover:bg-slate-100/80 cursor-pointer group' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {getStatusBadge(item.status)}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.criado_em).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      {item.primeira_mensagem && (
                        <p className="text-xs text-slate-600 line-clamp-2 italic">
                          "{item.primeira_mensagem}"
                        </p>
                      )}

                      {item.status !== 'encerrada' && (
                        <div className="flex items-center justify-end text-[11px] font-bold text-[#34a094] opacity-80 group-hover:opacity-100 pt-1">
                          Abrir conversa <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}