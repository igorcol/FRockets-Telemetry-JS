const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var fs = require('fs')
const readline = require('readline')
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const PORT  = 3
const BRATE = 9600
var temp = []
/*
Cria csvWriter, header e arquivo
*/
const dir = "./amostras"
CheckDir(dir)
const dataIndex = (fs.readdirSync(dir).length + 1)

const csvWriter = createCsvWriter({
    path: `${dir}/amostra${dataIndex}.csv`,
    header: [
        {id: 'x', title: "X_VALUES"},
        {id: 'y', title: "Y_VALUES"},
    ]
});

Main()




// MAIN FUNCTION
function Main() {
    console.log("Software Iniciado")
    ReadSerial(PORT, BRATE)
}

// Lê porta de comunicação
function ReadSerial(portId, baudRate) {
    const port = new SerialPort(`COM${portId}`, { baudRate: baudRate })
    const parser = new Readline()
    port.pipe(parser)

    // Main Loop
    parser.on("data", (data) => { 
        const splitDataArray = data.split(";") 
        // data = "6.44;1.87"
        // splitDataArray = [ '6.44', '1.87\r' ]
        const Xdata = String(splitDataArray[0]) // Eixo X gráfico | TEMPO  
        const Ydata = String(splitDataArray[1]) // Eixo Y gráfico | ALTURA 

        console.log(`${Xdata}  ||  ${Ydata.replace('\r', '')}`)
        
        SaveData([ 
            {x: Xdata, y: Ydata} 
        ])

        // PLOTAR GRAFICO

    });
}

// Exec before exit ( Ctrl + C )
process.on('SIGINT', () => {
    console.log("--SIGINT--")
    process.exit()
});
process.on('exit', () => {
    console.log("--EXIT--")
    console.log(temp)
});


// Salva dados no CSV 
async function SaveData(data) {
    await csvWriter.writeRecords(data)
}

// Cria diretório se não existir
function CheckDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
    return true
}