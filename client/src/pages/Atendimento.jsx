import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LogOut, User, Award, ShieldCheck } from 'lucide-react';

export default function Atendimento() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Proteção: Redireciona para o login se não houver usuário logado
  useEffect(() => {
    if (!usuario.id) {
      navigate('/login');
    }
  }, [usuario, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!usuario.id) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Header />

      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-slate-200 max-w-lg w-full space-y-6">
          
          {/* Cabeçalho do Painel */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Painel de Atendimento</h1>
              <p className="text-xs text-slate-500">AjudaÁudio - Área Logada</p>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>

          {/* Cartão de Informações do Usuário */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#34a094]/10 text-[#34a094] rounded-full">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {usuario.nome || 'Usuário'}
                </h2>
                <p className="text-xs text-slate-500">{usuario.email}</p>
              </div>
            </div>

            <hr className="border-slate-200" />

            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-[#34a094]" /> Perfil de Acesso:
                </span>
                <span className="capitalize font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs">
                  {usuario.tipo === 'fonoaudiologo' 
                    ? 'Fonoaudiólogo(a)' 
                    : usuario.tipo === 'estagiario' 
                    ? 'Estagiário(a)' 
                    : 'Paciente / Usuário'}
                </span>
              </div>

              {/* Exibe o CRFa apenas se o usuário for profissional e possuir a informação */}
              {usuario.registro_profissional && (
                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-2 font-medium text-slate-600">
                    <Award className="w-4 h-4 text-[#34a094]" /> Registro:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {usuario.registro_profissional}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}