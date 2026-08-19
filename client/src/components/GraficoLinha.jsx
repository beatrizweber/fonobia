import { useState } from 'react';

// Gráfico de linha simples, sem biblioteca externa — uma métrica por
// gráfico (sem eixo duplo), traço fino de 2px, ponto de destaque no dia
// mais recente e crosshair com tooltip ao passar o mouse. Usado no painel
// admin e na página pública de Impacto.
export default function GraficoLinha({ titulo, subtitulo, dados, campo, cor }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const largura = 600;
  const altura = 160;
  const padding = { top: 12, right: 10, bottom: 22, left: 10 };

  if (!dados || dados.length === 0) {
    return (
      <div className="p-5 rounded-2xl border border-slate-200 bg-white">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{titulo}</p>
        <p className="text-xs text-slate-400 mt-4 text-center py-10">Sem dados suficientes ainda.</p>
      </div>
    );
  }

  const valores = dados.map((d) => d[campo]);
  const max = Math.max(...valores, 1);
  const larguraUtil = largura - padding.left - padding.right;
  const alturaUtil = altura - padding.top - padding.bottom;

  const x = (i) => padding.left + (dados.length === 1 ? larguraUtil / 2 : (i / (dados.length - 1)) * larguraUtil);
  const y = (v) => padding.top + alturaUtil - (v / max) * alturaUtil;

  const pathD = dados.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d[campo]).toFixed(1)}`).join(' ');
  const totalPeriodo = valores.reduce((a, b) => a + b, 0);
  const hoverDado = hoverIndex !== null ? dados[hoverIndex] : null;

  // A API manda a data como DATE do Postgres — o driver já serializa em ISO
  // completo (ex: "2026-07-09T00:00:00.000Z"), então não precisa (e não pode)
  // concatenar hora de novo aqui, senão vira uma string inválida pro Date().
  const formatarDia = (diaStr) => new Date(diaStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * largura;
    const idx = Math.round(((relX - padding.left) / larguraUtil) * (dados.length - 1));
    setHoverIndex(Math.min(Math.max(idx, 0), dados.length - 1));
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{titulo}</p>
          <p className="text-[11px] text-slate-400">{subtitulo}</p>
        </div>
        <p className="text-lg font-black text-slate-800">{totalPeriodo}</p>
      </div>

      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="w-full h-auto mt-2 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <line x1={padding.left} y1={y(0)} x2={largura - padding.right} y2={y(0)} stroke="#e2e8f0" strokeWidth="1" />
        <path d={pathD} fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(dados.length - 1)} cy={y(dados[dados.length - 1][campo])} r="4" fill={cor} stroke="white" strokeWidth="1.5" />

        {hoverDado && (
          <>
            <line x1={x(hoverIndex)} y1={padding.top} x2={x(hoverIndex)} y2={y(0)} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={x(hoverIndex)} cy={y(hoverDado[campo])} r="4" fill={cor} stroke="white" strokeWidth="1.5" />
          </>
        )}

        {[0, Math.floor((dados.length - 1) / 2), dados.length - 1].map((i) => (
          <text
            key={i}
            x={x(i)}
            y={altura - 6}
            fontSize="9"
            fill="#94a3b8"
            textAnchor={i === 0 ? 'start' : i === dados.length - 1 ? 'end' : 'middle'}
          >
            {formatarDia(dados[i].dia)}
          </text>
        ))}
      </svg>

      <div className="text-center text-xs font-semibold text-slate-600 h-4">
        {hoverDado ? (
          <>{formatarDia(hoverDado.dia)}: <span style={{ color: cor }}>{hoverDado[campo]}</span></>
        ) : (
          <span className="text-slate-300">passe o mouse pro detalhe do dia</span>
        )}
      </div>
    </div>
  );
}
