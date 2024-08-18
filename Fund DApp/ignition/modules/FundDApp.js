const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("FundDAppModule", (m) => {
  const fundDApp = m.contract("FundDApp");
  return { fundDApp };
});
