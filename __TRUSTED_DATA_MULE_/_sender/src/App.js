import React, { useEffect, useState } from 'react';
import Web3 from "web3";
import DataMuleContract from "./contracts/DataMuleContract.json";
import * as ethUtil from 'ethereumjs-util';
import {Buffer} from 'buffer';


window.Buffer = Buffer;

function App() {

  // stato per memorizzare le info dell'account metamask (collegato alal blockhain locale)
  const [walletAddress, setWalletAddress] = useState("");
  
  // stato per memorizzare riferimenti al provider Web3 e al contratto rilasciato in ganache
  const [state, setState] = useState( {web3:null, contract:null});
  
  // funzione eseguita quando si renderizza l'app per
  useEffect(() =>{

    // si definisce un nuovo provider con i parametri delal chain gaanche locale 
    const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
    
    // definizione funzione per ottenere l'istanza del contratto DataMuleContract 
    async function getContractIstance(){
      const web3 = new Web3(provider);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = DataMuleContract.networks[networkId];
      console.log(deployedNetwork.address);
      
      const contract = new web3.eth.Contract(
        DataMuleContract.abi,
        deployedNetwork.address)
        
        // si salavano i riferimenti a web3 e al contratto nello stato dell'app
        setState({web3:web3, contract:contract});
      }
      

      // infine si richiama la funzione getContractIstance solamente se provider è stato definito correttamente
      provider && getContractIstance();
    }, []);

  
  // aggiornamento dello stato dei wallet
  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress]);



  // funzione che richiama metamask per collegare un account
  const connectWallet = async () => {
  
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      console.log("Please install MetaMask");
    }
  };

  // funzione per ottenere l'account attualmente connesso da Metamask
  const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      console.log("Please install MetaMask");
    }
  };

  // funzione utilizzata per registrarsi all'interno dello smart contract come sender
  async function registerAsSender(){
    const {contract} = state;

    /// si richiama la funzione per registrarsi come sender
    await contract.methods.registerAsSender().send({from: walletAddress});
    
    window.location.reload();
  }

  // Funzione utile a impostare un listener sul cambiamento di account di Metamaks
  const addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
      });
    } else {
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };

  // Funzione utile a generare la firma del messaggio 
  const signAndSendInTemp = async () => {
    
    // si legge il valore inserito dal sender nell'interfaccia
    let text = document.getElementById('value').value;

    // si concatena al testo l'indirizzo del messaggio inserendo il separatore
    text = text + "|||" + await getIndirizzoDestinatario();
    
    // si ottiene la chiave privata del sender 
    const stringPrivateKey = await getChiavePrivataSender();
    const privateKey = Buffer.from(stringPrivateKey, 'hex');


    // Si trasforma il messaggio in un array di byte
    const bufferMsg = Buffer.from(text);

    // Calcola l'hash a partire dal messaggio 
    const messageHash = ethUtil.keccak256(bufferMsg);

    // Firma l'hash del messaggio con la chiave privata
    const firma = ethUtil.ecsign(messageHash, privateKey);

    // Converti la firma in un formato accettabile dallo smart contract
    const signatureHex = `0x${firma.r.toString('hex')}${firma.s.toString('hex')}${firma.v.toString(16)}`;
    
    // si richiama il server locale per scrivere sul file
    const response_local_server = await fetch('http://localhost:3002/scriviMessaggioFirmaSuFile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text, signature: signatureHex })
    });

    // si stampa l'esito della chiamata
    if (response_local_server.ok) {
        console.log('SCRITTI FIRMA E MESSAGGIO SU FILE CON SCUCESSOS');
      } else {
        console.log('!! ERRORE DURANTE SCRITTURA SU FILE  !!');
      }
  }
 
  // funzione che richiama l'endpoint del server locale per leggere la chiave privata del sender
  const getChiavePrivataSender = async () => {
    
    // Richiesta al server per ottenere la chiave privata del mittente
    const response = await fetch('http://localhost:3002/getSenderPrivateKey');
    if (response.ok) {
      const senderPrivateKey = await response.text();
      console.log('Chiave privata del mittente ottenuta con successo:', senderPrivateKey);
      
      return senderPrivateKey;
    } else {
      console.error('Errore durante la richiesta della chiave privata del mittente');
    }
  }
  
  
  // funzione che richiama l'endpoint del server locale per leggere la l'indirizzo del destinatario
  const getIndirizzoDestinatario = async () => {
    const response = await fetch('http://localhost:3002/getRecipientAddress');
    if (response.ok) {
      const recipientAddress = await response.text();
      console.log('Indirizzo del destinatario ottenuto con successo:', recipientAddress);
      return recipientAddress;
    } else {
        console.error('Errore durante la richiesta dell\'indirizzo del destinatario');
    }
  }


  return (
    <div className="App" style={{ display: 'flex', flexDirection:"column", alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#e0e0e0' }}>
      <div style={{ backgroundColor: '#2196f3', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
        
        {/* bottone per connettersi ad account metamask */}
        <button onClick={connectWallet} className="material-button" style={{ marginBottom: '20px' }} disabled={walletAddress && walletAddress.length > 0} >
          {walletAddress && walletAddress.length > 0
            ? `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`
            : "Connect Wallet"}
        </button>


        {/* bottone per registrarsi come sender */}
        {walletAddress && walletAddress.length > 0
            ? <button onClick={registerAsSender} className="material-button" style={{ marginBottom: '20px' }} >Registrati come sender</button>
            : null}
      </div>


      {/* campi utili per l'invio dei messaggi */}
      { walletAddress && walletAddress.length > 0 ? 
          <div style={{ backgroundColor: '#2196f3', padding: '20px', marginTop: "20px", borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>    
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="text" id="value" style={{ marginRight: '10px', fontSize: '1rem', borderRadius: '5px', padding: '10px', border: '1px solid #ccc' }} />
                  <button className="material-button" onClick={signAndSendInTemp}>Send</button>
                </div>
          </div>
        : 
          null
      } 
    </div>
  );
  
}

export default App;
