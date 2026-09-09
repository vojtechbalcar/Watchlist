// Illustrative monthly returns, not dated market history or live price data.
const stockReturns = [0, 2.2, 3.9, 3.1, 6.5, 8.7, 7.6, 11.2, 13.8, 12.9, 15.4, 17.2, 18.7];
const benchmarkReturns = [0, 2.8, 4.8, 4, 7.8, 10.1, 9.7, 13.4, 16, 15.7, 18.2, 20.1, 22.1];
const stockReturn = stockReturns[stockReturns.length - 1];
const benchmarkReturn = benchmarkReturns[benchmarkReturns.length - 1];

export const landingComparison = {
  stockReturns,
  benchmarkReturns,
  stockReturn,
  benchmarkReturn,
  gapPp: Math.round((stockReturn - benchmarkReturn) * 10) / 10,
};
