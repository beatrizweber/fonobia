import { useNavigate } from 'react-router-dom';

export default function Atendimento() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h2>Painel Fonobia</h2>
        <button onClick={handleLogout} style={{ padding: '6px 12px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sair
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Olá, {usuario.nome || 'Visitante'}!</h3>
        <p><strong>Perfil:</strong> {usuario.tipoUsuario === 'fonoaudiologo' ? 'Fonoaudiólogo(a)' : 'Paciente / Usuário Surdo'}</p>
        {usuario.crfa && <p><strong>CRFa:</strong> {usuario.crfa}</p>}
      </div>
    </div>
  );
}