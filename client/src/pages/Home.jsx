import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { 
  Ear, 
  BookOpen, 
  MessageSquare, 
  BatteryCharging, 
  AlertCircle, 
  Sparkles, 
  Smartphone, 
  Volume2, 
  HelpCircle 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 font-sans">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="container mx-auto max-w-5xl px-4 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-left max-w-2xl">
            <span className="text-sm font-bold tracking-wider text-[#0d9488] uppercase block mb-3">
              Ajuda Gratuita
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Suporte para quem usa aparelho auditivo
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Respostas claras para pessoas com deficiência auditiva e seus familiares — sobre uso, manutenção e cuidados com o aparelho (inclusive os recebidos pelo SUS).
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link 
                to="/chat" 
                className="inline-flex items-center justify-center gap-2 font-semibold transition-all bg-[#0d9488] text-white shadow-md hover:bg-teal-700 h-14 rounded-xl px-6 text-base"
              >
                <MessageSquare className="h-5 w-5" />
                Tirar dúvida agora
              </Link>
              <Link 
                to="/duvidas" 
                className="inline-flex items-center justify-center gap-2 font-semibold transition-all bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-50 h-14 rounded-xl px-6 text-base"
              >
                <BookOpen className="h-5 w-5 text-slate-700" />
                Ver dúvidas comuns
              </Link>
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto flex justify-start md:justify-center">
            <div className="w-48 h-48 md:w-56 md:h-56 bg-[#2dada2] text-white rounded-full grid place-items-center shadow-lg">
              <Ear className="w-24 h-24 md:w-28 md:h-28" strokeWidth={1.75} />
            </div>
          </div>
        </section>

        {/* DÚVIDAS COMUNS GRID */}
        <section className="container mx-auto max-w-5xl px-4 py-12 border-t border-slate-100">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Dúvidas mais comuns</h2>
          <p className="mt-1 text-base text-slate-500">Toque em um botão para ver a resposta passo a passo.</p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/duvidas" className="group flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl text-center shadow-sm transition-all hover:border-[#0d9488] hover:-translate-y-0.5 hover:shadow-md">
              <BatteryCharging className="w-8 h-8 text-[#0d9488] mb-3 group-hover:scale-105 transition-transform" />
              <span className="font-bold text-slate-900 text-base">Como carregar</span>
            </Link>

            <Link to="/duvidas" className="group flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl text-center shadow-sm transition-all hover:border-[#0d9488] hover:-translate-y-0.5 hover:shadow-md">
              <AlertCircle className="w-8 h-8 text-[#0d9488] mb-3 group-hover:scale-105 transition-transform" />
              <span className="font-bold text-slate-900 text-base">Não liga</span>
            </Link>

            <Link to="/duvidas" className="group flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl text-center shadow-sm transition-all hover:border-[#0d9488] hover:-translate-y-0.5 hover:shadow-md">
              <Sparkles className="w-8 h-8 text-[#0d9488] mb-3 group-hover:scale-105 transition-transform" />
              <span className="font-bold text-slate-900 text-base">Como limpar</span>
            </Link>

            <Link to="/duvidas" className="group flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl text-center shadow-sm transition-all hover:border-[#0d9488] hover:-translate-y-0.5 hover:shadow-md">
              <Smartphone className="w-8 h-8 text-[#0d9488] mb-3 group-hover:scale-105 transition-transform" />
              <span className="font-bold text-slate-900 text-base">Ligar no celular</span>
            </Link>

            <Link to="/duvidas" className="group flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl text-center shadow-sm transition-all hover:border-[#0d9488] hover:-translate-y-0.5 hover:shadow-md">
              <Volume2 className="w-8 h-8 text-[#0d9488] mb-3 group-hover:scale-105 transition-transform" />
              <span className="font-bold text-slate-900 text-base">Está apitando</span>
            </Link>

            <Link to="/duvidas" className="group flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl text-center shadow-sm transition-all hover:border-[#0d9488] hover:-translate-y-0.5 hover:shadow-md">
              <Ear className="w-8 h-8 text-[#0d9488] mb-3 group-hover:scale-105 transition-transform" />
              <span className="font-bold text-slate-900 text-base">Como colocar</span>
            </Link>
          </div>
        </section>

        {/* HOW IT HELPS SECTION */}
        <section className="w-full bg-[#f0fdfa] py-16 mt-8">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-12">Como podemos ajudar</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-start">
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0d9488] text-white font-bold text-lg">1</span>
                  <BookOpen className="w-6 h-6 text-[#0d9488]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Veja as dúvidas comuns</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Já temos respostas prontas para carregar, limpar, parear e os problemas mais frequentes.
                </p>
                <Link to="/duvidas" className="mt-4 text-sm font-semibold text-[#0d9488] hover:underline inline-flex items-center gap-1">
                  Acessar dúvidas &rarr;
                </Link>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-start">
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#2dada2] text-white font-bold text-lg">2</span>
                  <MessageSquare className="w-6 h-6 text-[#2dada2]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Converse com a IA</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Tem uma dúvida diferente? Pergunte à IA e receba a resposta na hora.
                </p>
                <Link to="/chat" className="mt-4 text-sm font-semibold text-[#0d9488] hover:underline inline-flex items-center gap-1">
                  Iniciar chat &rarr;
                </Link>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-start">
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-700 text-white font-bold text-lg">3</span>
                  <HelpCircle className="w-6 h-6 text-teal-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Fale com um fonoaudiólogo</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Se ainda precisar, envie sua pergunta para um profissional do nosso time.
                </p>
                <Link to="/chat" className="mt-4 text-sm font-semibold text-[#0d9488] hover:underline inline-flex items-center gap-1">
                  Enviar mensagem &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-12 text-center text-slate-500">
          <p className="font-bold text-slate-900 text-lg">EscutaBem</p>
          <p className="mt-1 text-base">Apoio para quem usa aparelho auditivo do SUS.</p>
          <p className="mt-4">
            <Link to="/seja-profissional" className="font-semibold text-[#0d9488] hover:underline">
              É fonoaudiólogo(a) ou estagiário(a)? Seja voluntário
            </Link>
          </p>
          <p className="mt-6 text-sm max-w-2xl mx-auto leading-relaxed text-slate-400">
            As respostas deste site não substituem consulta com fonoaudiólogo. Em emergências, procure uma unidade de saúde.
          </p>
        </div>
      </footer>
    </div>
  );
}