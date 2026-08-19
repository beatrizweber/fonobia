import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SearchX, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 grid place-items-center mx-auto mb-5">
            <SearchX className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Página não encontrada</h1>
          <p className="mt-3 text-slate-500">
            O link que você seguiu pode estar quebrado, ou a página pode ter sido movida.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center gap-2 font-semibold transition-colors bg-[#0d9488] text-white shadow hover:bg-teal-700 h-11 rounded-xl px-6 text-base"
          >
            <Home className="w-4 h-4" />
            Voltar para o início
          </Link>
        </div>
      </main>

      <Footer minimal={true} />
    </div>
  );
}
