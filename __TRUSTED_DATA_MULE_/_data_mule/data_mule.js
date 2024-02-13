const Web3 = require('web3').default;
const fetch = require('node-fetch-npm'); 
const DataMuleContract = require('./contracts/DataMuleContract.json');
const { Buffer } = require('buffer');
const ethUtil = require('ethereumjs-util'); 


const provider = "HTTP://127.0.0.1:7545";
const web3 = new Web3(provider);



let contract;


// funzione che ottiene l'stanza del contratto distribuito in ganache
async function getContractInstance() {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = DataMuleContract.networks[networkId];
    
    contract = new web3.eth.Contract(
        DataMuleContract.abi,
        deployedNetwork.address
        );
    }
    
// metodo per leggere l'indirizzo del data mule dal 
//  file data_mule_address.txt tramite il server locale
async function getDataMuleAddress() {

    // si contatta il server locale 
    const response = await fetch('http://localhost:3002/getDataMuleAddress');
    
    // stampa e result dell'esito
    if (response.ok) {
        const dataMuleAddress = await response.text();
        console.log('Indirizzo Data Mule ottenuto con successo:', dataMuleAddress);
        return dataMuleAddress;
    } else {
        console.error('Errore durante la richiesta dell\'indirizzo Data Mule');
    }
}


// funzione che invia messaggi (se ci sono) allo smart contract 
async function fetchDataAndVerify() {
    const response_local_server = await fetch('http://localhost:3002/leggiMessaggioFirmaDaFile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });

    // 
    if (response_local_server.ok) {
        const { message, signature } = await response_local_server.json();
        
        
        console.log('-- Dati letti da file: --', message);
        console.log('Messaggio:', message);
        console.log('FirmaHex:', signature);
        const signature_da_file = {
            r: Buffer.from(signature.slice(2, 66), 'hex'),
            s: Buffer.from(signature.slice(66, 130), 'hex'),
            v: parseInt(signature.slice(130, 132), 16)
        };
        console.log('Firma:', signature_da_file);
        
        
        // si suddivide il messaggio per inviarlo allo smart contract
        let parts = message.split('|||');
        
        // si ottengono le due informazioni separate
        let text = parts[0];
        let addressDestinatario = parts[1];
        
        // si inoltra il messaggio allo SMART CONTRACT
        const dataMuleAddress = await getDataMuleAddress();
        const response_contract = await contract.methods.verify(text, addressDestinatario, signature).send({from: dataMuleAddress});
        
        console.log(response_contract);
        
    } else {
        console.error('Nessun messaggio trovato');
    }
}


async function main() {
    await getContractInstance();

    const dataMuleAddress = await getDataMuleAddress();
    console.log("Data mule address:");
    console.log(dataMuleAddress);

    // Esegui fetchDataAndVerify ogni tot secondi
    setInterval(fetchDataAndVerify, 5000); 
}

main().catch(console.error);
