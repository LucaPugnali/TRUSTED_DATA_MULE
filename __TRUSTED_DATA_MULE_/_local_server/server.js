const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');


const app = express();
app.use(express.json());
app.use(cors());



// Endpoint richiamato dal sender per scrivere i dati nel 
// file che verrà prelevato dal data mule 
app.post('/scriviMessaggioFirmaSuFile', (req, res) => {
    
    // si crea la cartelal se non esiste
    const dir = '../_temp';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    
    const { message, signature } = req.body;
    
    // si associa al file un nome univoco con data e ora 
    const fileName = new Date().toISOString().slice(0, -1).replace(/:/g, '-').replace('T', '_') + '.txt';
    const filePath = path.join(dir, fileName);
    
    // si formattano i dati per scriverli su file
    const data = { message, signature };
    
    // si crea il file con i dati
    fs.writeFile(filePath, JSON.stringify(data), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Errore durante la scrittura del file');
        } else {
            res.send('File scritto con successo');
        }
    });
});



// Endpoint richiamato dal Data Mule per leggere dal file i dati da inviare dallo smart contract
app.post('/leggiMessaggioFirmaDaFile', (req, res) => {
    const dir = '../_temp';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Errore durante la lettura della directory');
        } else {
            if (files.length === 0) {
                res.status(404).send('Nessun file trovato nella directory');
            } else {
                const filePath = path.join(dir, files[0]);
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Errore durante la lettura del file');
                    } else {
                        const { message, signature } = JSON.parse(data);
                        res.send({ message, signature });

                        // Elimina il file dopo averlo conseganto al Data Mule
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log(`File ${filePath} eliminato con successo`);
                            }
                        });

                    }
                });
            }
        }
    });
});




// Endpoint richiamabili per accedere agli indirizzi degli attori della
//   simulazione memorizzati negli appositi file nella cartella _local_server/keys
app.get('/getSenderPublicAddress', (req, res) => {
    const filePath = path.join('./keys', 'sender_address.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Errore durante la lettura del file');
        } else {
            res.send(data);
        }
    });
});

app.get('/getSenderPrivateKey', (req, res) => {
    const filePath = path.join('./keys', 'sender_private_key.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Errore durante la lettura del file');
        } else {
            res.send(data);
        }
    });
});

app.get('/getDataMuleAddress', (req, res) => {
    const filePath = path.join('./keys', 'data_mule_address.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Errore durante la lettura del file');
        } else {
            res.send(data);
        }
    });
});

app.get('/getRecipientAddress', (req, res) => {
    const filePath = path.join('./keys', 'recipient_address.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Errore durante la lettura del file');
        } else {
            res.send(data);
        }
    });
});













app.listen(3002, () => console.log('Server in ascolto sulla porta 3002'));
