// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// npm install @openzeppelin/contracts@4.2.0


contract DataMuleContract {
    
    using ECDSA for bytes32;
    
    
    // lista di indirizzi dei sender
    address[] private senderList;

    // Definizione della struttura dati
    mapping(address => uint) public dataMuleTokenCount;

    // evento utile a inviare il messaggio al destinatario
    event SendMessage(string message, string receiver);


    // funzione che consente a un utente di registrarsi come sender
    function registerAsSender() public {
        senderList.push(msg.sender);
    }

    
    // Funzione per inserire un nuovo indirizzo in dataMuleTokenCount
    function insertAddress(address _address) private {

        // Aggiunge l'indirizzo alla struttura con token_count = 0 
        // se non era stato inserito precedentemente 
        if (dataMuleTokenCount[_address] == 0){
            dataMuleTokenCount[_address] = 0;
        }
    }


    // Funzione per asseganre un token a un certo indirizzo di un DataMule
    function incrementTokenCount(address _address) private {
        
        // Si dà per scontato che l'indirizzo sia già nel mapping
        // Aumenta di 1 il token_count dell'indirizzo
        dataMuleTokenCount[_address] ++;

    }


    // Verifica la firma del messaggio e invia i messaggio al destinatario
    function verify(string memory message, string memory recipient, bytes memory signature) public returns (bool)  {

        // si riconcatenano le due parti del messaggio in modo da 
        // riottenere il formato in cui è stato firmato il dato
        string memory concatenatedMessage = append(message, recipient);

        // Calcola l'hash dei dati da verificare
        bytes32 hash = keccak256(abi.encodePacked(concatenatedMessage));

        // Recupera l'indirizzo dell'utente che ha generato la firma
        address signer = hash.recover(signature);

        // si verifica che ci siano signer registrati
        assert(senderList.length > 0);

        // Controlla se l'indirizzo recuperato è nella lista di sender
        for (uint i = 0; i < senderList.length; i++) {
            
            // se si trova corrispondenza 
            if (signer == senderList[i]) {

                // si ricompensa il dataMule associandogli dei token
                insertAddress(msg.sender);
                incrementTokenCount(msg.sender);

                // si invia il messaggio al destinatario tramite l'evento
                emit SendMessage(message, recipient);

                return true;
            }
        }

        // si restituisce false se non si trova corrispondenza tr i firmatari
        return false;
        
    }

    // funzione di servizio per appendere le due stringhe e riportarle al formato di firma
    function append(string memory a, string memory b) internal pure returns (string memory) {
        return string(abi.encodePacked(a, "|||", b));
    }


}





