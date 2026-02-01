
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { analyzeMessage } from './services/geminiService';
import { CalendarEvent, EventCategory, MessageAnalysis } from './types';

// Mock initial data
const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Culto de Domingo',
    category: EventCategory.PASTORAL,
    startDate: new Date(new Date().setHours(18, 0)).toISOString(),
    endDate: new Date(new Date().setHours(20, 0)).toISOString(),
    rawMessage: 'Lembrar do culto amanhã às 18h',
    status: 'synced'
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [messages, setMessages] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notifications, setNotifications] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  // Connection States
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotifications({ msg, type });
    setTimeout(() => setNotifications(null), 3000);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;
    if (!isWhatsAppConnected) {
      showNotification("Conecte o WhatsApp nas configurações primeiro!", 'error');
      return;
    }

    const msg = currentInput;
    setCurrentInput('');
    setMessages(prev => [...prev, msg]);
    setIsAnalyzing(true);

    try {
      const analysis: MessageAnalysis = await analyzeMessage(msg);
      
      if (analysis.isEvent) {
        const start = new Date(`${analysis.date}T${analysis.startTime}`);
        const end = new Date(`${analysis.date}T${analysis.endTime}`);

        const newEvent: CalendarEvent = {
          id: Math.random().toString(36).substr(2, 9),
          title: analysis.title,
          category: analysis.category,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          rawMessage: msg,
          status: 'pending'
        };

        setEvents(prev => [newEvent, ...prev]);
        showNotification(`Evento detectado: ${analysis.title}`, 'success');
      } else {
        showNotification("A mensagem não parece ser um agendamento.", 'error');
      }
    } catch (error) {
      console.error(error);
      showNotification("Erro ao processar mensagem.", 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const syncToGoogle = (id: string) => {
    if (!isGoogleConnected) {
      showNotification("Conecte sua conta Google primeiro!", 'error');
      setActiveTab('settings');
      return;
    }
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'synced' } : e));
    showNotification("Evento gravado no Google Calendar com sucesso!", 'success');
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <Layout>
      {notifications && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-xl text-white transition-all transform ${notifications.type === 'success' ? 'bg-emerald-500' : 'bg-red-500 animate-bounce'}`}>
          {notifications.msg}
        </div>
      )}

      {/* Connection Status Bar */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap ${isWhatsAppConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isWhatsAppConnected ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
          WhatsApp: {isWhatsAppConnected ? 'Conectado' : 'Desconectado'}
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap ${isGoogleConnected ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isGoogleConnected ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          Google Calendar: {isGoogleConnected ? 'Vinculado' : 'Não Vinculado'}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === 'dashboard' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Painel de Controle
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === 'settings' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Configurações e Integrações
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Message Simulation */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border p-6 flex-1 flex flex-col h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                  Mensagens Recebidas
                </h2>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Simulador API</span>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                {!isWhatsAppConnected ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-4">
                    <p className="mb-4">Conecte o WhatsApp para começar a processar mensagens.</p>
                    <button onClick={() => setActiveTab('settings')} className="text-emerald-600 font-bold hover:underline">Ir para Configurações</button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-4">
                    <p>Simule uma mensagem do WhatsApp Business abaixo.</p>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className="flex justify-start">
                      <div className="bg-emerald-100 text-emerald-900 px-4 py-2 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm relative">
                        <p className="text-sm">{m}</p>
                        <span className="text-[10px] opacity-50 block text-right mt-1">Agora</span>
                      </div>
                    </div>
                  ))
                )}
                {isAnalyzing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-none flex gap-1 items-center">
                      <span className="text-xs text-gray-500 mr-2 italic">IA analisando</span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  disabled={!isWhatsAppConnected}
                  placeholder={isWhatsAppConnected ? "Digite para simular o recebimento..." : "WhatsApp desconectado"}
                  className="w-full border border-gray-200 rounded-2xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm disabled:bg-gray-50"
                  rows={3}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isAnalyzing || !isWhatsAppConnected}
                  className="absolute right-3 bottom-3 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:bg-gray-300 transition-colors shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Calendar Events */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border p-6 min-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Fila de Agendamentos</h2>
                <div className="flex gap-2 text-xs">
                  <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded">Aguardando Confirmação</span>
                </div>
              </div>

              <div className="space-y-4">
                {events.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    Aguardando mensagens para identificar eventos...
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className={`p-4 rounded-xl border-l-4 transition-all hover:shadow-md bg-white ${event.status === 'synced' ? 'border-emerald-500 bg-emerald-50/20' : 'border-amber-500 bg-amber-50/20 shadow-sm'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              event.category === EventCategory.PASTORAL ? 'bg-blue-100 text-blue-700' : 
                              event.category === EventCategory.FAMILIAR ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {event.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900">{event.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1 font-medium text-emerald-700">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                              {new Date(event.startDate).toLocaleDateString('pt-BR')} às {new Date(event.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-gray-400 hidden sm:inline">|</span>
                            <span className="italic text-gray-400 text-xs line-clamp-1">"{event.rawMessage}"</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          {event.status === 'pending' ? (
                            <button 
                              onClick={() => syncToGoogle(event.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-lg transition-colors font-bold whitespace-nowrap"
                            >
                              Gravar na Agenda
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-100 px-3 py-1.5 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                              No Google
                            </span>
                          )}
                          <button 
                            onClick={() => deleteEvent(event.id)}
                            className="text-gray-400 hover:text-red-500 text-xs px-2 py-1 transition-colors text-right"
                          >
                            Descartar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Settings Tab */
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Configurar Conexões
            </h3>
            
            <div className="space-y-8">
              {/* WhatsApp Config */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-xl border border-emerald-100 bg-emerald-50/30 gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-600 p-3 rounded-lg text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">WhatsApp Business API</h4>
                    <p className="text-sm text-gray-500">Conecte seu número para monitorar mensagens em tempo real.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsWhatsAppConnected(!isWhatsAppConnected)}
                  className={`px-6 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${isWhatsAppConnected ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'}`}
                >
                  {isWhatsAppConnected ? 'Desconectar' : 'Conectar via API'}
                </button>
              </div>

              {/* Google Config */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-xl border border-blue-100 bg-blue-50/30 gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-lg text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Google Calendar</h4>
                    <p className="text-sm text-gray-500">Autorize o assistente a criar eventos em sua conta Google.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsGoogleConnected(!isGoogleConnected)}
                  className={`px-6 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${isGoogleConnected ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
                >
                  {isGoogleConnected ? 'Remover Acesso' : 'Vincular Conta Google'}
                </button>
              </div>

              {/* Tag Mappings */}
              <div className="pt-6 border-t">
                <h4 className="font-bold text-gray-900 mb-4">Mapeamento de Etiquetas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Agenda Pastoral</label>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      Calendário: <span className="font-medium">agenda.pastoral@igreja.org</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Evento Familiar</label>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      Calendário: <span className="font-medium">familia.silva@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
             <h4 className="font-bold text-gray-900 mb-2">Como funciona a automação?</h4>
             <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
               Quando você recebe uma mensagem e a "marca" (via webhook ou encaminhamento), nosso motor de IA processa o texto, extrai os detalhes e envia para cá. Após sua revisão rápida, o evento vai direto para o Google Calendar sob a etiqueta certa.
             </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
