import { useEffect, useState } from 'react';
import { api } from '../services/api';

export function StatusBadge() {
  const [status, setStatus] = useState('Verificando...');

  useEffect(() => {
    api.checkHealth()
      .then((data) => setStatus(data.message))
      .catch(() => setStatus('Backend Offline 🔴'));
  }, []);

  return (
    <div style={{ padding: '8px 12px', background: '#f0f0f0', borderRadius: '4px' }}>
      <strong>Status do Servidor:</strong> {status}
    </div>
  );
}