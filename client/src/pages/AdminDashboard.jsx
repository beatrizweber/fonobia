import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck, Headphones, CheckCircle2, Search, LogOut, Award, AlertCircle, XCircle, UserCheck, Star } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('voluntarios'); // 'voluntarios' | 'chamados'
  const [filtroBusca, setFiltroBusca] = useState('');

  const [voluntariosPendentes, setVoluntariosPendentes] = useState([]);
  const [todosChamados, setTodosChamados] = useState([]);
  const [metricas, setMetricas] = useState({
    totalAtendimentos: 0,
    voluntariosAtivos: 0,
    satisfacaoMedia: '0.0'
  });
  const [loading, setLoading] = useState(true);

  // 🔒 Proteção de Rota Admin
  useEffect(() => {
    const usuarioSalvo = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!usuarioSalvo.id) {
      navigate('/login');
      return;
    }

    setAdmin(usuarioSalvo);
    carregarDados();
  }, [navigate]);

  async function carregarDados() {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

      const [resPendentes, resChamados, resMetricas] = await Promise.all([
        fetch('http://localhost:3001/api/admin/voluntarios/pendentes', { headers }),
        fetch('http://localhost:3001/api/atendimentos', { headers }),
        fetch('http://localhost:3001/api/admin/metricas', { headers }),
      ]);

      if (resPendentes.ok) {
        setVoluntariosPendentes(await resPendentes.json());
      }

      if (resChamados.ok) {
        const chamados = await resChamados.json();
        // A API usa "mensagem_inicial"; a tela exibe/filtra por "assunto"
        setTodosChamados(chamados.map(c => ({ ...c, assunto: c.mensagem_inicial })));
      }

      if (resMetricas.ok) {
        setMetricas(await resMetricas.json());
      }
    } catch (err) {
      console.error('Erro ao carregar dados do painel administrativo:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAprovarVoluntario = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/voluntarios/${id}/aprovar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        setVoluntariosPendentes(prev => prev.filter(v => v.id !== id));
        setMetricas(prev => ({ ...prev, voluntariosAtivos: prev.voluntariosAtivos + 1 }));
      } else {
        const data = await response.json();
        alert(data.error || 'Não foi possível aprovar este voluntário.');
      }
    } catch (err) {
      console.error('Erro ao aprovar voluntário:', err);
      alert('Não foi possível se conectar ao servidor.');
    }
  };

  const handleRejeitarVoluntario = async (id) => {
    if (!window.confirm('Tem certeza que deseja recusar este cadastro?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/voluntarios/${id}/rejeitar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        setVoluntariosPendentes(prev => prev.filter(v => v.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || 'Não foi possível recusar este cadastro.');
      }
    } catch (err) {
      console.error('Erro ao recusar voluntário:', err);
      alert('Não foi possível se conectar ao servidor.');
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-semibold text-sm">
        Carregando painel administrativo...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        
        {/* CABEÇALHO DO PAINEL ADMIN */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 p-3 rounded-2xl text-white shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                Painel do Administrador
              </h1>
              <p className="text-slate-500 text-sm">
                Gestão global da plataforma, aprovações e indicadores do sistema
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

        {/* CARDS DE MÉTRICAS GERAIS DA PLATAFORMA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Atendimentos</span>
              <Headphones className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-slate-800">{metricas.totalAtendimentos}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Chamados na plataforma</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Voluntários Ativos</span>
              <UserCheck className="w-5 h-5 text-[#34a094]" />
            </div>
            <p className="text-2xl font-black text-slate-800">{metricas.voluntariosAtivos}</p>
            <p className="text-[11px] text-slate-400 mt-1">Fonoaudiólogos liberados</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Aprovações Pendentes</span>
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-800">{voluntariosPendentes.length}</p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">Aguardando validação CRFa</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Satisfação Média</span>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-2xl font-black text-slate-800">{metricas.satisfacaoMedia} / 5.0</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Média de avaliações</p>
          </div>

        </div>

        {/* NAVEGAÇÃO DE SEÇÕES */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAbaAtiva('voluntarios')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  abaAtiva === 'voluntarios'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Aprovar Fonoaudiólogos ({voluntariosPendentes.length})
              </button>

              <button
                onClick={() => setAbaAtiva('chamados')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  abaAtiva === 'chamados'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos os Chamados ({todosChamados.length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                placeholder="Pesquisar registros..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
              />
            </div>

          </div>

          {/* ABA 1: APROVAÇÃO DE VOLUNTÁRIOS */}
          {abaAtiva === 'voluntarios' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800">Solicitações de Profissionais Fonoaudiólogos</h2>

              {loading ? (
                <div className="text-center py-12 text-slate-400 text-xs">Carregando solicitações...</div>
              ) : voluntariosPendentes.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                  Nenhum fonoaudiólogo pendente de aprovação no momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {voluntariosPendentes
                    .filter(v => v.nome.toLowerCase().includes(filtroBusca.toLowerCase()) || (v.crfa || '').toLowerCase().includes(filtroBusca.toLowerCase()))
                    .map((vol) => (
                      <div key={vol.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-slate-800">{vol.nome}</h3>
                          <p className="text-xs text-slate-500">{vol.email}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-[11px] font-bold flex items-center gap-1">
                              <Award className="w-3 h-3" /> {vol.crfa || 'Registro não informado'}
                            </span>
                            {vol.instituicao && (
                              <span className="text-[11px] text-slate-400">{vol.instituicao}</span>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200/60 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRejeitarVoluntario(vol.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Recusar
                          </button>
                          <button
                            onClick={() => handleAprovarVoluntario(vol.id)}
                            className="px-4 py-1.5 bg-[#34a094] hover:bg-[#2b8379] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar CRFa
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 2: MONITORAMENTO DE TODOS OS CHAMADOS */}
          {abaAtiva === 'chamados' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800">Histórico e Status de Atendimentos</h2>

              {loading ? (
                <div className="text-center py-12 text-slate-400 text-xs">Carregando chamados...</div>
              ) : todosChamados.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhum chamado registrado no sistema até o momento.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="py-3 px-2">ID</th>
                        <th className="py-3 px-2">Paciente</th>
                        <th className="py-3 px-2">Atendente</th>
                        <th className="py-3 px-2">Assunto</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {todosChamados
                        .filter(c => c.paciente_nome.toLowerCase().includes(filtroBusca.toLowerCase()) || (c.assunto || '').toLowerCase().includes(filtroBusca.toLowerCase()))
                        .map((chamado) => (
                          <tr key={chamado.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-2 font-mono font-bold text-slate-500">#{chamado.id}</td>
                            <td className="py-3 px-2 font-bold text-slate-800">{chamado.paciente_nome}</td>
                            <td className="py-3 px-2 text-slate-600">{chamado.voluntario_nome}</td>
                            <td className="py-3 px-2 text-slate-500 truncate max-w-xs">{chamado.assunto}</td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                chamado.status === 'encerrada'
                                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                                  : chamado.status === 'aguardando_voluntario'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-blue-50 text-blue-800 border-blue-200'
                              }`}>
                                {chamado.status === 'encerrada' ? 'Concluído' : chamado.status === 'aguardando_voluntario' ? 'Aguardando' : 'Em Atendimento'}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <button
                                onClick={() => navigate(`/chat/${chamado.id}`)}
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
                              >
                                Inspecionar
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}