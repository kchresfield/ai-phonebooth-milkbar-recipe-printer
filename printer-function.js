import { ThermalPrinter, PrinterTypes, BreakLine } from 'node-thermal-printer';
import printerlib from 'printer'

import recipiesJson from './recipies-w-tags.json' assert { type: "json" };



const printRecipt = async function (name) {
    // console.log(printerlib.getPrinter('EPSON_TM_T20II'))
        let printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            breakLine: BreakLine.WORD,
            width:42
        });
        
        let recipe;
        
            for (let element of recipiesJson) {
                if (element.name === name) {
                  console.log("here's the recipe: ", element)
                  recipe = element;
                }
              }

        try {
             
            printer.alignCenter();
            await printer.printImage('./TTT-logo.png');

            printer.newLine();
            printer.newLine();

            
            printer.alignCenter();
            printer.setTextDoubleHeight();
            printer.bold('true');
            printer.println(recipe.name);
            printer.newLine();
            printer.newLine();
            printer.newLine();
            printer.newLine();
            printer.newLine();
            
            
            for (let ingredient of recipe.text) {
                printer.newLine();
                printer.alignLeft();
                printer.setTextNormal();
                printer.println(ingredient);
            }
                

                printer.alignCenter();
                printer.printQR(recipe.url, {
                    cellSize: 4, // 1 - 8
                    correction: "Q", // L(7%), M(15%), Q(25%), H(30%)
                    model: 2, // 1 - Model 1
                    // 2 - Model 2 (standard)
                    // 3 - Micro QR
                });

                printer.setTextNormal();
                printer.newLine();
                printer.println(
                    "Scan to view the recipe"
                );
                printer.newLine();
                printer.newLine();
                printer.drawLine();
                printer.newLine();
                printer.newLine();
            

            printer.cut();
             
            printerlib.printDirect({
            data: printer.getBuffer(),
            printer: 'EPSON_TM-T20II',
            type: 'RAW',
            success: function (jobID) {
                console.log(`printer job: ${jobID}`);
                printer.clear();
            },
            error: function (err) {
                console.log(err);
            }
        })

        } catch (error) {
            console.error('ERROR PRINTING', error);
            return false;
        }

}

// printRecipt("Summertime Skillet Cookie")

export default printRecipt;