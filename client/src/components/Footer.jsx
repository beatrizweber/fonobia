import React from 'react';
import { Link } from 'react-router-dom';

// Slots de patrocinadores — troque cada item por { nome, logoUrl, url } reais
// quando houver patrocinadores confirmados. Enquanto vazio, mostra placeholders.
const PATROCINADORES = [];

export default function Footer({ minimal = false }) {
  return (
    <footer className="border-t border-slate-200 bg-white pt-6 mt-auto">
      <div className="container mx-auto max-w-6xl px-4 text-center text-slate-500">
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

        <p className="mt-4 pb-6 text-xs max-w-2xl mx-auto leading-relaxed text-slate-400">
          As respostas deste site não substituem consulta com fonoaudiólogo. Em emergências, procure uma unidade de saúde.
        </p>
      </div>

      {/* Faixa de patrocinadores/apoiadores — largura cheia, fundo destacado do resto do footer */}
      {!minimal && (
        <div className="bg-slate-50 border-t border-slate-200 py-6">
          <div className="container mx-auto max-w-6xl px-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
              Apoio e Patrocínio
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {PATROCINADORES.length > 0
                ? PATROCINADORES.map((p) => (
                    <a
                      key={p.nome}
                      href={p.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-16 px-6 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
                      title={p.nome}
                    >
                      <img src={p.logoUrl} alt={p.nome} className="h-9 w-auto object-contain" />
                    </a>
                  ))
                : Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 w-32 rounded-xl bg-white border border-dashed border-slate-300 shadow-sm flex items-center justify-center text-[11px] text-slate-300 font-semibold"
                    >
                      Logo aqui
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}