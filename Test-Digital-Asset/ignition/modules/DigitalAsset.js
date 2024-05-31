const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
module.exports = buildModule("DigitalAsset", (m) => {
    const Art = m.contract ("ArtAsset", []);
    const Music = m.contract ("MusicAsset", []);
    const Factory = m.contract ("FactoryAsset", []);
    return(Art, Music, Factory);

});

