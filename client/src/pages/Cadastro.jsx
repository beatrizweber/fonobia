import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { UserPlus, Ear, Stethoscope } from 'lucide-react';

export default function Cadastro() {
  const [tipoPerfil, setTipoPerfil] = useState('cliente'); // 'cliente' ou 'apoiador'

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Crie sua Conta
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Selecione seu perfil e faça parte do AjudaÁudio.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            
            {/* SELEÇÃO DO TIPO DE PERFIL */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Como você deseja usar o AjudaÁudio?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoPerfil('cliente')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all gap-1.5 text-center ${
                    tipoPerfil === 'cliente'
                      ? 'border-[#34a094] bg-[#34a094]/10 text-[#34a094] font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Ear className="w-6 h-6" />
                  <span className="text-sm">Usuário / Cliente</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoPerfil('apoiador')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all gap-1.5 text-center ${
                    tipoPerfil === 'apoiador'
                      ? 'border-[#34a094] bg-[#34a094]/10 text-[#34a094] font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Stethoscope className="w-6 h-6" />
                  <span className="text-sm">Fonoaudiólogo / Apoiador</span>
                </button>
              </div>
            </div>

            {/* CAMPO NOME */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                placeholder="Seu nome"
                className="w-full p-3 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-[#34a094]"
              />
            </div>

            {/* CAMPO EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full p-3 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-[#34a094]"
              />
            </div>

            {/* CAMPO ESPECÍFICO DE FONO/APOIADOR (Aparece apenas para apoiadores) */}
            {tipoPerfil === 'apoiador' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  CRFa ou Instituição de Ensino
                </label>
                <input
                  type="text"
                  placeholder="Ex: CRFa 2-XXXXX ou Nome da Faculdade"
                  className="w-full p-3 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-[#34a094]"
                />
              </div>
            )}

            {/* CAMPO SENHA */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-[#34a094]"
              />
            </div>

            {/* BOTÃO SUBMIT */}
            <button
              type="submit"
              className="w-full bg-[#34a094] hover:bg-[#2d8a80] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 mt-6 text-base"
            >
              <UserPlus className="w-5 h-5" /> Concluir Cadastro
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Já possui uma conta?{' '}
              <Link to="/login" className="font-bold text-[#34a094] hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer minimal={true}/>
    </div>
  );
}