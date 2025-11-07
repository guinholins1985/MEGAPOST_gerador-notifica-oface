import React from 'react';
import { NotificationData } from '../types';
import { formatCurrency } from '../utils/formatters';

interface NotificationPreviewProps {
  notification: NotificationData;
}

export const NotificationPreview: React.FC<NotificationPreviewProps> = ({ notification }) => {
  const { appName, transactionType, amount, recipient, customAppIcon, timestamp } = notification;

  const formattedAmount = formatCurrency(amount);

  const generateNotificationText = () => {
    switch (transactionType) {
      case 'Pix - Enviado':
        return `Você enviou um Pix de ${formattedAmount} para ${recipient}.`;
      case 'Pix - Recebido':
        return `Você recebeu um Pix de ${formattedAmount} de ${recipient}.`;
      case 'Venda Aprovada':
        return `Venda de ${formattedAmount} para ${recipient} aprovada.`;
      case 'Pagamento Recebido':
        return `Pagamento de ${recipient} no valor de ${formattedAmount} recebido.`;
      case 'Pagamento de Boleto':
        return `Boleto de ${formattedAmount} para ${recipient} pago com sucesso.`;
      case 'Compra Online Aprovada':
        return `Compra em ${recipient} no valor de ${formattedAmount} aprovada.`;
      case 'Estorno Recebido':
        return `Estorno de ${formattedAmount} de ${recipient} recebido.`;
      case 'Cashback Recebido':
        return `Você recebeu ${formattedAmount} de cashback de ${recipient}.`;
      case 'Rendimentos da Conta':
        return `Seus rendimentos de ${formattedAmount} já estão na sua conta.`;
      case 'Débito Automático':
        return `Pagamento de ${formattedAmount} para ${recipient} em débito automático.`;
      case 'Depósito Realizado':
        return `Depósito de ${formattedAmount} recebido de ${recipient}.`;
      case 'Saque Efetuado':
        return `Saque de ${formattedAmount} efetuado.`;
      default:
        return `${transactionType} - ${formattedAmount} - ${recipient}`;
    }
  };

  const notificationText = generateNotificationText();
  
  const AppIcon = () => {
    if (customAppIcon) {
      return <img src={customAppIcon} alt={`${appName} icon`} className="w-5 h-5 rounded-md object-contain" />;
    }
    const initial = appName.charAt(0);
    return (
      <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
        {initial}
      </div>
    );
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-lg p-3 text-black dark:text-white">
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1.5">
            <AppIcon />
            <span className="font-semibold text-gray-800 dark:text-gray-200">{appName}</span>
        </div>
        <span className="text-gray-500 dark:text-gray-400">{timestamp}</span>
      </div>
      <div>
        <p className="font-bold text-sm">{transactionType}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{notificationText}</p>
      </div>
    </div>
  );
};
