const DataMuleContract = artifacts.require("DataMuleContract");



module.exports = function(deployer) {
  deployer.deploy(DataMuleContract);
};
