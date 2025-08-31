import numbro from 'numbro';

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num: string | number | undefined, digits = 2, round = true) => {
  if (typeof num === 'string') {
    num = parseFloat(num);
  }

  //if (num === 0) return '$0.00';
  if (!num) return '-';
  /*if (num < 0.001 && digits <= 3) {
    return '<$0.001';
  }*/

  return numbro(num).formatCurrency({
    average: round,
    mantissa: num < 0.0001 ? 9 : num < 0.50 ? 4 : digits,
    abbreviations: {
      million: 'M',
      billion: 'B',
    },
  });
};

// using a currency library here in case we want to add more in future
export const formatAmount = (num: number | undefined, digits = 2) => {
  if (num === 0) return '0';
  if (!num) return '-';
  if (num < 0.001) {
    return '<0.001';
  }
  return numbro(num).format({
    average: true,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: 'M',
      billion: 'B',
    },
  });
};
