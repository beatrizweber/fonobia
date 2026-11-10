import React from 'react';
import { Link } from 'react-router-dom';

// Logos em client/public/patrocinadores/ — arquivos em /public são servidos
// direto na raiz, por isso o caminho começa com "/patrocinadores/..." e não
// precisa de import. Troque a "url" pelo site de cada patrocinador quando tiver.
const HOSTGATOR = { nome: 'HostGator', logoUrl: '/patrocinadores/hostgator.svg', url: 'https://www.hostgator.com.br/' };

// Logo da equipe AjudaÁudio — ainda não temos o arquivo. Quando chegar, troque
// por algo como { nome: 'Equipe AjudaÁudio', logoUrl: '/patrocinadores/equipe.svg', url: '#' }
const EQUIPE = null;

function CartaoLogo({ patrocinador }) {
  if (!patrocinador) {
    return (
      <div className="h-48 w-full rounded-xl bg-white border border-dashed border-slate-300 shadow-sm flex items-center justify-center text-sm text-slate-300 font-semibold">
        Logo aqui
      </div>
    );
  }
  return (
    <a
      href={patrocinador.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="h-48 w-full px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
      title={patrocinador.nome}
    >
      {/* h-full + w-full + object-contain: a logo cresce até preencher o
          espaço já com a margem do px-4/py-3 acima (é esse padding do CARD
          que controla o tamanho da logo — menos padding = logo maior),
          mas NUNCA estoura nem corta, seja ela bem quadrada (sobra margem
          nas laterais) ou bem larga tipo a HostGator (sobra margem em
          cima/embaixo). Nada de scale/overflow-hidden, então nunca corta
          nenhuma borda de nenhuma proporção de logo. */}
      <img src={patrocinador.logoUrl} alt={patrocinador.nome} className="h-full w-full object-contain" />
    </a>
  );
}

export default function Footer({ minimal = false }) {
  return (
    <footer className="border-t border-slate-200 bg-white pt-6 mt-auto">
      <div className="container mx-auto max-w-6xl px-4 pb-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-5">
          Apoio e Patrocínio
        </p>

        {/* Um espaço grande de cada lado do texto — HostGator e a logo da
            equipe — empilha abaixo do texto em telas estreitas (não cabe do lado). */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,42rem)_1fr] items-center gap-10">
          <div className="hidden lg:block">
            <CartaoLogo patrocinador={HOSTGATOR} />
          </div>

          <div className="text-center text-slate-500">
            <p className="font-bold text-slate-900 text-base">AjudaÁudio</p>
            <p className="mt-0.5 text-xs md:text-sm">Apoio para quem usa aparelho auditivo do SUS.</p>

            {/* Mostra o link APENAS se NÃO for o footer minimalista */}
            {!minimal && (
              <p className="mt-3">
                <Link to="/cadastro" className="font-semibold text-[#0d9488] hover:underline text-sm">
                  É fonoaudiólogo(a) ou estagiário(a)? Seja voluntário
                </Link>
              </p>
            )}

            {!minimal && (
              <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-semibold">
                <Link to="/sobre" className="text-slate-500 hover:text-[#0d9488] hover:underline">Sobre o projeto</Link>
                <Link to="/privacidade" className="text-slate-500 hover:text-[#0d9488] hover:underline">Política de Privacidade e Termos de Uso</Link>
              </p>
            )}

            <p className="mt-4 text-xs max-w-2xl mx-auto leading-relaxed text-slate-400">
              As respostas deste site não substituem consulta com fonoaudiólogo. Em emergências, procure uma unidade de saúde.
            </p>
          </div>

          <div className="hidden lg:block">
            <CartaoLogo patrocinador={EQUIPE} />
          </div>

          {/* Fallback pra telas menores que "lg": as 2 logos lado a lado */}
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:hidden">
            <CartaoLogo patrocinador={HOSTGATOR} />
            <CartaoLogo patrocinador={EQUIPE} />
          </div>
        </div>
      </div>
    </footer>
  );
}
