import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Cadastro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipoUsuario: 'paciente', // 'paciente' ou 'fonoaudiologo'
    crfa: ''
  });

  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setCarregando(true);

    try {
      // Futura chamada de API no Fastify
      const response = await fetch('http://localhost:3000/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('✅ Cadastro realizado com sucesso!');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setMensagem(`❌ Erro: ${data.mensagem}`);
      }
    } catch (error) {
      setMensagem('❌ Não foi possível conectar ao servidor (Servidor offline).');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Fonobia - Criar Conta</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Nome Completo:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>E-mail:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Senha:</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Tipo de Perfil:</label>
          <select
            name="tipoUsuario"
            value={formData.tipoUsuario}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="paciente">Paciente / Usuário Surdo</option>
            <option value="fonoaudiologo">Fonoaudiólogo(a)</option>
          </select>
        </div>

        {/* Exibe o CRFa dinamicamente apenas para Fonoaudiólogos */}
        {formData.tipoUsuario === 'fonoaudiologo' && (
          <div style={{ marginBottom: '12px', background: '#f0f4f8', padding: '10px', borderRadius: '4px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Registro CRFa (ex: 12345/SP):</label>
            <input
              type="text"
              name="crfa"
              placeholder="Digite seu número CRFa"
              value={formData.crfa}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={carregando}
          style={{ width: '100%', padding: '10px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      {mensagem && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{mensagem}</p>}

      <p style={{ marginTop: '15px', fontSize: '14px' }}>
        Já tem uma conta? <Link to="/login">Faça Login</Link>
      </p>
    </div>
  );
}