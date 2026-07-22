import { useState } from 'react';
import { api } from '../services/api';

export function ChatBox() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await api.sendMessage(userText);
      setMessages((prev) => [...prev, { sender: 'bot', text: response.text }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { sender: 'bot', text: 'Ops, erro ao conectar com o servidor.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="messages-list">
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.sender}`}>
            <strong>{msg.sender === 'user' ? 'Você' : 'AjudaÁudio'}:</strong> {msg.text}
          </div>
        ))}
        {loading && <p>Digitando...</p>}
      </div>

      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder="Pergunte sobre seu aparelho auditivo..."
      />
      <button onClick={handleSend} disabled={loading}>Enviar</button>
    </div>
  );
}