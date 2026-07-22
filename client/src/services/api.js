const API_URL = 'http://localhost:3001/api';

/**
 * Função utilitária para centralizar as requisições HTTP usando fetch
 */
async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ocorreu um erro na requisição.');
    }

    return data;
  } catch (error) {
    console.error(`Erro na requisição ${endpoint}:`, error.message);
    throw error;
  }
}

// Métodos prontos para consumo no React
export const api = {
  // Teste de conexão
  checkHealth: () => request('/health'),

  // Autenticação
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Chat
  sendMessage: (message) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};