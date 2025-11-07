export type Bank = 'Nubank' | 'Itaú' | 'Bradesco' | 'Caixa' | 'Banco do Brasil' | 'Santander' | 'Inter' | 'Kiwify' | 'Hotmart' | 'Outro';
export type TransactionType = 
  | 'PIX Recebido' 
  | 'PIX Enviado' 
  | 'Débito' 
  | 'Crédito' 
  | 'Transferência'
  | 'Pagamento de Boleto'
  | 'Recarga de Celular'
  | 'Aplicação em Investimento'
  | 'Resgate de Investimento'
  | 'Rendimento';

export interface NotificationData {
  id: string;
  bank: Bank;
  customBankName: string;
  customBankIcon: string | null;
  transactionType: TransactionType;
  value: string;
  recipient: string;
  time: string;
  wallpaper: string;
  phoneModel: string;
  statusBar: StatusBarSettings;
  presetName?: string;
}

export interface PhoneModel {
    name: string;
    width: number;
    height: number;
    bezel: number;
    notch: boolean;
}

export interface StatusBarSettings {
    time: string;
    signal: number;
    wifi: number;
    battery: number;
    color: 'white' | 'black';
}

export interface Preset {
  id: string;
  name: string;
  data: Omit<NotificationData, 'id' | 'value' | 'recipient' | 'time' | 'wallpaper' | 'phoneModel' | 'statusBar' | 'presetName'>;
}