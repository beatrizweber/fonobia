// client/src/pages/Cadastro.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_URL } from '../config';

// Pontuação simples (0-4) baseada em critérios comuns de força de senha —
// não precisa de biblioteca externa pra dar um retorno visual útil.
function calcularForcaSenha(senha) {
  if (!senha) return 0;
  let pontos = 0;
  if (senha.length >= 6) pontos++;
  if (senha.length >= 10) pontos++;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++;
  if (/\d/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;
  return Math.min(pontos, 4);
}

const NIVEIS_FORCA = [
  { label: 'Muito fraca', cor: 'bg-red-500', texto: 'text-red-600' },
  { label: 'Fraca', cor: 'bg-orange-500', texto: 'text-orange-600' },
  { label: 'Razoável', cor: 'bg-amber-500', texto: 'text-amber-600' },
  { label: 'Forte', cor: 'bg-emerald-500', texto: 'text-emerald-600' },
  { label: 'Muito forte', cor: 'bg-emerald-600', texto: 'text-emerald-700' },
];

function MedidorForcaSenha({ senha }) {
  if (!senha) return null;
  const forca = calcularForcaSenha(senha);
  const nivel = NIVEIS_FORCA[forca];

  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i < forca ? nivel.cor : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-semibold mt-1 ${nivel.texto}`}>{nivel.label}</p>
    </div>
  );
}

export default function Cadastro() {
  const navigate = useNavigate();

  // Estado único para armazenar todos os campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'paciente', // 'paciente', 'fonoaudiologo' ou 'estagiario'
    
    // Campos do Paciente
    cartao_sus: '',
    data_nascimento: '',
    modelo_aparelho: '',
    lado_aparelho: 'bilateral',
    
    // Campos do Voluntário (Fono ou Estagiário)
    registro_profissional: '',
    instituicao: ''
  });

  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ tipo: '', mensagem: '' });

  // Função genérica para atualizar os inputs do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ tipo: '', mensagem: '' });

    if (formData.senha !== confirmarSenha) {
      setFeedback({ tipo: 'erro', mensagem: 'As senhas não coincidem. Verifique e tente novamente.' });
      return;
    }

    if (!aceitaTermos) {
      setFeedback({ tipo: 'erro', mensagem: 'Você precisa concordar com a Política de Privacidade para se cadastrar.' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar o cadastro.');
      }

      setFeedback({
        tipo: 'sucesso',
        mensagem: data.message || 'Cadastro realizado com sucesso! Confira seu e-mail para confirmar a conta.'
      });

      // Limpa o formulário
      setFormData({
        nome: '',
        email: '',
        senha: '',
        tipo: 'paciente',
        cartao_sus: '',
        data_nascimento: '',
        modelo_aparelho: '',
        lado_aparelho: 'bilateral',
        registro_profissional: '',
        instituicao: ''
      });
      setConfirmarSenha('');
      setAceitaTermos(false);

      // Redireciona para a tela de login (dá tempo de ler o aviso pra
      // conferir o e-mail antes de tentar entrar)
      setTimeout(() => {
        navigate('/login');
      }, 3500);

    } catch (erro) {
      setFeedback({ 
        tipo: 'erro', 
        mensagem: erro.message || 'Erro ao conectar com o servidor.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-100 max-w-xl w-full">
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Crie sua conta no AjudaÁudio</h1>
            <p className="text-gray-500 text-sm mt-1">Preencha seus dados para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* --- SELEÇÃO DE TIPO DE USUÁRIO --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eu sou:</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="paciente">Usuário / Paciente de Aparelho Auditivo</option>
                <option value="fonoaudiologo">Fonoaudiólogo(a) Voluntário(a)</option>
                <option value="estagiario">Estagiário(a) de Fonoaudiologia</option>
              </select>
            </div>

            {/* --- DADOS BÁSICOS (COMUNS A TODOS) --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Maria Silva"
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemplo@email.com"
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input
                  type="password"
                  name="senha"
                  required
                  minLength={6}
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <MedidorForcaSenha senha={formData.senha} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                <input
                  type="password"
                  name="confirmarSenha"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full border rounded-lg p-3 text-gray-800 focus:ring-2 outline-none ${
                    confirmarSenha && confirmarSenha !== formData.senha
                      ? 'border-red-300 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-teal-500'
                  }`}
                />
                {confirmarSenha && confirmarSenha !== formData.senha && (
                  <p className="text-xs text-red-600 mt-1">As senhas não coincidem.</p>
                )}
              </div>
            </div>

            {/* --- CAMPOS ESPECÍFICOS DE PACIENTE --- */}
            {formData.tipo === 'paciente' && (
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h2 className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Dados do Aparelho / Saúde</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nº do Cartão SUS (Opcional)</label>
                    <input
                      type="text"
                      name="cartao_sus"
                      value={formData.cartao_sus}
                      onChange={handleChange}
                      placeholder="000 0000 0000 0000"
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      name="data_nascimento"
                      value={formData.data_nascimento}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo do Aparelho (se souber)</label>
                    <input
                      type="text"
                      name="modelo_aparelho"
                      value={formData.modelo_aparelho}
                      onChange={handleChange}
                      placeholder="Ex: Phonak Marvel / Starkey"
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lado do Uso</label>
                    <select
                      name="lado_aparelho"
                      value={formData.lado_aparelho}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      <option value="bilateral">Bilateral (Ambos os ouvidos)</option>
                      <option value="direito">Ouvido Direito</option>
                      <option value="esquerdo">Ouvido Esquerdo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* --- CAMPOS ESPECÍFICOS DE VOLUNTÁRIO (FONO OU ESTAGIÁRIO) --- */}
            {(formData.tipo === 'fonoaudiologo' || formData.tipo === 'estagiario') && (
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h2 className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Dados Profissionais</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.tipo === 'fonoaudiologo' ? 'Registro Profissional (CRFa)' : 'Comprovante / Matrícula Acadêmica'}
                  </label>
                  <input
                    type="text"
                    name="registro_profissional"
                    required
                    maxLength={50}
                    value={formData.registro_profissional}
                    onChange={handleChange}
                    placeholder={formData.tipo === 'fonoaudiologo' ? 'Ex: CRFa 2-12345' : 'Ex: Matrícula 202400123'}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Universidade ou Clínica de Vínculo</label>
                  <input
                    type="text"
                    name="instituicao"
                    value={formData.instituicao}
                    onChange={handleChange}
                    placeholder="Ex: USP, UNIFESP ou Clínica X"
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Mensagem de Erro ou Sucesso */}
            {feedback.mensagem && (
              <div className={`p-4 rounded-lg text-sm text-center font-medium ${
                feedback.tipo === 'erro' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {feedback.mensagem}
              </div>
            )}

            {/* Aceite da Política de Privacidade */}
            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="aceitaTermos"
                checked={aceitaTermos}
                onChange={(e) => setAceitaTermos(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 shrink-0"
              />
              <label htmlFor="aceitaTermos" className="text-sm text-gray-600 leading-snug">
                Eu li e concordo com a{' '}
                <Link to="/privacidade" target="_blank" className="font-semibold text-teal-600 hover:underline">
                  Política de Privacidade e Termos de Uso
                </Link>
                {' '}do AjudaÁudio.
              </label>
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={loading || !aceitaTermos}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md disabled:bg-gray-400 mt-6"
            >
              {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-gray-100 mt-6">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-bold text-teal-600 hover:underline">
                Faça login
              </Link>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}