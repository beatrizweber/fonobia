import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LogIn } from 'lucide-react';

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          
          {/* TÍTULO E SUBTÍTULO NEUTROS */}
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Acesse sua Conta
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Entre para acessar suas conversas e informações.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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

            <button
              type="submit"
              className="w-full bg-[#34a094] hover:bg-[#2d8a80] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 mt-6 text-base"
            >
              <LogIn className="w-5 h-5" /> Entrar
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Ainda não tem conta?{' '}
              <Link to="/cadastro" className="font-bold text-[#34a094] hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer minimalista sem o link de cadastro */}
      <Footer minimal={true} />
    </div>
  );
}