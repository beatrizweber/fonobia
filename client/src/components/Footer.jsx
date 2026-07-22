import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ minimal = false }) {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
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

        <p className="mt-4 text-xs max-w-2xl mx-auto leading-relaxed text-slate-400">
          As respostas deste site não substituem consulta com fonoaudiólogo. Em emergências, procure uma unidade de saúde.
        </p>
      </div>
    </footer>
  );
}