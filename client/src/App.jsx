import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Faq from './pages/Faq';
import ChatIa from './pages/ChatIa';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/duvidas" element={<Faq />} />
        <Route path="/chat" element={<ChatIa />} />
      </Routes>
    </BrowserRouter>
  );
}