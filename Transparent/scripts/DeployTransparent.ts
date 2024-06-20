import { ethers, upgrades, run } from "hardhat"; 
 
async function main() { 
  await run("compile"); 
  console.log("Compiled contract..."); 
 
  console.log("Deploying Transparent..."); 
 
  const constructorArgs: [string, bigint] = [ 
    "0x5E2df4dc3F8aE246034AB02e147341e5d5A098B4", 
    100n, 
  ]; 
 
  const Transparent = await ethers.getContractFactory("Transparent"); 
 
  const transparent = await upgrades.deployProxy( 
    Transparent, 
    constructorArgs, 
    { 
      kind: "transparent", 
      initializer: "initialize", 
    } 
  ); 
  await transparent.waitForDeployment(); 
 
  const proxyAddr = await transparent.getAddress(); 
  console.log("DemoTransparent deployed at: ", proxyAddr); 
 
  const proxyAdminAddress = await upgrades.erc1967.getAdminAddress(proxyAddr); 
  console.log("ProxyAdmin address:", proxyAdminAddress); 
 
  console.log("Wait to verify contract"); 
 
  await new Promise((resolve) => { 
    setTimeout(resolve, 60 * 1000); 
  }); 
  await run("verify:verify", { 
    address: proxyAddr, 
    constructorArgs: [], 
  }); 
  const implAddr = await upgrades.erc1967.getImplementationAddress(proxyAddr); 
} 
main() 
  .then(() => process.exit(0)) 
  .catch((error) => { 
    console.error(error); 
    process.exit(1); 
  });