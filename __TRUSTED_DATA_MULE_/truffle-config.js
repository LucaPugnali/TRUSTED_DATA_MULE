module.exports = {
  networks: {
    // si imposta come blockchain di rilascio
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
  },
  compilers: {
    solc: {
      version: "0.8.0",    // Cambia questa linea con la versione di Solidity che desideri utilizzare
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
}

