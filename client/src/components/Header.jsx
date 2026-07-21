import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ear, BookOpen, MessageSquare, LogIn } from 'lucide-react';

export default function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 text-2xl font-extrabold text-[#0d9488]">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0d9488] text-white shadow-md">
            <Ear className="h-7 w-7" />
          </span>
          <span className="text-[#0d9488]">EscutaBem</span>
        </Link>

        {/* NAVEGAÇÃO DESKTOP */}
        <nav className="hidden items-center gap-4 md:flex" aria-label="Principal">
          <Link 
            to="/duvidas" 
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold transition-colors ${
              isActive('/duvidas') ? 'bg-slate-100 text-[#0d9488]' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Dúvidas</span>
          </Link>
          <Link 
            to="/chat" 
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold transition-colors ${
              isActive('/chat') ? 'bg-slate-100 text-[#0d9488]' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Chat</span>
          </Link>
          <Link 
            to="/login" 
            className="inline-flex items-center justify-center gap-2 font-semibold transition-colors bg-[#0d9488] text-white shadow hover:bg-teal-700 h-11 rounded-xl px-6 text-base"
          >
            <LogIn className="h-5 w-5" /> 
            Entrar
          </Link>
        </nav>

        {/* BOTAO LOGIN MOBILE */}
        <div className="flex items-center gap-2 md:hidden">
          <Link 
            to="/login" 
            className="inline-flex items-center justify-center font-semibold transition-colors bg-[#0d9488] text-white shadow hover:bg-teal-700 h-10 rounded-xl px-5 text-sm"
          >
            Entrar
          </Link>
        </div>
      </div>

      {/* BARRA DE NAVEGAÇÃO INFERIOR (MOBILE) */}
      <div className="border-t border-slate-200 md:hidden bg-white">
        <div className="container mx-auto flex items-center justify-around px-2 py-2">
          <Link 
            to="/duvidas" 
            className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs font-semibold ${
              isActive('/duvidas') ? 'text-[#0d9488]' : 'text-slate-500'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Dúvidas</span>
          </Link>
          <Link 
            to="/chat" 
            className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs font-semibold ${
              isActive('/chat') ? 'text-[#0d9488]' : 'text-slate-500'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Chat</span>
          </Link>
        </div>
      </div>
    </header>
  );
}