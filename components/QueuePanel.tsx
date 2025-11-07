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
    <div className={`bg-neutral-900 rounded-lg border border-neutral-800 flex flex-col h-full transition-all duration-300 ease-in-out animate-slide-in-from-left ${isCollapsed ? 'w-16' : 'w-full'}`}>
        <div className={`p-4 flex items-center justify-between border-b border-neutral-800 ${isCollapsed ? 'flex-col' : ''}`}>
          <div className="flex items-center space-x-3">
              <SquareStackIcon className="w-6 h-6 text-neutral-400"/>
              {!isCollapsed && <h2 className="font-bold text-lg text-white">Camadas</h2>}
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400">
            <ChevronLeftIcon className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`flex-grow overflow-y-auto p-2 space-y-2 ${isCollapsed ? 'hidden' : ''}`}>
            {notifications.map(item => (
                <div 
                    key={item.id} 
                    onClick={() => setSelectedNotificationId(item.id)}
                    className={`p-2 rounded-md flex justify-between items-center text-left cursor-pointer transition-colors ${selectedNotificationId === item.id ? 'bg-primary-600/20' : 'hover:bg-neutral-800/50'}`}
                >
                    <div className="text-sm overflow-hidden pr-2">
                        <span className={`font-semibold block truncate ${selectedNotificationId === item.id ? 'text-primary-300' : 'text-neutral-100'}`}>{item.customBankName || item.bank}</span>
                        <span className={`block truncate text-xs ${selectedNotificationId === item.id ? 'text-primary-400' : 'text-neutral-400'}`}>{item.value} para {item.recipient}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeNotification(item.id); }} className="text-neutral-500 hover:text-red-500 flex-shrink-0">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
        
        <div className={`p-4 border-t border-neutral-800 space-y-2 ${isCollapsed ? 'hidden' : ''}`}>
             <button onClick={addNewNotification} className="w-full flex justify-center items-center px-4 py-2 border border-neutral-700 text-sm font-semibold rounded-md shadow-sm text-white bg-neutral-800 hover:bg-neutral-700 transition-colors">
                <PlusIcon className="w-5 h-5 mr-2" />
                Adicionar Nova
            </button>
            <button onClick={() => {}} className="w-full flex justify-center items-center px-4 py-2 border border-primary-500/30 text-sm font-semibold rounded-md shadow-sm text-primary-300 bg-primary-600/20 hover:bg-primary-600/30 transition-colors">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Adicionar com IA
            </button>
        </div>
    </div>
  );
};

export default QueuePanel;
