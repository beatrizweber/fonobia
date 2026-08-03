import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Shield, Mail, UserCheck, ArrowLeft, Stethoscope, User, ShieldAlert } from 'lucide-react';

export default function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 🔒 1. Trava de Segurança: Checa permissão do usuário no localStorage
    const usuarioSalvo = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!usuarioSalvo || usuarioSalvo.perfil !== 'Admin') {
      alert('Acesso restrito a administradores!');
      navigate('/');
      return;
    }

    // 2. Busca a lista enviando a role no cabeçalho
    async function carregarUsuarios() {
      try {
        const response = await fetch('http://localhost:3001/api/admin/usuarios', {
          headers: {
            'x-user-role': usuarioSalvo.perfil || ''
          }
        });
        const data = await response.json();

        if (response.ok) {
          setUsuarios(data);
        } else {
          setErro(data.error || 'Erro ao carregar usuários.');
        }
      } catch (err) {
        console.error('Erro na requisição:', err);
        setErro('Não foi possível se conectar ao servidor.');
      } finally {
        setLoading(false);
      }
    }

    carregarUsuarios();
  }, [navigate]);

  // 📦 Agrupa os usuários pelo perfil para montar as caixas separadas
  const usuariosPorPerfil = usuarios.reduce((acc, user) => {
    const perfil = user.perfil || 'Paciente / Usuário';
    if (!acc[perfil]) {
      acc[perfil] = [];
    }
    acc[perfil].push(user);
    return acc;
  }, {});

  // 🎨 Estilos e ícones personalizados para cada tipo de caixa
  const getPerfilStyle = (perfil) => {
    const perfilLower = perfil.toLowerCase();
    if (perfilLower.includes('fono')) {
      return {
        icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        headerBg: 'bg-blue-50/60',
        borderColor: 'border-blue-200',
      };
    }
    if (perfilLower.includes('admin')) {
      return {
        icon: <ShieldAlert className="w-5 h-5 text-purple-600" />,
        badge: 'bg-purple-100 text-purple-800 border-purple-200',
        headerBg: 'bg-purple-50/60',
        borderColor: 'border-purple-200',
      };
    }
    return {
      icon: <User className="w-5 h-5 text-emerald-600" />,
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      headerBg: 'bg-emerald-50/60',
      borderColor: 'border-emerald-200',
    };
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 container mx-auto max-w-5xl px-4 py-10">
        {/* Cabeçalho da página */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#34a094] p-3 rounded-xl text-white shadow-md">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                Painel Administrativo
              </h1>
              <p className="text-slate-500 text-sm md:text-base">
                Acesso exclusivo para visualização dos usuários por categoria
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/atendimento')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>

        {/* Estados de carregamento e erro */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
            Carregando dados dos usuários...
          </div>
        ) : erro ? (
          <div className="bg-white rounded-2xl border border-red-200 p-12 text-center text-red-500 font-medium shadow-sm">
            {erro}
          </div>
        ) : usuarios.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
            Nenhum usuário cadastrado até o momento.
          </div>
        ) : (
          /* Renderização das Caixas por Perfil */
          <div className="space-y-8">
            {Object.keys(usuariosPorPerfil).map((perfil) => {
              const estilo = getPerfilStyle(perfil);
              const lista = usuariosPorPerfil[perfil];

              return (
                <div
                  key={perfil}
                  className={`bg-white rounded-2xl border ${estilo.borderColor} shadow-sm overflow-hidden`}
                >
                  {/* Cabeçalho da Caixa */}
                  <div className={`p-5 border-b border-slate-100 flex items-center justify-between ${estilo.headerBg}`}>
                    <div className="flex items-center gap-3">
                      {estilo.icon}
                      <h2 className="text-lg font-bold text-slate-800">
                        {perfil}
                      </h2>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${estilo.badge}`}>
                      {lista.length} {lista.length === 1 ? 'usuário' : 'usuários'}
                    </span>
                  </div>

                  {/* Tabela de Usuários da Caixa */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                          <th className="py-3 px-6">ID</th>
                          <th className="py-3 px-6">Nome Completo</th>
                          <th className="py-3 px-6">E-mail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                        {lista.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-400">
                              #{user.id}
                            </td>
                            <td className="py-4 px-6 font-bold text-slate-800">
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-[#34a094]" />
                                {user.nome}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-slate-600">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                {user.email}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}