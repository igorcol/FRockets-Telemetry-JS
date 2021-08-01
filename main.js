const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var fs = require('fs');

const ps = require("prompt-sync")
const prompt = ps()

/*
Cria csvWriter, header e arquivo
*/
const dir = "./amostras"
CheckDir(dir)
const dataIndex = (fs.readdirSync(dir).length + 1)

const csvWriter = createCsvWriter({
    path: `${dir}/amostra${dataIndex}.csv`,
    header: [
        {id: 'tempo', title: "TEMPO"},
        {id: 'altura', title: "ALTURA"},
        {id: 'lat', title: "LATITUDE"},
        {id: 'long', title: "LONGITUDE"},
        {id: 'recovery', title: "RECOVERY"},
    ]
});


// MAIN FUNCTION
function Main() {

    console.log("\nDigite o NÚMERO da porta de comunicação.")
    var port = prompt("> ")
    
    console.log("\nEscolha o BaudRate. \n1. 115200 \n2. 9600 \nOUTRO: Digite")
    var brate = prompt("> ")
    switch(brate) {
        case '1':
            brate = 115200
            break
        case '2':
            brate = 9600
            break
        default:
            brate = parseInt(brate)
    }

    console.log(`Software Iniciado na porta ${port} | BaudRate ${brate}`)
    ReadSerial(port, brate)
}

// Lê porta de comunicação
function ReadSerial(portId, baudRate) {
    const port = new SerialPort(`COM${portId}`, { baudRate: baudRate })
    const parser = new Readline()
    port.pipe(parser)

    // Main Loop
    parser.on("data", (data) => { // tempo;altura;recovery;lat;long
        const splitDataArray = data.split(";") 
        // data = "6.44;1.87"
        // splitDataArray = [ '6.44', '1.87\r' ]
        const TEMPO = parseInt(splitDataArray[0])    // Eixo X gráfico | TEMPO  
        const ALTURA = parseFloat(splitDataArray[1]) // Eixo Y gráfico | ALTURA 
        let RECOVERY = 0  
        let LAT = 0
        let LONG = 0

        if (splitDataArray > 2) {
            RECOVERY = String(splitDataArray[2])
            LAT = String(splitDataArray[3])
            LONG = String(splitDataArray[4])
        }

        console.log(
            `${TEMPO}  -  ${ALTURA} || ${LAT} - ${LONG} || ${RECOVERY}` 
        )
        
        SaveData([ 
            {
                tempo: TEMPO,
                altura: ALTURA,
                lat: LAT ,
                long: LONG,
                recovery: RECOVERY 
            } 
        ])

        // PLOTAR GRAFICO | Tempo X Altura

    });
}


// Exec before exit ( Ctrl + C )
process.on('SIGINT', () => {
    console.log("--| SOFTWARE INTERROMPIDO |--")
    process.exit()
});


// Save data in CSV file
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



Main()