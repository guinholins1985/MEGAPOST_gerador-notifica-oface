export const formatCurrency = (value: string): string => {
    if (!value) return '';
    
    let numericValue = value.replace(/\D/g, '');
    
    if (numericValue === '') return '';

    let numberValue = parseFloat(numericValue) / 100;

    return numberValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};