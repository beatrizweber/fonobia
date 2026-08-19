import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Faq from './pages/Faq';
import ChatIa from './pages/ChatIa';
import ChatFono from './pages/ChatFono';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Atendimento from './pages/Atendimento';
import Admin from './pages/Admin';
import Perfil from './pages/Perfil';
import FonoDashboard from './pages/FonoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Impacto from './pages/Impacto';
import Sobre from './pages/Sobre';
import Privacidade from './pages/Privacidade';
import EsqueciSenha from './pages/EsqueciSenha';
import RedefinirSenha from './pages/RedefinirSenha';
import VerificarEmail from './pages/VerificarEmail';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/duvidas" element={<Faq />} />
        <Route path="/chat" element={<ChatIa />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/atendimento" element={<Atendimento />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/perfil" element={<Perfil />} /> 
        <Route path="/chat/:id" element={<ChatFono />} />
        <Route path="/painelfono" element={<FonoDashboard />} /> 
        <Route path="/paineladmin" element={<AdminDashboard />} />
        <Route path="/impacto" element={<Impacto />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/verificar-email" element={<VerificarEmail />} />

        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}