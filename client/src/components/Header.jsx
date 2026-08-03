import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ear, BookOpen, MessageSquare, LogIn, Shield, User } from 'lucide-react';

export default function Header() {
  const location = useLocation();

  // 🔒 Lê o usuário do localStorage e verifica permissões
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  
  const tipoUsuario = (usuario?.tipo || usuario?.perfil || '').toLowerCase();
  const isAdmin = tipoUsuario === 'admin';

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        
        {/* LOGO (HOME) */}
        <Link to="/" className="flex items-center gap-3 text-2xl font-extrabold text-[#0d9488]">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0d9488] text-white shadow-md">
            <Ear className="h-7 w-7" />
          </span>
          <span className="text-[#0d9488]">AjudaÁudio</span>
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

          {/* BOTÃO DO CHAT */}
          <Link 
            to="/chat" 
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold transition-colors ${
              isActive('/chat') ? 'bg-slate-100 text-[#0d9488]' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Chat</span>
          </Link>

          {/* 🔴 BOTÃO EXCLUSIVO DO ADMIN (DESKTOP) */}
          {isAdmin && (
            <Link 
              to="/admin" 
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold transition-colors ${
                isActive('/admin') 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              <Shield className="h-5 w-5 text-purple-600" />
              <span>Painel Admin</span>
            </Link>
          )}

          {/* 🟢 TROCA DINÂMICA: BOTÃO PERFIL OU ENTRAR */}
          {usuario ? (
            <Link 
              to="/perfil" 
              className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors h-11 rounded-xl px-5 text-base ${
                isActive('/perfil')
                  ? 'bg-teal-700 text-white shadow'
                  : 'bg-[#0d9488] text-white shadow hover:bg-teal-700'
              }`}
            >
              <User className="h-5 w-5" /> 
              <span className="max-w-[120px] truncate">{usuario.nome ? usuario.nome.split(' ')[0] : 'Perfil'}</span>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center gap-2 font-semibold transition-colors bg-[#0d9488] text-white shadow hover:bg-teal-700 h-11 rounded-xl px-6 text-base"
            >
              <LogIn className="h-5 w-5" /> 
              Entrar
            </Link>
          )}
        </nav>

        {/* BOTÃO LOGIN/PERFIL MOBILE */}
        <div className="flex items-center gap-2 md:hidden">
          {usuario ? (
            <Link 
              to="/perfil" 
              className="inline-flex items-center gap-1.5 justify-center font-semibold transition-colors bg-[#0d9488] text-white shadow hover:bg-teal-700 h-10 rounded-xl px-4 text-sm"
            >
              <User className="h-4 h-4" />
              <span>Perfil</span>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center font-semibold transition-colors bg-[#0d9488] text-white shadow hover:bg-teal-700 h-10 rounded-xl px-5 text-sm"
            >
              Entrar
            </Link>
          )}
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

          {/* BOTÃO DO CHAT MOBILE */}
          <Link 
            to="/chat" 
            className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs font-semibold ${
              isActive('/chat') ? 'text-[#0d9488]' : 'text-slate-500'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Chat</span>
          </Link>

          {/* BOTÃO DO PERFIL MOBILE */}
          {usuario && (
            <Link 
              to="/perfil" 
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs font-semibold ${
                isActive('/perfil') ? 'text-[#0d9488]' : 'text-slate-500'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Perfil</span>
            </Link>
          )}

          {/* 🔴 BOTÃO EXCLUSIVO DO ADMIN (MOBILE) */}
          {isAdmin && (
            <Link 
              to="/admin" 
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs font-semibold ${
                isActive('/admin') ? 'text-purple-600' : 'text-slate-500'
              }`}
            >
              <Shield className="h-5 w-5" />
              <span>Admin</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}