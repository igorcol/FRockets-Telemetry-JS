const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const csvWriter = createCsvWriter({
    path: "./amostras/file.csv",
    header: [
        {id: 'x', title: "X_VALUES"},
        {id: 'y', title: "y_VALUES"},
    ]
})


// Main
console.log("Software Iniciado")
ReadSerial(3, 9600)


// Lê porta de comunicação
function ReadSerial(portId, baudRate) {
    const port = new SerialPort(`COM${portId}`, { baudRate: baudRate })
    
    const parser = new Readline()
    port.pipe(parser)
    
    const records = []
    // LOOP 
    parser.on("data", (data) => { // "6.44;1.87"
        const splitDataArray = data.split(";") // [ '6.44', '1.87\r' ]
        
        const Xdata = splitDataArray[0]
        const Ydata = splitDataArray[1]

        console.log(`${Xdata}  ||  ${Ydata.replace('\r', '')}`)

        records.push(
            {x: Xdata, y: Ydata},
        )
        

        console.log(records)
        SaveData(records)
    });
}

// Salva dados no CSV 
function SaveData(data) {
    csvWriter.writeRecords(data)
}