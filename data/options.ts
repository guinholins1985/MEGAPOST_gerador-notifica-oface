import { Bank, TransactionType } from "../types";

export const bankOptions: Bank[] = [
    'Nubank',
    'Itaú',
    'Bradesco',
    'Caixa',
    'Banco do Brasil',
    'Santander',
    'Inter',
    'Kiwify',
    'Hotmart',
    'Outro',
];

export const transactionTypeOptions: TransactionType[] = [
    'PIX Recebido',
    'PIX Enviado',
    'Débito',
    'Crédito',
    'Transferência',
    'Pagamento de Boleto',
    'Recarga de Celular',
    'Aplicação em Investimento',
    'Resgate de Investimento',
    'Rendimento',
];