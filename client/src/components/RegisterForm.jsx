import { useState } from 'react';
import { api } from '../services/api';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'paciente', // 'paciente' ou 'fono'
    crfa: ''
  });
  
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    try {
      const response = await api.register(formData);
      setFeedback({ type: 'success', message: response.message });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Cadastro no AjudaÁudio</h2>

      <input 
        type="text" 
        placeholder="Seu nome"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required 
      />

      <input 
        type="email" 
        placeholder="Seu e-mail"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required 
      />

      <input 
        type="password" 
        placeholder="Senha"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required 
      />

      <select 
        value={formData.role} 
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
      >
        <option value="paciente">Usuário do SUS / Paciente</option>
        <option value="fono">Fonoaudiólogo(a)</option>
      </select>

      {/* Campo condicional para o CRFa */}
      {formData.role === 'fono' && (
        <input 
          type="text" 
          placeholder="Número do CRFa"
          value={formData.crfa}
          onChange={(e) => setFormData({ ...formData, crfa: e.target.value })}
          required
        />
      )}

      <button type="submit">Cadastrar</button>

      {feedback.message && (
        <p style={{ color: feedback.type === 'error' ? 'red' : 'green' }}>
          {feedback.message}
        </p>
      )}
    </form>
  );
}