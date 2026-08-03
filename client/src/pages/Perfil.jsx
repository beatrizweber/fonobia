import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { User, Mail, Shield, Calendar, Ear, CreditCard, LogOut, FileText } from 'lucide-react';

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioSalvo = JSON.parse(localStorage.getItem('usuario') || 'null');
    
    if (!usuarioSalvo) {
      navigate('/login');
      return;
    }

    setUsuario(usuarioSalvo);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  if (!usuario) return null;

  const tipoUsuario = (usuario.tipo || usuario.perfil || 'paciente').toLowerCase();

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

          {/* Dados do Cadastro */}
          <div className="p-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-[#34a094]" />
              Informações do Cadastro
            </h2>

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
                    {usuario.data_nascimento}
                  </p>
                </div>
              )}

              {/* Campos específicos de Paciente */}
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

              {/* Campos específicos de Profissional / Voluntário */}
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
                </>
              )}
            </div>

            {/* Ações */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}