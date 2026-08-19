import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Ear, BookOpen, MessageSquare, LogIn, Shield, User, Stethoscope, HandHeart, Headphones, Bell, Menu, X } from 'lucide-react';
import { API_URL } from '../config';

const API = `${API_URL}/api`;

// Bolinha vermelha com contador — só aparece quando tem novidade (> 0)
function Badge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center border-2 border-white">
      {count > 9 ? '9+' : count}
    </span>
  );
}

// Botão de navegação pro painel/atendimentos do usuário (link puro, sem notificação).
// Fica neutro (cinza) igual aos outros itens do menu, só ganha a cor do papel
// quando é a página atual — a cor nunca aparece "descansada" sem motivo.
function BotaoNavegacao({ to, ativo, icone: Icone, texto, cores }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold transition-colors ${ativo ? cores.ativo : 'text-slate-600 hover:bg-slate-100'}`}
    >
      <Icone className={`h-5 w-5 ${ativo ? cores.icone : 'text-slate-500'}`} />
      <span>{texto}</span>
    </Link>
  );
}

// Sininho de notificações, independente do botão de navegação: clicar abre um
// painel com as últimas notificações; clicar numa notificação leva direto pra página dela.
function BotaoNotificacoes({ texto, notificacoes, cores, aberto, onToggle, onFechar }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!aberto) return;
    // Existem VÁRIAS instâncias deste componente montadas ao mesmo tempo (uma
    // por papel no menu desktop + uma no menu mobile), cada uma só visível
    // via CSS conforme o tamanho da tela — mas todas compartilham o mesmo
    // estado "aberto". Por isso não basta checar só o PRÓPRIO ref: um clique
    // dentro do painel de QUALQUER uma delas precisa contar como "clique de
    // dentro" pra todas, senão a instância escondida fecha o estado
    // compartilhado assim que o mousedown começa — e o botão da notificação
    // some debaixo do cursor antes do clique terminar de acontecer.
    const handleClickFora = (e) => { if (!e.target.closest('[data-notificacoes-painel]')) onFechar(); };
    const handleEsc = (e) => { if (e.key === 'Escape') onFechar(); };
    document.addEventListener('mousedown', handleClickFora);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [aberto, onFechar]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Notificações de ${texto}`}
        className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        <Badge count={notificacoes.length} />
      </button>

      {aberto && (
        <div data-notificacoes-painel className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-800">Notificações</p>
          </div>
          {notificacoes.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-400 text-center">Nenhuma novidade por enquanto.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notificacoes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => { onFechar(); navigate(n.link); }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-800">{n.texto}</p>
                  {n.subtexto && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">"{n.subtexto}"</p>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const location = useLocation();

  // 🔒 Lê o usuário do localStorage e verifica permissões
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  const tipoUsuario = (usuario?.tipo || usuario?.perfil || '').toLowerCase();
  const isAdmin = tipoUsuario === 'admin';
  const isFono = tipoUsuario === 'fonoaudiologo' || tipoUsuario === 'estagiario';
  const isPaciente = tipoUsuario === 'paciente';

  const isActive = (path) => location.pathname === path;

  // Lista de notificações (não só a contagem) — pra dar pra clicar e ir
  // direto pro atendimento relacionado. Cada papel tem sua própria lógica,
  // toda baseada em dado que já existe no banco (sem tabela nova).
  const [notificacoes, setNotificacoes] = useState([]);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const menuBotaoRef = useRef(null);
  const menuPainelRef = useRef(null);

  useEffect(() => {
    if (!menuAberto) return;
    const handleClickFora = (e) => {
      if (menuBotaoRef.current?.contains(e.target)) return;
      if (menuPainelRef.current?.contains(e.target)) return;
      setMenuAberto(false);
    };
    const handleEsc = (e) => { if (e.key === 'Escape') setMenuAberto(false); };
    document.addEventListener('mousedown', handleClickFora);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [menuAberto]);

  useEffect(() => {
    if (!usuario) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    async function carregarNotificacoes() {
      try {
        if (isPaciente) {
          const res = await fetch(`${API}/atendimentos/paciente/${usuario.id}`, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) return;
          const chamados = await res.json();
          const lista = chamados
            .filter((c) => c.iniciado_por === 'voluntario' && c.status !== 'encerrada' && c.tem_mensagem_nao_lida)
            .map((c) => ({
              id: c.id,
              texto: 'Nova mensagem no seu atendimento',
              subtexto: c.primeira_mensagem,
              link: `/chat/${c.id}`,
              data: c.ultima_mensagem_em || c.criado_em,
            }));
          setNotificacoes(ordenar(lista));
        } else if (isFono) {
          const res = await fetch(`${API}/atendimentos/fila`, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) return;
          const chamados = await res.json();
          const naFila = chamados
            .filter((c) => c.status === 'aguardando_voluntario')
            .map((c) => ({ id: c.id, texto: `${c.paciente_nome} está aguardando atendimento`, subtexto: c.mensagem_inicial, link: '/painelfono', data: c.criado_em }));
          const respostas = chamados
            .filter((c) => c.status === 'com_voluntario' && c.voluntario_id === usuario.id && c.tem_resposta_nao_lida)
            .map((c) => ({ id: c.id, texto: `${c.paciente_nome} respondeu`, subtexto: c.mensagem_inicial, link: `/chat/${c.id}`, data: c.ultima_mensagem_em || c.criado_em }));
          setNotificacoes(ordenar([...naFila, ...respostas]));
        } else if (isAdmin) {
          const res = await fetch(`${API}/admin/voluntarios/pendentes`, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) return;
          const pendentes = await res.json();
          const lista = pendentes.map((v) => ({ id: v.id, texto: `${v.nome} aguardando aprovação`, subtexto: v.crfa, link: '/paineladmin', data: v.criado_em }));
          setNotificacoes(ordenar(lista));
        }
      } catch (err) {
        console.error('Erro ao carregar notificações:', err);
      }
    }

    function ordenar(lista) {
      return lista.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 10);
    }

    carregarNotificacoes();
    const intervalo = setInterval(carregarNotificacoes, 20000);
    return () => clearInterval(intervalo);
  }, [usuario?.id, isPaciente, isFono, isAdmin]);

  const coresAtendimentos = {
    ativo: 'bg-teal-100 text-teal-700',
    icone: 'text-teal-600',
  };
  const coresFono = {
    ativo: 'bg-blue-100 text-blue-700',
    icone: 'text-blue-600',
  };
  const coresAdmin = {
    ativo: 'bg-purple-100 text-purple-700',
    icone: 'text-purple-600',
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 md:h-20 max-w-6xl items-center justify-between gap-2 px-3 md:px-4">

        {/* LOGO (HOME) */}
        <Link to="/" className="flex min-w-0 shrink items-center gap-2 md:gap-3 text-lg md:text-2xl font-extrabold text-[#0d9488]">
          <span className="grid h-9 w-9 md:h-12 md:w-12 shrink-0 place-items-center rounded-xl md:rounded-2xl bg-[#0d9488] text-white shadow-md">
            <Ear className="h-5 w-5 md:h-7 md:w-7" />
          </span>
          <span className="text-[#0d9488] truncate">AjudaÁudio</span>
        </Link>

        {/* NAVEGAÇÃO DESKTOP */}
        <nav className="hidden items-center gap-3 md:flex" aria-label="Principal">
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

          {/* IMPACTO (público) */}
          <Link
            to="/impacto"
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold transition-colors ${
              isActive('/impacto') ? 'bg-slate-100 text-[#0d9488]' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HandHeart className="h-5 w-5" />
            <span>Impacto</span>
          </Link>

          {/* 🟢 ATENDIMENTOS HUMANOS (PACIENTE) */}
          {isPaciente && (
            <div className="flex items-center gap-1.5">
              <BotaoNavegacao to="/atendimento" ativo={isActive('/atendimento')} icone={Headphones} texto="Atendimentos" cores={coresAtendimentos} />
              <BotaoNotificacoes
                texto="Atendimentos"
                notificacoes={notificacoes}
                cores={coresAtendimentos}
                aberto={dropdownAberto}
                onToggle={() => setDropdownAberto((v) => !v)}
                onFechar={() => setDropdownAberto(false)}
              />
            </div>
          )}

          {/* 🔵 BOTÃO EXCLUSIVO DO FONOAUDIÓLOGO/ESTAGIÁRIO (DESKTOP) */}
          {isFono && (
            <div className="flex items-center gap-1.5">
              <BotaoNavegacao to="/painelfono" ativo={isActive('/painelfono')} icone={Stethoscope} texto="Painel do Profissional" cores={coresFono} />
              <BotaoNotificacoes
                texto="Painel do Profissional"
                notificacoes={notificacoes}
                cores={coresFono}
                aberto={dropdownAberto}
                onToggle={() => setDropdownAberto((v) => !v)}
                onFechar={() => setDropdownAberto(false)}
              />
            </div>
          )}

          {/* 🔴 ATENDIMENTOS (ADMIN) — atalho direto pra aba "Todos os Chamados"
              do Painel Admin, já que o admin não tem chamados próprios como
              o paciente (ele enxerga o de todo mundo, não faz sentido reusar
              a página /atendimento que é pessoal do paciente) */}
          {isAdmin && (
            <BotaoNavegacao to="/paineladmin?aba=chamados" ativo={isActive('/paineladmin')} icone={Headphones} texto="Atendimentos" cores={coresAdmin} />
          )}

          {/* 🔴 BOTÃO EXCLUSIVO DO ADMIN (DESKTOP) */}
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <BotaoNavegacao to="/paineladmin" ativo={isActive('/paineladmin')} icone={Shield} texto="Painel Admin" cores={coresAdmin} />
              <BotaoNotificacoes
                texto="Painel Admin"
                notificacoes={notificacoes}
                cores={coresAdmin}
                aberto={dropdownAberto}
                onToggle={() => setDropdownAberto((v) => !v)}
                onFechar={() => setDropdownAberto(false)}
              />
            </div>
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

        {/* CONTROLES MOBILE: sino (se logado) + hambúrguer + perfil/entrar */}
        <div className="flex items-center gap-1 md:hidden">
          {usuario && (
            <BotaoNotificacoes
              texto="notificações"
              notificacoes={notificacoes}
              cores={coresAtendimentos}
              aberto={dropdownAberto}
              onToggle={() => setDropdownAberto((v) => !v)}
              onFechar={() => setDropdownAberto(false)}
            />
          )}

          <button
            ref={menuBotaoRef}
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {usuario ? (
            <Link
              to="/perfil"
              className="inline-flex items-center gap-1.5 justify-center shrink-0 font-semibold transition-colors bg-[#0d9488] text-white shadow hover:bg-teal-700 h-9 rounded-xl px-3 text-sm"
            >
              <User className="h-4 w-4 shrink-0" />
              <span className="max-w-[72px] truncate">{usuario.nome ? usuario.nome.split(' ')[0] : 'Perfil'}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center shrink-0 font-semibold transition-colors bg-[#0d9488] text-white shadow hover:bg-teal-700 h-9 rounded-xl px-4 text-sm"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>

      {/* GAVETA DE NAVEGAÇÃO (MOBILE) — abre com o hambúrguer, some ao navegar */}
      {menuAberto && (
        <div ref={menuPainelRef} className="md:hidden border-t border-slate-200 bg-white shadow-lg">
          <nav className="container mx-auto flex flex-col gap-1 px-3 py-3" aria-label="Menu mobile">
            <Link
              to="/duvidas"
              onClick={() => setMenuAberto(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                isActive('/duvidas') ? 'bg-slate-100 text-[#0d9488]' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="h-5 w-5 shrink-0" /> Dúvidas
            </Link>

            <Link
              to="/chat"
              onClick={() => setMenuAberto(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                isActive('/chat') ? 'bg-slate-100 text-[#0d9488]' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="h-5 w-5 shrink-0" /> Chat
            </Link>

            <Link
              to="/impacto"
              onClick={() => setMenuAberto(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                isActive('/impacto') ? 'bg-slate-100 text-[#0d9488]' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HandHeart className="h-5 w-5 shrink-0" /> Impacto
            </Link>

            {isPaciente && (
              <Link
                to="/atendimento"
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  isActive('/atendimento') ? 'bg-teal-100 text-teal-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Headphones className="h-5 w-5 shrink-0" /> Atendimentos
              </Link>
            )}

            {isFono && (
              <Link
                to="/painelfono"
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  isActive('/painelfono') ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Stethoscope className="h-5 w-5 shrink-0" /> Painel do Profissional
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/paineladmin?aba=chamados"
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  isActive('/paineladmin') ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Headphones className="h-5 w-5 shrink-0" /> Atendimentos
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/paineladmin"
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  isActive('/paineladmin') ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Shield className="h-5 w-5 shrink-0" /> Painel Admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
