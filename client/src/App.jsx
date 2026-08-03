import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Faq from './pages/Faq';
import ChatIa from './pages/ChatIa';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Atendimento from './pages/Atendimento';
import Admin from './pages/Admin';
import Perfil from './pages/Perfil'; // 🟢 1. Adicionado import da página Perfil

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
        <Route path="/perfil" element={<Perfil />} /> {/* 🟢 2. Adicionada a rota /perfil */}

        {/* Rota coringa de fallback (sempre fica por último) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}