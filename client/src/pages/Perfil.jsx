import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { User, Mail, Shield, Calendar, Ear, CreditCard, LogOut, FileText, Pencil, X, Save, Clock, XCircle, Download, Trash2 } from 'lucide-react';
import FeedbackBanner from '../components/FeedbackBanner';
import { API_URL } from '../config';

const CAMPOS_VAZIOS = {
  nome: '',
  email: '',
  cartao_sus: '',
  data_nascimento: '',
  modelo_aparelho: '',
  lado_aparelho: 'bilateral',
  registro_profissional: '',
  instituicao: '',
  bio: '',
  especialidade: ''
};

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState(CAMPOS_VAZIOS);
  const [feedback, setFeedback] = useState({ tipo: '', mensagem: '' });
  const [exportando, setExportando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioSalvo = JSON.parse(localStorage.getItem('usuario') || 'null');

    if (!usuarioSalvo) {
      navigate('/login');
      return;
    }

    carregarPerfil();
  }, [navigate]);

  async function carregarPerfil() {
    try {
      const response = await fetch(`${API_URL}/api/perfil`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) {
        throw new Error('Não foi possível carregar seu perfil.');
      }

      const data = await response.json();
      setUsuario(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setFeedback({ tipo: 'erro', mensagem: 'Não foi possível carregar seu perfil.' });
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleExportarDados = async () => {
    setExportando(true);
    try {
      const response = await fetch(`${API_URL}/api/perfil/exportar`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Não foi possível gerar seus dados.');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'meus-dados-ajudaaudio.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setFeedback({ tipo: 'erro', mensagem: err.message || 'Erro ao baixar seus dados.' });
    } finally {
      setExportando(false);
    }
  };

  const handleExcluirConta = async () => {
    if (!window.confirm('Tem certeza que quer excluir sua conta? Seu nome, e-mail e dados de cadastro serão removidos do sistema. Essa ação não pode ser desfeita.')) return;

    setExcluindo(true);
    try {
      const response = await fetch(`${API_URL}/api/perfil`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Não foi possível excluir sua conta.');

      localStorage.clear();
      navigate('/');
    } catch (err) {
      setFeedback({ tipo: 'erro', mensagem: err.message || 'Erro ao excluir sua conta.' });
      setExcluindo(false);
    }
  };

  const iniciarEdicao = () => {
    setFormData({
      nome: usuario.nome || '',
      email: usuario.email || '',
      cartao_sus: usuario.cartao_sus || '',
      data_nascimento: usuario.data_nascimento ? usuario.data_nascimento.slice(0, 10) : '',
      modelo_aparelho: usuario.modelo_aparelho || '',
      lado_aparelho: usuario.lado_aparelho || 'bilateral',
      registro_profissional: usuario.registro_profissional || '',
      instituicao: usuario.instituicao || '',
      bio: usuario.bio || '',
      especialidade: usuario.especialidade || ''
    });
    setFeedback({ tipo: '', mensagem: '' });
    setEditando(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setFeedback({ tipo: '', mensagem: '' });

    try {
      const response = await fetch(`${API_URL}/api/perfil`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar perfil.');
      }

      setUsuario(data);

      // Mantém nome/e-mail exibidos no Header/localStorage em sincronia
      const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || '{}');
      localStorage.setItem('usuario', JSON.stringify({ ...usuarioLocal, nome: data.nome, email: data.email }));

      setEditando(false);
      setFeedback(
        data.reaprovacaoNecessaria
          ? { tipo: 'aviso', mensagem: 'Registro profissional atualizado. Como você já estava aprovado(a), seu cadastro voltou para análise do administrador antes de poder atender novamente.' }
          : { tipo: 'sucesso', mensagem: 'Perfil atualizado com sucesso!' }
      );
    } catch (err) {
      setFeedback({ tipo: 'erro', mensagem: err.message });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-semibold text-sm">
        Carregando seu perfil...
      </div>
    );
  }

  if (!usuario) return null;

  const tipoUsuario = (usuario.tipo || 'paciente').toLowerCase();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 container mx-auto max-w-3xl px-4 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Cabeçalho do Card */}
          <div className="bg-slate-900 text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#34a094] flex items-center justify-center text-white text-2xl font-black shadow-inner">
                {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">{usuario.nome}</h1>
                <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                  <Mail className="w-4 h-4 text-[#34a094]" />
                  {usuario.email}
                </p>
              </div>
            </div>

            <span className="uppercase tracking-wider text-xs font-bold px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[#34a094]">
              {tipoUsuario}
            </span>
          </div>

          <div className="p-8 space-y-6">
            {(tipoUsuario === 'fonoaudiologo' || tipoUsuario === 'estagiario') && usuario.status_aprovacao === 'rejeitado' && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-red-800">Cadastro não aprovado</p>
                  <p className="text-sm text-red-700 mt-0.5">
                    {usuario.motivo_rejeicao || 'Nenhum motivo foi registrado. Fale com a administração para mais detalhes.'}
                  </p>
                  <p className="text-xs text-red-600/80 mt-1.5">Se quiser corrigir algo e pedir uma nova análise, entre em contato com a administração.</p>
                </div>
              </div>
            )}

            {(tipoUsuario === 'fonoaudiologo' || tipoUsuario === 'estagiario') && usuario.status_aprovacao === 'pendente' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-amber-800">Cadastro em análise</p>
                  <p className="text-sm text-amber-700 mt-0.5">Um administrador ainda vai validar seu registro profissional antes de você poder atender pacientes.</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-[#34a094]" />
                {editando ? 'Editar Cadastro' : 'Informações do Cadastro'}
              </h2>

              {!editando && (
                <button
                  onClick={iniciarEdicao}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#34a094]/10 hover:bg-[#34a094]/20 text-[#34a094] font-bold text-xs transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
              )}
            </div>

            <FeedbackBanner tipo={feedback.tipo} mensagem={feedback.mensagem} />

            {editando ? (
              <form onSubmit={handleSalvar} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Nome Completo</label>
                  <input
                    type="text"
                    name="nome"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a094]/40 focus:border-[#34a094]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a094]/40 focus:border-[#34a094]"
                  />
                  <p className="text-xs text-slate-400 mt-1">É esse e-mail que você usa pra entrar na sua conta.</p>
                </div>

                {tipoUsuario === 'paciente' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Cartão SUS</label>
                      <input
                        type="text"
                        name="cartao_sus"
                        value={formData.cartao_sus}
                        onChange={handleChange}
                        placeholder="000 0000 0000 0000"
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a094]/40 focus:border-[#34a094]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Data de Nascimento</label>
                      <input
                        type="date"
                        name="data_nascimento"
                        value={formData.data_nascimento}
                        onChange={handleChange}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a094]/40 focus:border-[#34a094]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Modelo do Aparelho</label>
                      <input
                        type="text"
                        name="modelo_aparelho"
                        value={formData.modelo_aparelho}
                        onChange={handleChange}
                        placeholder="Ex: Phonak Marvel"
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a094]/40 focus:border-[#34a094]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Lado do Uso</label>
                      <select
                        name="lado_aparelho"
                        value={formData.lado_aparelho}
                        onChange={handleChange}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#34a094]/40 focus:border-[#34a094]"
                      >
                        <option value="bilateral">Bilateral (Ambos os ouvidos)</option>
                        <option value="direito">Ouvido Direito</option>
                        <option value="esquerdo">Ouvido Esquerdo</option>
                      </select>
                    </div>
                  </div>
                )}

                {(tipoUsuario === 'fonoaudiologo' || tipoUsuario === 'estagiario') && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                          {tipoUsuario === 'fonoaudiologo' ? 'Registro Profissional (CRFa)' : 'Comprovante / Matrícula'}
                        </label>
                        <input
                          type="text"
                          name="registro_profissional"
                          maxLength={50}
                          value={formData.registro_profissional}
                          onChange={handleChange}
                          className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a094]/40 focus:border-[#34a094]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Instituição / Universidade</label>
                        <input
                          type="text"
                          name="instituicao"
                          value={formData.instituicao}
                          onChange={handleChange}
                          className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a094]/40 focus:border-[#34a094]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Especialidade (opcional)</label>
                      <input
                        type="text"
                        name="especialidade"
                        maxLength={100}
                        value={formData.especialidade}
                        onChange={handleChange}
                        placeholder="Ex: Linguagem infantil, Voz, Motricidade orofacial..."
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a094]/40 focus:border-[#34a094]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Bio curta (opcional)</label>
                      <textarea
                        name="bio"
                        rows={3}
                        maxLength={500}
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Uma breve apresentação pra quem você for atender."
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a094]/40 focus:border-[#34a094] resize-none"
                      />
                    </div>

                    {usuario.status_aprovacao === 'aprovado' && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                        Se você mudar o registro profissional, seu cadastro volta para análise do administrador antes de poder atender novamente.
                      </p>
                    )}
                  </div>
                )}

                {tipoUsuario !== 'paciente' && tipoUsuario !== 'fonoaudiologo' && tipoUsuario !== 'estagiario' && (
                  <p className="text-xs text-slate-400">
                    Contas administrativas não possuem campos adicionais de cadastro.
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setEditando(false); setFeedback({ tipo: '', mensagem: '' }); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvando}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#34a094] hover:bg-[#2b8379] text-white font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {salvando ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Tipo de Conta
                  </span>
                  <p className="font-semibold text-slate-700 capitalize flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#34a094]" />
                    {tipoUsuario}
                  </p>
                </div>

                {usuario.data_nascimento && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Data de Nascimento
                    </span>
                    <p className="font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#34a094]" />
                      {new Date(usuario.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </p>
                  </div>
                )}

                {tipoUsuario === 'paciente' && (
                  <>
                    {usuario.cartao_sus && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Cartão SUS
                        </span>
                        <p className="font-semibold text-slate-700 flex items-center gap-2 font-mono">
                          <CreditCard className="w-4 h-4 text-[#34a094]" />
                          {usuario.cartao_sus}
                        </p>
                      </div>
                    )}

                    {usuario.modelo_aparelho && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Modelo do Aparelho
                        </span>
                        <p className="font-semibold text-slate-700 flex items-center gap-2">
                          <Ear className="w-4 h-4 text-[#34a094]" />
                          {usuario.modelo_aparelho} ({usuario.lado_aparelho || 'Bilateral'})
                        </p>
                      </div>
                    )}
                  </>
                )}

                {(tipoUsuario === 'fonoaudiologo' || tipoUsuario === 'estagiario') && (
                  <>
                    {usuario.registro_profissional && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Registro Profissional / CRFa
                        </span>
                        <p className="font-semibold text-slate-700 flex items-center gap-2 font-mono">
                          <FileText className="w-4 h-4 text-[#34a094]" />
                          {usuario.registro_profissional}
                        </p>
                      </div>
                    )}

                    {usuario.instituicao && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Instituição / Universidade
                        </span>
                        <p className="font-semibold text-slate-700">
                          {usuario.instituicao}
                        </p>
                      </div>
                    )}

                    {usuario.especialidade && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Especialidade
                        </span>
                        <p className="font-semibold text-slate-700">
                          {usuario.especialidade}
                        </p>
                      </div>
                    )}

                    {usuario.bio && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 md:col-span-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Bio
                        </span>
                        <p className="text-sm text-slate-700 whitespace-pre-line">
                          {usuario.bio}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {!editando && (
              <div className="pt-6 border-t border-slate-100 space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Meus dados (LGPD)</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleExportarDados}
                      disabled={exportando}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {exportando ? 'Gerando arquivo...' : 'Baixar meus dados'}
                    </button>
                    <button
                      onClick={handleExcluirConta}
                      disabled={excluindo}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors disabled:opacity-50 border border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {excluindo ? 'Excluindo...' : 'Excluir minha conta'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Excluir a conta remove seu nome, e-mail e dados de cadastro do sistema. Mensagens que já fazem parte de um atendimento continuam existindo (fazem parte do histórico de outra pessoa), mas deixam de te identificar.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da Conta
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
