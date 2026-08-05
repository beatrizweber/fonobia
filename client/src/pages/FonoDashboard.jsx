import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { UserCheck, Clock, MessageSquare, CheckCircle2, User, Award, ArrowRight, LogOut, Inbox, Search } from 'lucide-react';

export default function FonoDashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('pendentes'); // 'pendentes' | 'meus_atendimentos' | 'encerrados'
  const [filtroBusca, setFiltroBusca] = useState('');

  const [atendimentos, setAtendimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔒 Proteção de Rota
  useEffect(() => {
    const usuarioSalvo = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!usuarioSalvo.id) {
      navigate('/login');
      return;
    }

    setUsuario(usuarioSalvo);
    carregarFila();
  }, [navigate]);

  async function carregarFila() {
    try {
      const response = await fetch('http://localhost:3001/api/atendimentos/fila', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAtendimentos(data);
      }
    } catch (err) {
      console.error('Erro ao buscar fila de atendimentos:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Assumir atendimento e navegar para o chat
  const handleAssumirAtendimento = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/atendimentos/${id}/assumir`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Não foi possível assumir este atendimento.');
        await carregarFila();
        return;
      }

      navigate(`/chat/${id}`);
    } catch (err) {
      console.error('Erro ao assumir atendimento:', err);
      alert('Não foi possível se conectar ao servidor.');
    }
  };

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-semibold text-sm">
        Carregando painel do profissional...
      </div>
    );
  }

  // Contagem dinâmica para as métricas
  const pendentesCount = atendimentos.filter(a => a.status === 'aguardando_voluntario').length;
  const meusAtendimentosCount = atendimentos.filter(a => a.status === 'com_voluntario' && a.voluntario_id === usuario.id).length;
  const encerradosCount = atendimentos.filter(a => a.status === 'encerrada').length;

  // Filtragem da lista
  const atendimentosFiltrados = atendimentos.filter(item => {
    const bateuStatus = 
      abaAtiva === 'pendentes' ? item.status === 'aguardando_voluntario' :
      abaAtiva === 'meus_atendimentos' ? item.status === 'com_voluntario' && item.voluntario_id === usuario.id :
      item.status === 'encerrada';

    const bateuBusca = 
      item.paciente_nome?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      item.mensagem_inicial?.toLowerCase().includes(filtroBusca.toLowerCase());

    return bateuStatus && bateuBusca;
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        
        {/* CABEÇALHO DO PAINEL */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#34a094] p-3 rounded-2xl text-white shadow-md">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                Painel do Profissional
              </h1>
              <p className="text-slate-500 text-sm">
                Gerencie solicitações de pacientes e realize atendimentos voluntários
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

        {/* CARDS INDICADORES / FILTROS PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          
          {/* Card Perfil Fono */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#34a094]/10 text-[#34a094] rounded-full">
                <User className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h3 className="font-bold text-sm text-slate-800 truncate">{usuario.nome || 'Fonoaudiólogo'}</h3>
                <p className="text-xs text-slate-500 truncate">{usuario.email}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#34a094]" /> CRFa:
              </span>
              <span className="font-bold text-slate-800">{usuario.registro_profissional || 'Não informado'}</span>
            </div>
          </div>

          {/* Cards Selecionáveis */}
          <div 
            onClick={() => setAbaAtiva('pendentes')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all shadow-sm ${
              abaAtiva === 'pendentes' ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30' : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Fila de Espera</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-900">{pendentesCount}</p>
            <p className="text-[11px] text-amber-700 mt-1">Aguardando atendimento</p>
          </div>

          <div 
            onClick={() => setAbaAtiva('meus_atendimentos')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all shadow-sm ${
              abaAtiva === 'meus_atendimentos' ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/30' : 'bg-white border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Em Andamento</span>
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-blue-900">{meusAtendimentosCount}</p>
            <p className="text-[11px] text-blue-700 mt-1">Sob seus cuidados</p>
          </div>

          <div 
            onClick={() => setAbaAtiva('encerrados')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all shadow-sm ${
              abaAtiva === 'encerrados' ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/30' : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Concluídos</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-900">{encerradosCount}</p>
            <p className="text-[11px] text-emerald-700 mt-1">Atendimentos finalizados</p>
          </div>

        </div>

        {/* LISTA DE CHAMADOS E CAMPO DE BUSCA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            {/* Título dinâmico informando o filtro atual */}
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              {abaAtiva === 'pendentes' && <Clock className="w-5 h-5 text-amber-500" />}
              {abaAtiva === 'meus_atendimentos' && <MessageSquare className="w-5 h-5 text-blue-500" />}
              {abaAtiva === 'encerrados' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              
              {abaAtiva === 'pendentes' ? 'Fila de Espera' : abaAtiva === 'meus_atendimentos' ? 'Meus Atendimentos Ativos' : 'Atendimentos Concluídos'}
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
                {atendimentosFiltrados.length}
              </span>
            </h2>

            {/* Campo de Busca */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                placeholder="Buscar paciente ou assunto..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#34a094]/40 focus:border-[#34a094]"
              />
            </div>
          </div>

          {/* LISTA DE CARDS */}
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Carregando atendimentos...</div>
          ) : atendimentosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Inbox className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-sm font-semibold">Nenhum chamado encontrado nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {atendimentosFiltrados.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#34a094]" />
                        {item.paciente_nome}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(item.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 bg-white p-3 rounded-xl border border-slate-200/80 italic">
                      "{item.mensagem_inicial}"
                    </p>
                  </div>

                  {/* Ações do Botão */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Chamado #{item.id}
                    </span>

                    {item.status === 'aguardando_voluntario' && (
                      <button
                        onClick={() => handleAssumirAtendimento(item.id)}
                        className="px-4 py-2 bg-[#34a094] hover:bg-[#2b8379] text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        Assumir Atendimento <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {item.status === 'com_voluntario' && (
                      <button
                        onClick={() => navigate(`/chat/${item.id}`)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        Abrir Chat <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {item.status === 'encerrada' && (
                      <button
                        onClick={() => navigate(`/chat/${item.id}`)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        Ver Histórico <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}