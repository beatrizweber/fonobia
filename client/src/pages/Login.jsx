import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setCarregando(true);

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        setMensagem('✅ Login realizado!');
        setTimeout(() => navigate('/atendimento'), 1000);
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
      <h2>Fonobia - Entrar</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          style={{ width: '100%', padding: '10px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {mensagem && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{mensagem}</p>}

      <p style={{ marginTop: '15px', fontSize: '14px' }}>
        Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
      </p>
    </div>
  );
}