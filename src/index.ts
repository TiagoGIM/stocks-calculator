import * as path from 'path';
import * as Excel from 'exceljs';

enum OperationKind {
  BUY = 'Compra',
  SELL = 'Venda',
}

interface Trade {
  date: string;
  operation_kind: OperationKind;
  symbol: string;
  quantity: number;
  value: number;
  amount: number;
}

const workbook = new Excel.Workbook();

const filePath = path.resolve(__dirname, 'assets/b3/carteira-export.xlsx');

const trades: Trade[] = [];

workbook.xlsx
  .readFile(filePath)
  .then(() => {
    const worksheet = workbook.getWorksheet(1); // first sheet
    worksheet.eachRow((row) => {
      const rowData = row.values;

      if (Array.isArray(rowData)) {
        const quantity = customParseInt(rowData[5]);
        const value = customParseFloat(rowData[6]);

        const trade: Trade = {
          date: rowData[1] as string,
          operation_kind: rowData[4] === 'V' ? OperationKind.SELL : OperationKind.BUY,
          symbol: rowData[3] as string,
          quantity,
          value,
          amount: parseAmount(quantity, value),
        };

        trades.push(trade);
      }
    });
    console.log(trades);

    const symbolMap = trades.reduce(
      (acc, trade) => {
        if (trade.operation_kind === OperationKind.BUY) {
          if (!acc[trade.symbol]) {
            acc[trade.symbol] = {
              totalAmount: 0,
              totalQuantity: 0,
            };
          }

          acc[trade.symbol].totalAmount += trade.amount;
          acc[trade.symbol].totalQuantity += trade.quantity;
        }

        return acc;
      },
      {} as Record<string, { totalAmount: number; totalQuantity: number }>,
    );

    const symbolAverages = Object.keys(symbolMap).map((symbol) => {
      const { totalAmount, totalQuantity } = symbolMap[symbol];
      const averagePrice = totalQuantity > 0 ? (totalAmount / totalQuantity).toFixed(2) : 0;

      return {
        symbol,
        averagePrice,
      };
    });

    console.log(symbolAverages);
  })
  .catch((error) => {
    console.error('Something wrong happen trying open the file', error);
  });

function customParseInt(value: any): number {
  const floatValue = customParseFloat(value);
  return Math.round(floatValue);
}

function customParseFloat(value: any): number {
  const floatValue = parseFloat(value.replace(',', '.'));
  return Math.round(floatValue * 100) / 100;
}

function parseAmount(quantity: number, value: number): number {
  return Math.round(quantity * value * 100) / 100;
}
