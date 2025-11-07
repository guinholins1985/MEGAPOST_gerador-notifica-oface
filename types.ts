import React from 'react';

export interface CSSProperties extends React.CSSProperties {}

export interface PhoneModel {
  id: string;
  name: string;
  styles: {
    frame: CSSProperties;
    screen: CSSProperties;
    notch?: CSSProperties;
  };
}

export interface StatusBarSettings {
  time: string;
  wifi: boolean;
  signal: number;
  battery: number;
  color: 'white' | 'black';
}

export type Bank = 
  | 'Nubank' | 'Inter' | 'C6 Bank' | 'PicPay' | 'Mercado Pago' | 'PagBank' 
  | 'Itaú' | 'Bradesco' | 'Santander' | 'Caixa' | 'Banco do Brasil' | 'Sicoob'
  | 'Sicredi' | 'Original' | 'Neon' | 'Next' | 'Will Bank' | 'BTG Pactual'
  | 'XP Investimentos' | 'Ágora' | 'Genial' | 'ModalMais' | 'Kiwify' | 'Hotmart';

export type TransactionType =
  | 'Pix - Enviado'
  | 'Pix - Recebido'
  | 'Venda Aprovada'
  | 'Pagamento Recebido'
  | 'Pagamento de Boleto'
  | 'Compra Online Aprovada'
  | 'Estorno Recebido'
  | 'Cashback Recebido'
  | 'Rendimentos da Conta'
  | 'Débito Automático'
  | 'Depósito Realizado'
  | 'Saque Efetuado';

export interface NotificationData {
  id: string;
  appName: Bank;
  transactionType: TransactionType;
  amount: number;
  recipient: string;
  customAppIcon?: string | null;
  timestamp: string;
}