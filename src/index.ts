import * as path from 'path';
import * as Excel from 'exceljs';

type Trade = {
  date: String, // '19/08/2020'
  operation_kind : String, // 'Compra'
  symbol: String, //'TAEE11F',
  quantity: number, //10,
  value: number, //28.12,
  amount: number //281.2
}

const workbook = new Excel.Workbook();

const filePath = path.resolve(__dirname, 'assets/b3/negociacao-2021.xlsx');

let trades : Trade[] = []

workbook.xlsx.readFile(filePath)
    .then(() => {
        const worksheet = workbook.getWorksheet(1); // first sheet
        worksheet.eachRow((row, rowNumber) => {

          const rowData = row.values;

          if (Array.isArray(rowData)){
          const trade: Trade = {
            date: rowData[1]  as String,
            operation_kind:rowData[2] as String,
            symbol: rowData[6] as String, 
            quantity: rowData[7] as number,  
            value: rowData[8] as number,         
            amount: rowData[9] as number
          };
      
          trades.push(trade);
        }
      });

      console.log(trades)

    })
    .catch(error => {
        console.error('Erro ao ler o arquivo:', error);
    });
