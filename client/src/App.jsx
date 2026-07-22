import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Faq from './pages/Faq';
import ChatIa from './pages/ChatIa';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/duvidas" element={<Faq />} />
        <Route path="/chat" element={<ChatIa />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}