import React, { useEffect, useState } from 'react';
import Web3 from "web3";
import DataMuleContract from "./contracts/DataMuleContract.json";

function App() {

  // stato per memorizzare le info dell'account metamask (collegato alal blockhain locale)
  const [walletAddress, setWalletAddress] = useState("");

  
  // stato per memorizzare riferimenti a:
  // provider Web3 
  // contratto rilasciato in ganache
  // eventi emessi dal contratto
  const [state, setState] = useState( {web3:null, contract:null, events:null});
  
  // funzione eseguita quandio si renderizza l'app
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
      
        // Ottieni tutti gli eventi SendMessage dal contratto
        const events = await contract.getPastEvents('SendMessage', {
          fromBlock: 0,
          toBlock: 'latest'
        });

        // Stampa tutti i parametri degli eventi:
        console.log("eventi:")
        console.log(events);
        events.forEach((event) => {
          console.log("EVENTOOO")
          console.log("Messaggio: " + event.returnValues.message);
          console.log("Destinatario: " + event.returnValues.receiver);
        });

        // si salavano i riferimenti a web3 e al contratto nello stato dell'app
        setState({web3:web3, contract:contract, events:events});
      }
      
      

      // infine si richiama la funzione getContractIstance solamente se provider è valorizzato
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


  return (
    <div className="App" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#e0e0e0' }}>
      <div style={{ backgroundColor: '#2196f3', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
        
        {/* bottone per connettersi ad account metamask */}
        <button onClick={connectWallet} className="material-button" style={{ marginBottom: '20px' }} disabled={walletAddress && walletAddress.length > 0} >
          {walletAddress && walletAddress.length > 0
            ? `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`
            : "Connect Wallet"}
        </button>

        {/* Elementi di interfaccia per mostrare i messaggi ricevuti */}
        {state.events && state.events.map((event, index) => {
            return <p key={index}>Messaggio ricevuto: {event.returnValues.message}</p>
        })}
        
        
      </div>

    </div>
  );
  
}

export default App;
