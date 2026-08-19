import { CheckCircle2, AlertCircle } from 'lucide-react';

// Banner de sucesso/aviso/erro reaproveitável — unifica o que estava
// duplicado (com estilos levemente diferentes) em Login, Cadastro,
// EsqueciSenha, RedefinirSenha e Perfil.
const ESTILOS = {
  sucesso: { cor: 'bg-emerald-50 text-emerald-800 border-emerald-200', Icone: CheckCircle2, iconeCor: 'text-emerald-600' },
  aviso: { cor: 'bg-amber-50 text-amber-800 border-amber-200', Icone: AlertCircle, iconeCor: 'text-amber-600' },
  erro: { cor: 'bg-red-50 text-red-700 border-red-200', Icone: AlertCircle, iconeCor: 'text-red-600' },
};

export default function FeedbackBanner({ tipo = 'erro', mensagem }) {
  if (!mensagem) return null;

  const estilo = ESTILOS[tipo] || ESTILOS.erro;
  const Icone = estilo.Icone;

  return (
    <div className={`p-3.5 rounded-xl text-sm font-medium flex items-center gap-2 border ${estilo.cor}`}>
      <Icone className={`w-4 h-4 shrink-0 ${estilo.iconeCor}`} />
      <span>{mensagem}</span>
    </div>
  );
}
