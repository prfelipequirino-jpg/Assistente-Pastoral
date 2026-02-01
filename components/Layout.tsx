
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-emerald-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Assistente de Agenda</h1>
              <p className="text-xs text-emerald-100 opacity-80">WhatsApp Business + Google Calendar</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm font-medium">
            <span className="bg-emerald-500/30 px-3 py-1 rounded-full border border-emerald-400/50">Simulação Ativa</span>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>
      <footer className="bg-white border-t py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 - Sistema de Integração Inteligente para Pastores e Famílias</p>
        </div>
      </footer>
    </div>
  );
};
