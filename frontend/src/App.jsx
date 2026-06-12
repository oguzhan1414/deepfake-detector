import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import AnalyzePage from './pages/AnalyzePage/AnalyzePage';

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/analyze" element={<Layout><AnalyzePage /></Layout>} />
        <Route path="/model"  element={<Layout><HomePage /></Layout>} />
        <Route path="/about"  element={<Layout><HomePage /></Layout>} />
        <Route path="*"       element={<Layout><HomePage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
