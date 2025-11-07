import React from 'react';
import { NotificationData, Bank } from '../types';
import { formatCurrency } from '../utils/formatters';

const BankIcons: Record<Bank, string> = {
    Nubank: 'https://logospng.org/download/nubank/logo-nubank-icon-1024.png',
    Inter: 'https://logodownload.org/wp-content/uploads/2019/08/banco-inter-logo-5.png',
    'C6 Bank': 'https://logodownload.org/wp-content/uploads/2020/11/c6-bank-logo-1.png',
    PicPay: 'https://logodownload.org/wp-content/uploads/2018/05/picpay-logo-2-1.png',
    'Mercado Pago': 'https://logodownload.org/wp-content/uploads/2018/05/mercado-pago-logo-01.png',
    PagBank: 'https://logodownload.org/wp-content/uploads/2021/08/pagbank-logo-1.png',
    Itaú: 'https://logodownload.org/wp-content/uploads/2014/06/itau-logo-0.png',
    Bradesco: 'https://logodownload.org/wp-content/uploads/2014/05/bradesco-logo-0-1.png',
    Santander: 'https://logodownload.org/wp-content/uploads/2014/11/santander-logo-1.png',
    Caixa: 'https://logodownload.org/wp-content/uploads/2014/02/caixa-logo-0.png',
    'Banco do Brasil': 'https://logodownload.org/wp-content/uploads/2014/05/banco-do-brasil-logo-0.png',
    Sicoob: 'https://logodownload.org/wp-content/uploads/2018/09/sicoob-logo-01.png',
    Sicredi: 'https://logodownload.org/wp-content/uploads/2019/09/sicredi-logo-1.png',
    Original: 'https://logodownload.org/wp-content/uploads/2017/05/banco-original-logo-01.png',
    Neon: 'https://logodownload.org/wp-content/uploads/2018/11/neon-logo-01.png',
    Next: 'https://logodownload.org/wp-content/uploads/2018/04/next-logo-01.png',
    'Will Bank': 'https://logodownload.org/wp-content/uploads/2021/09/will-bank-logo-01.png',
    'BTG Pactual': 'https://logodownload.org/wp-content/uploads/2018/09/btg-pactual-logo-01.png',
    'XP Investimentos': 'https://logodownload.org/wp-content/uploads/2018/04/xp-investimentos-logo-01.png',
    Ágora: 'https://logodownload.org/wp-content/uploads/2020/09/agora-investimentos-logo-01.png',
    Genial: 'https://logodownload.org/wp-content/uploads/2021/09/genial-investimentos-logo-01.png',
    ModalMais: 'https://logodownload.org/wp-content/uploads/2019/09/modalmais-logo-01.png',
};

const CustomIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34D399"/>
    </svg>
);


const getTransactionMessage = (type: string, recipient: string, amount: number) => {
    const formattedAmount = formatCurrency(amount);
    switch(type) {
        case 'Pix - Recebido':
            return `Você recebeu um Pix de ${recipient}.`;
        case 'Venda Aprovada':
            return `Venda no valor de ${formattedAmount} para ${recipient}.`;
        case 'Pagamento Recebido':
             return `Pagamento de ${recipient} no valor de ${formattedAmount}.`;
        default:
            return `${type} no valor de ${formattedAmount}`;
    }
};

const NotificationPreview: React.FC<{ notification: NotificationData }> = ({ notification }) => {
    const { appName, transactionType, amount, recipient, customAppIcon, timestamp } = notification;

    const iconSrc = customAppIcon || BankIcons[appName] || null;

    return (
    <div className="bg-[#2a2a2a] text-white p-3 rounded-2xl max-w-sm mx-auto shadow-lg mb-2 flex items-start space-x-3">
      <div className="w-10 h-10 bg-[#10B981] rounded-lg flex items-center justify-center flex-shrink-0">
         <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
            <rect x="2" y="9" width="4" height="12"/>
            <circle cx="4" cy="4" r="2"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
            <p className="font-bold text-base truncate">{transactionType}</p>
            <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{timestamp}</p>
        </div>
        <p className="text-sm text-gray-300">Valor: {formatCurrency(amount)}</p>
      </div>
    </div>
  );
};

export default NotificationPreview;
