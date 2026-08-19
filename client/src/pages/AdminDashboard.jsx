import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck, Headphones, CheckCircle2, Search, LogOut, Award, AlertCircle, XCircle, UserCheck, Star, Eye, EyeOff, X, UserCog, Mail, Calendar, HelpCircle, Pencil, Trash2, Plus, TrendingUp } from 'lucide-react';
import GraficoLinha from '../components/GraficoLinha';
import { API_URL } from '../config';

const LABEL_ACAO_AUDITORIA = {
  aprovar_voluntario: 'Aprovou voluntário',
  rejeitar_voluntario: 'Recusou voluntário',
  tornar_admin: 'Promoveu a admin',
  liberar_avaliacao: 'Liberou avaliação',
  ocultar_avaliacao: 'Ocultou avaliação',
  criar_categoria_faq: 'Criou categoria de FAQ',
  renomear_categoria_faq: 'Renomeou categoria de FAQ',
  apagar_categoria_faq: 'Apagou categoria de FAQ',
  criar_pergunta_faq: 'Criou pergunta de FAQ',
  editar_pergunta_faq: 'Editou pergunta de FAQ',
  apagar_pergunta_faq: 'Apagou pergunta de FAQ',
};

const ABAS_VALIDAS = ['voluntarios', 'chamados', 'avaliacoes', 'usuarios', 'faq', 'auditoria'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [admin, setAdmin] = useState(null);
  // Permite deep-link direto pra uma aba (ex: /paineladmin?aba=chamados,
  // usado pelo botão "Atendimentos" do menu quando quem está logado é admin)
  const abaInicial = ABAS_VALIDAS.includes(searchParams.get('aba')) ? searchParams.get('aba') : 'voluntarios';
  const [abaAtiva, setAbaAtiva] = useState(abaInicial); // 'voluntarios' | 'chamados' | 'avaliacoes' | 'usuarios' | 'faq' | 'auditoria'
  const [filtroBusca, setFiltroBusca] = useState('');

  const [voluntariosPendentes, setVoluntariosPendentes] = useState([]);
  const [todosChamados, setTodosChamados] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [metricas, setMetricas] = useState({
    totalAtendimentos: 0,
    voluntariosAtivos: 0,
    satisfacaoMedia: '0.0'
  });
  const [loading, setLoading] = useState(true);

  const [modalRejeicao, setModalRejeicao] = useState(null); // { id, nome } | null
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [enviandoRejeicao, setEnviandoRejeicao] = useState(false);

  const [usuarios, setUsuarios] = useState([]);
  const [serieTemporal, setSerieTemporal] = useState([]);
  const [logsAuditoria, setLogsAuditoria] = useState([]);

  const [faqCategorias, setFaqCategorias] = useState([]);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  const [categoriaRenomeando, setCategoriaRenomeando] = useState(null); // { id, nome } | null
  const [categoriaComFormNovaPergunta, setCategoriaComFormNovaPergunta] = useState(null); // categoria id | null
  const [novoItemForm, setNovoItemForm] = useState({ titulo: '', descricao: '', resposta: '' });
  const [itemEditandoId, setItemEditandoId] = useState(null);
  const [itemEditForm, setItemEditForm] = useState({ titulo: '', descricao: '', resposta: '' });

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

      const [resPendentes, resChamados, resMetricas, resAvaliacoes, resUsuarios, resSerie, resFaq, resLogs] = await Promise.all([
        fetch(`${API_URL}/api/admin/voluntarios/pendentes`, { headers }),
        fetch(`${API_URL}/api/atendimentos`, { headers }),
        fetch(`${API_URL}/api/admin/metricas`, { headers }),
        fetch(`${API_URL}/api/admin/avaliacoes`, { headers }),
        fetch(`${API_URL}/api/admin/usuarios`, { headers }),
        fetch(`${API_URL}/api/admin/metricas/serie`, { headers }),
        fetch(`${API_URL}/api/faq`),
        fetch(`${API_URL}/api/admin/logs`, { headers }),
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

      if (resAvaliacoes.ok) {
        setAvaliacoes(await resAvaliacoes.json());
      }

      if (resUsuarios.ok) {
        setUsuarios(await resUsuarios.json());
      }

      if (resSerie.ok) {
        setSerieTemporal(await resSerie.json());
      }

      if (resFaq.ok) {
        setFaqCategorias(await resFaq.json());
      }

      if (resLogs.ok) {
        setLogsAuditoria(await resLogs.json());
      }
    } catch (err) {
      console.error('Erro ao carregar dados do painel administrativo:', err);
    } finally {
      setLoading(false);
    }
  }

  async function carregarFaq() {
    try {
      const res = await fetch(`${API_URL}/api/faq`);
      if (res.ok) setFaqCategorias(await res.json());
    } catch (err) {
      console.error('Erro ao recarregar FAQ:', err);
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAprovarVoluntario = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/voluntarios/${id}/aprovar`, {
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

  const handleConfirmarRejeicao = async (e) => {
    e.preventDefault();
    if (!motivoRejeicao.trim() || !modalRejeicao) return;

    setEnviandoRejeicao(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/voluntarios/${modalRejeicao.id}/rejeitar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ motivo: motivoRejeicao.trim() })
      });

      if (response.ok) {
        setVoluntariosPendentes(prev => prev.filter(v => v.id !== modalRejeicao.id));
        setModalRejeicao(null);
        setMotivoRejeicao('');
      } else {
        const data = await response.json();
        alert(data.error || 'Não foi possível recusar este cadastro.');
      }
    } catch (err) {
      console.error('Erro ao recusar voluntário:', err);
      alert('Não foi possível se conectar ao servidor.');
    } finally {
      setEnviandoRejeicao(false);
    }
  };

  const handleAlternarLiberacao = async (sessaoId, liberarAgora) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/avaliacoes/${sessaoId}/${liberarAgora ? 'liberar' : 'ocultar'}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        setAvaliacoes(prev => prev.map(a => (a.sessao_id === sessaoId ? { ...a, liberado: liberarAgora } : a)));
      } else {
        const data = await response.json();
        alert(data.error || 'Não foi possível atualizar a visibilidade da avaliação.');
      }
    } catch (err) {
      console.error('Erro ao atualizar avaliação:', err);
      alert('Não foi possível se conectar ao servidor.');
    }
  };

  const [limpandoUploads, setLimpandoUploads] = useState(false);

  const handleLimparUploadsOrfaos = async () => {
    if (!window.confirm('Procurar e apagar arquivos em /uploads que não pertencem a nenhuma mensagem? Essa ação não pode ser desfeita.')) return;

    setLimpandoUploads(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/manutencao/limpar-uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.removidos === 0 ? 'Nenhum arquivo órfão encontrado.' : `${data.removidos} arquivo(s) órfão(s) removido(s).`);
        carregarDados();
      } else {
        alert(data.error || 'Não foi possível limpar os arquivos.');
      }
    } catch (err) {
      console.error('Erro ao limpar uploads órfãos:', err);
      alert('Não foi possível se conectar ao servidor.');
    } finally {
      setLimpandoUploads(false);
    }
  };

  const handleTornarAdmin = async (id, nome) => {
    if (!window.confirm(`Tornar "${nome}" um administrador? Essa pessoa passará a ter acesso total ao painel administrativo.`)) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/usuarios/${id}/tornar-admin`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setUsuarios(prev => prev.map(u => (u.id === id ? { ...u, tipo: 'admin' } : u)));
      } else {
        const data = await response.json();
        alert(data.error || 'Não foi possível tornar este usuário administrador.');
      }
    } catch (err) {
      console.error('Erro ao tornar usuário admin:', err);
      alert('Não foi possível se conectar ao servidor.');
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '—';
    const data = new Date(dataString);
    return isNaN(data.getTime()) ? '—' : data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatarDataHora = (dataString) => {
    if (!dataString) return '—';
    const data = new Date(dataString);
    return isNaN(data.getTime()) ? '—' : data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  // ---------- FAQ: categorias ----------
  const handleCriarCategoria = async (e) => {
    e.preventDefault();
    if (!novaCategoriaNome.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/faq/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ nome: novaCategoriaNome.trim() })
      });

      if (response.ok) {
        setNovaCategoriaNome('');
        await carregarFaq();
      } else {
        const data = await response.json();
        alert(data.error || 'Não foi possível criar a categoria.');
      }
    } catch (err) {
      alert('Não foi possível se conectar ao servidor.');
    }
  };

  const handleRenomearCategoria = async (e) => {
    e.preventDefault();
    if (!categoriaRenomeando?.nome.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/faq/categorias/${categoriaRenomeando.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ nome: categoriaRenomeando.nome.trim() })
      });

      if (response.ok) {
        setCategoriaRenomeando(null);
        await carregarFaq();
      } else {
        const data = await response.json();
        alert(data.error || 'Não foi possível renomear a categoria.');
      }
    } catch (err) {
      alert('Não foi possível se conectar ao servidor.');
    }
  };

  const handleApagarCategoria = async (id, nome) => {
    if (!window.confirm(`Apagar a categoria "${nome}" e TODAS as perguntas dela? Essa ação não pode ser desfeita.`)) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/faq/categorias/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await carregarFaq();
      } else {
        const data = await response.json();
        alert(data.error || 'Não foi possível apagar a categoria.');
      }
    } catch (err) {
      alert('Não foi possível se conectar ao servidor.');
    }
  };

  // ---------- FAQ: perguntas ----------
  const handleCriarItem = async (e, categoriaId) => {
    e.preventDefault();
    if (!novoItemForm.titulo.trim() || !novoItemForm.resposta.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/faq/itens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ categoria_id: categoriaId, ...novoItemForm })
      });

      if (response.ok) {
        setNovoItemForm({ titulo: '', descricao: '', resposta: '' });
        setCategoriaComFormNovaPergunta(null);
        await carregarFaq();
      } else {
        const data = await response.json();
        alert(data.error || 'Não foi possível criar a pergunta.');
      }
    } catch (err) {
      alert('Não foi possível se conectar ao servidor.');
    }
  };

  const handleSalvarEdicaoItem = async (e, itemId) => {
    e.preventDefault();
    if (!itemEditForm.titulo.trim() || !itemEditForm.resposta.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/faq/itens/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(itemEditForm)
      });

      if (response.ok) {
        setItemEditandoId(null);
        await carregarFaq();
      } else {
        const data = await response.json();
        alert(data.error || 'Não foi possível salvar a pergunta.');
      }
    } catch (err) {
      alert('Não foi possível se conectar ao servidor.');
    }
  };

  const handleApagarItem = async (id, titulo) => {
    if (!window.confirm(`Apagar a pergunta "${titulo}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/faq/itens/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await carregarFaq();
      } else {
        const data = await response.json();
        alert(data.error || 'Não foi possível apagar a pergunta.');
      }
    } catch (err) {
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

        {/* EVOLUÇÃO — ÚLTIMOS 30 DIAS */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Evolução (últimos 30 dias)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GraficoLinha
              titulo="Atendimentos criados"
              subtitulo="Chamados abertos por dia"
              dados={serieTemporal}
              campo="atendimentos"
              cor="#0d9488"
            />
            <GraficoLinha
              titulo="Novos cadastros"
              subtitulo="Contas criadas por dia (todos os perfis)"
              dados={serieTemporal}
              campo="cadastros"
              cor="#7c3aed"
            />
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

              <button
                onClick={() => setAbaAtiva('avaliacoes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  abaAtiva === 'avaliacoes'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Avaliações ({avaliacoes.length})
              </button>

              <button
                onClick={() => setAbaAtiva('usuarios')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  abaAtiva === 'usuarios'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Usuários ({usuarios.length})
              </button>

              <button
                onClick={() => setAbaAtiva('faq')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  abaAtiva === 'faq'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                FAQ ({faqCategorias.reduce((acc, c) => acc + c.items.length, 0)})
              </button>

              <button
                onClick={() => setAbaAtiva('auditoria')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  abaAtiva === 'auditoria'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Auditoria ({logsAuditoria.length})
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
                            onClick={() => { setModalRejeicao(vol); setMotivoRejeicao(''); }}
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

          {/* ABA 3: MODERAÇÃO DE AVALIAÇÕES */}
          {abaAtiva === 'avaliacoes' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800">Avaliações dos Atendimentos</h2>
              <p className="text-xs text-slate-500 -mt-2">
                Por padrão nenhuma avaliação fica visível pro paciente ou pro fono — libere quando revisar.
                Nada aqui é apagado, só fica visível ou oculto.
              </p>

              {loading ? (
                <div className="text-center py-12 text-slate-400 text-xs">Carregando avaliações...</div>
              ) : avaliacoes.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhuma avaliação registrada no sistema até o momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {avaliacoes
                    .filter(a =>
                      a.paciente_nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
                      (a.voluntario_nome || '').toLowerCase().includes(filtroBusca.toLowerCase())
                    )
                    .map((a) => (
                      <div key={a.sessao_id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-slate-500">Paciente</p>
                            <p className="font-bold text-sm text-slate-800">{a.paciente_nome}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Fonoaudiólogo</p>
                            <p className="font-bold text-sm text-slate-800">{a.voluntario_nome || '—'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={`w-4 h-4 ${n <= a.nota_fono ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                          <span className="text-[11px] text-slate-400 ml-1 capitalize">· site {a.facilidade_site}</span>
                        </div>

                        {a.comentario && (
                          <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200/80">
                            "{a.comentario}"
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            a.liberado
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {a.liberado ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {a.liberado ? 'Liberada' : 'Oculta'}
                          </span>

                          {a.liberado ? (
                            <button
                              onClick={() => handleAlternarLiberacao(a.sessao_id, false)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                            >
                              <EyeOff className="w-3.5 h-3.5" /> Ocultar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAlternarLiberacao(a.sessao_id, true)}
                              className="px-3 py-1.5 bg-[#34a094] hover:bg-[#2b8379] text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" /> Liberar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 4: TODOS OS USUÁRIOS (busca + promover a admin) */}
          {abaAtiva === 'usuarios' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800">Todos os Usuários da Plataforma</h2>

              {loading ? (
                <div className="text-center py-12 text-slate-400 text-xs">Carregando usuários...</div>
              ) : usuarios.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">Nenhum usuário cadastrado até o momento.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="py-3 px-2">ID</th>
                        <th className="py-3 px-2">Nome</th>
                        <th className="py-3 px-2">E-mail</th>
                        <th className="py-3 px-2">Perfil</th>
                        <th className="py-3 px-2">Cadastrado em</th>
                        <th className="py-3 px-2 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usuarios
                        .filter(u =>
                          u.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
                          u.email.toLowerCase().includes(filtroBusca.toLowerCase())
                        )
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-2 font-mono font-bold text-slate-400">#{u.id}</td>
                            <td className="py-3 px-2 font-bold text-slate-800">
                              <span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-[#34a094]" /> {u.nome}</span>
                            </td>
                            <td className="py-3 px-2 text-slate-600">
                              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}</span>
                            </td>
                            <td className="py-3 px-2">
                              <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-100 text-slate-700 border-slate-200">
                                {u.tipo}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <span className="flex items-center gap-1.5 text-slate-500"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatarData(u.criado_em)}</span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              {u.tipo !== 'admin' && (
                                <button
                                  onClick={() => handleTornarAdmin(u.id, u.nome)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold transition-colors"
                                >
                                  <UserCog className="w-3.5 h-3.5" /> Tornar Admin
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ABA 5: GESTÃO DE FAQ (público em /duvidas) */}
          {abaAtiva === 'faq' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Perguntas Frequentes</h2>
                <p className="text-xs text-slate-500 mt-0.5">Esse conteúdo aparece direto na página pública /duvidas — as alterações são imediatas.</p>
              </div>

              <form onSubmit={handleCriarCategoria} className="flex gap-2">
                <input
                  type="text"
                  value={novaCategoriaNome}
                  onChange={(e) => setNovaCategoriaNome(e.target.value)}
                  placeholder="Nome da nova categoria (ex: Garantia e assistência técnica)"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={!novaCategoriaNome.trim()}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Categoria
                </button>
              </form>

              {faqCategorias.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">Nenhuma categoria cadastrada ainda.</div>
              ) : (
                <div className="space-y-4">
                  {faqCategorias.map((cat) => (
                    <div key={cat.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {categoriaRenomeando?.id === cat.id ? (
                          <form onSubmit={handleRenomearCategoria} className="flex flex-1 gap-2">
                            <input
                              autoFocus
                              type="text"
                              value={categoriaRenomeando.nome}
                              onChange={(e) => setCategoriaRenomeando((c) => ({ ...c, nome: e.target.value }))}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                            />
                            <button type="submit" className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold">Salvar</button>
                            <button type="button" onClick={() => setCategoriaRenomeando(null)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold">Cancelar</button>
                          </form>
                        ) : (
                          <>
                            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-purple-600" /> {cat.category}
                              <span className="text-[10px] font-semibold text-slate-400">({cat.items.length})</span>
                            </h3>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setCategoriaRenomeando({ id: cat.id, nome: cat.category })}
                                aria-label={`Renomear categoria ${cat.category}`}
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleApagarCategoria(cat.id, cat.category)}
                                aria-label={`Apagar categoria ${cat.category}`}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-2">
                        {cat.items.map((item) => (
                          itemEditandoId === item.id ? (
                            <form
                              key={item.id}
                              onSubmit={(e) => handleSalvarEdicaoItem(e, item.id)}
                              className="p-3 bg-white rounded-xl border border-purple-200 space-y-2"
                            >
                              <input
                                required
                                type="text"
                                value={itemEditForm.titulo}
                                onChange={(e) => setItemEditForm((f) => ({ ...f, titulo: e.target.value }))}
                                placeholder="Título da pergunta"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                              />
                              <input
                                type="text"
                                value={itemEditForm.descricao}
                                onChange={(e) => setItemEditForm((f) => ({ ...f, descricao: e.target.value }))}
                                placeholder="Descrição curta (opcional)"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                              />
                              <textarea
                                required
                                rows={3}
                                value={itemEditForm.resposta}
                                onChange={(e) => setItemEditForm((f) => ({ ...f, resposta: e.target.value }))}
                                placeholder="Resposta completa"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
                              />
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setItemEditandoId(null)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold">Cancelar</button>
                                <button type="submit" className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold">Salvar</button>
                              </div>
                            </form>
                          ) : (
                            <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-xs text-slate-800">{item.title}</p>
                                {item.description && <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => {
                                    setItemEditandoId(item.id);
                                    setItemEditForm({ titulo: item.title, descricao: item.description || '', resposta: item.answer });
                                  }}
                                  aria-label={`Editar pergunta ${item.title}`}
                                  className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleApagarItem(item.id, item.title)}
                                  aria-label={`Apagar pergunta ${item.title}`}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )
                        ))}
                      </div>

                      {categoriaComFormNovaPergunta === cat.id ? (
                        <form onSubmit={(e) => handleCriarItem(e, cat.id)} className="mt-3 p-3 bg-white rounded-xl border border-purple-200 space-y-2">
                          <input
                            autoFocus
                            required
                            type="text"
                            value={novoItemForm.titulo}
                            onChange={(e) => setNovoItemForm((f) => ({ ...f, titulo: e.target.value }))}
                            placeholder="Título da pergunta"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                          />
                          <input
                            type="text"
                            value={novoItemForm.descricao}
                            onChange={(e) => setNovoItemForm((f) => ({ ...f, descricao: e.target.value }))}
                            placeholder="Descrição curta (opcional)"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                          />
                          <textarea
                            required
                            rows={3}
                            value={novoItemForm.resposta}
                            onChange={(e) => setNovoItemForm((f) => ({ ...f, resposta: e.target.value }))}
                            placeholder="Resposta completa"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setCategoriaComFormNovaPergunta(null)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold">Cancelar</button>
                            <button type="submit" className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold">Adicionar</button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setCategoriaComFormNovaPergunta(cat.id);
                            setNovoItemForm({ titulo: '', descricao: '', resposta: '' });
                          }}
                          className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-purple-600 hover:underline"
                        >
                          <Plus className="w-3.5 h-3.5" /> Nova pergunta nesta categoria
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 6: LOG DE AUDITORIA */}
          {abaAtiva === 'auditoria' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Log de Auditoria</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Últimas 200 ações administrativas de maior impacto — quem fez o quê e quando.</p>
                </div>
                <button
                  onClick={handleLimparUploadsOrfaos}
                  disabled={limpandoUploads}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shrink-0"
                >
                  {limpandoUploads ? 'Limpando...' : 'Limpar arquivos órfãos em /uploads'}
                </button>
              </div>

              {logsAuditoria.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">Nenhuma ação registrada ainda.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="py-3 px-2">Quando</th>
                        <th className="py-3 px-2">Admin</th>
                        <th className="py-3 px-2">Ação</th>
                        <th className="py-3 px-2">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logsAuditoria
                        .filter((l) =>
                          l.admin_nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
                          (LABEL_ACAO_AUDITORIA[l.acao] || l.acao).toLowerCase().includes(filtroBusca.toLowerCase())
                        )
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-2 font-mono text-slate-400 whitespace-nowrap">{formatarDataHora(log.criado_em)}</td>
                            <td className="py-3 px-2 font-bold text-slate-800 whitespace-nowrap">{log.admin_nome}</td>
                            <td className="py-3 px-2 text-slate-700 whitespace-nowrap">{LABEL_ACAO_AUDITORIA[log.acao] || log.acao}</td>
                            <td className="py-3 px-2 text-slate-500">{log.detalhes || '—'}</td>
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

      {/* MODAL: MOTIVO DA RECUSA */}
      {modalRejeicao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="rejeicao-modal-title" className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setModalRejeicao(null)}
              aria-label="Fechar"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 id="rejeicao-modal-title" className="text-lg font-bold text-slate-900 pr-6">
              Recusar cadastro de {modalRejeicao.nome}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Esse motivo fica visível pra pessoa no perfil dela — ajuda a entender o que corrigir.
            </p>

            <form onSubmit={handleConfirmarRejeicao} className="mt-4 space-y-4">
              <textarea
                rows={4}
                required
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Ex: Não foi possível confirmar o registro CRFa informado. Verifique o número e tente novamente."
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalRejeicao(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviandoRejeicao || !motivoRejeicao.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> {enviandoRejeicao ? 'Recusando...' : 'Confirmar recusa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}