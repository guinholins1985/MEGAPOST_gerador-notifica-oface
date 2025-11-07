import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NotificationData } from '../types';
import { TrashIcon, ArrowDownTrayIcon, PlusIcon, SparklesIcon, ChevronLeftIcon, SquareStackIcon } from './icons';
import html2canvas from 'html2canvas';

interface QueuePanelProps {
  notifications: NotificationData[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationData[]>>;
  selectedNotificationId: string | null;
  setSelectedNotificationId: React.Dispatch<React.SetStateAction<string | null>>;
}

const QueuePanel: React.FC<QueuePanelProps> = ({ notifications, setNotifications, selectedNotificationId, setSelectedNotificationId }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const addNewNotification = () => {
    const newNotification: NotificationData = {
        ...(notifications.find(n => n.id === selectedNotificationId) || notifications[0] || {}),
        id: uuidv4(),
        value: 'R$ 0,00',
        recipient: 'Novo Contato',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications(prev => [...prev, newNotification]);
    setSelectedNotificationId(newNotification.id);
  };
  
  const removeNotification = (id: string) => {
    setNotifications(prev => {
        const newQueue = prev.filter(item => item.id !== id);
        if (selectedNotificationId === id) {
            setSelectedNotificationId(newQueue.length > 0 ? newQueue[0].id : null);
        }
        return newQueue;
    });
  };

  const downloadImage = () => {
    const element = document.getElementById('phone-simulator-for-download');
    if (element) {
        html2canvas(element, { 
            backgroundColor: null, 
            useCORS: true, 
            scale: 2,
            onclone: (doc) => {
                const clone = doc.getElementById('phone-simulator-for-download');
                if (clone) clone.style.transform = 'scale(1)';
            }
        }).then(canvas => {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = 'notificacao.png';
            link.click();
        }).catch(err => {
            console.error("Erro ao gerar imagem:", err);
            alert("Não foi possível gerar a imagem. Se estiver usando um papel de parede da lista, tente fazer upload de uma imagem ou usar um papel de parede padrão, pois pode ser um erro de CORS.");
        });
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-neutral-200 flex flex-col h-full transition-all duration-300 ease-in-out animate-slide-in-from-left shadow-medium ${isCollapsed ? 'w-16' : 'w-full'}`}>
        <div className={`p-4 flex items-center justify-between border-b border-neutral-200`}>
          <div className={`flex items-center space-x-3 overflow-hidden transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              <SquareStackIcon className="w-6 h-6 text-neutral-500 flex-shrink-0"/>
              <h2 className="font-bold text-xl text-primary-700 whitespace-nowrap">Camadas</h2>
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-md hover:bg-neutral-200 text-neutral-500">
            <ChevronLeftIcon className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`flex-grow overflow-y-auto p-2 space-y-2 custom-scrollbar ${isCollapsed ? 'hidden' : ''}`}>
            {notifications.map(item => (
                <div 
                    key={item.id} 
                    onClick={() => setSelectedNotificationId(item.id)}
                    className={`p-2 rounded-md flex justify-between items-center text-left cursor-pointer transition-colors ${selectedNotificationId === item.id ? 'bg-primary-50' : 'hover:bg-neutral-100'}`}
                >
                    <div className="overflow-hidden pr-2">
                        <span className={`font-semibold text-base block truncate ${selectedNotificationId === item.id ? 'text-primary-700' : 'text-neutral-800'}`}>{item.customBankName || item.bank}</span>
                        <span className={`block truncate text-sm ${selectedNotificationId === item.id ? 'text-primary-600' : 'text-neutral-500'}`}>{item.value} para {item.recipient}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeNotification(item.id); }} className="text-neutral-400 hover:text-red-500 flex-shrink-0">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
        
        <div className={`p-4 border-t border-neutral-200 space-y-2 ${isCollapsed ? 'hidden' : ''}`}>
             <button onClick={addNewNotification} className="w-full flex justify-center items-center px-4 py-2 border border-neutral-300 text-sm font-semibold rounded-md shadow-soft text-neutral-700 bg-white hover:bg-neutral-100 transition-colors">
                <PlusIcon className="w-5 h-5 mr-2" />
                Adicionar Nova
            </button>
            <button onClick={() => {}} className="w-full flex justify-center items-center px-4 py-2 border border-primary-500/30 text-sm font-semibold rounded-md shadow-soft text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Adicionar com IA
            </button>
        </div>
    </div>
  );
};

export default QueuePanel;