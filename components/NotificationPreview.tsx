import React from 'react';
import { NotificationData } from '../types';

const NotificationPreview: React.FC<{ data: NotificationData }> = ({ data }) => {
    const bankDetails = getBankDetails(data);
    
    return (
        <div className="p-2 w-full mt-10">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-lg flex items-start space-x-3 border border-black/10">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  {bankDetails.icon.startsWith('data:') || bankDetails.icon.startsWith('http') ? (
                     <img 
                        src={bankDetails.icon} 
                        alt={bankDetails.name} 
                        className="w-full h-full object-contain bg-white p-0.5" 
                      />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-800 font-bold text-xl">
                      {bankDetails.icon}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                        <h3 className={`font-semibold text-base truncate text-neutral-900`}>{bankDetails.name}</h3>
                        <span className="text-sm text-neutral-600 flex-shrink-0 ml-2">{data.time}</span>
                    </div>
                    <p className="text-base text-neutral-800 mt-1">
                        {getMessage(data)}
                    </p>
                </div>
            </div>
        </div>
    );
};

const getBankDetails = (data: NotificationData) => {
    const domainMap: { [key in Exclude<NotificationData['bank'], 'Outro'>]: string } = {
        'Nubank': 'nubank.com.br',
        'Itaú': 'itau.com.br',
        'Bradesco': 'bradesco.com.br',
        'Caixa': 'caixa.gov.br',
        'Banco do Brasil': 'bb.com.br',
        'Santander': 'santander.com.br',
        'Inter': 'bancointer.com.br',
        'Kiwify': 'kiwify.com.br',
        'Hotmart': 'hotmart.com',
    };
    
    if (data.bank === 'Outro') {
        return { 
            icon: data.customBankIcon || (data.customBankName || 'B').charAt(0), 
            name: data.customBankName || 'Banco' 
        };
    }
    
    return { 
        icon: `https://logo.clearbit.com/${domainMap[data.bank]}`, 
        name: data.bank 
    };
};

const getMessage = (data: NotificationData): React.ReactNode => {
    const value = <strong>{data.value}</strong>;
    const recipient = <strong>{data.recipient}</strong>;

    switch (data.transactionType) {
        case 'PIX Recebido': return <>Você recebeu um Pix de {recipient} no valor de {value}.</>;
        case 'PIX Enviado': return <>Pix de {value} enviado para {recipient}.</>;
        case 'Débito': return <>Compra de {value} no débito em {recipient}.</>;
        case 'Crédito': return <>Compra de {value} no crédito em {recipient}.</>;
        case 'Transferência': return <>Transferência de {value} recebida de {recipient}.</>;
        case 'Pagamento de Boleto': return <>Pagamento de boleto no valor de {value} para {recipient}.</>;
        case 'Recarga de Celular': return <>Recarga de celular de {value} para {recipient} realizada.</>;
        case 'Aplicação em Investimento': return <>Aplicação de {value} em {recipient}.</>;
        case 'Resgate de Investimento': return <>Resgate de {value} de {recipient}.</>;
        case 'Rendimento': return <>Seu saldo rendeu {value} em {recipient}.</>;
        default: return '';
    }
};

export default NotificationPreview;