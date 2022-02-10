const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')
const { Oracle } = require('@chainlink/contracts/truffle/v0.6/Oracle')
var OwlsJackpot = artifacts.require("./OwlsJackpot.sol");

module.exports = async (deployer, network, [defaultAccount]) => {
  // Local (development) networks need their own deployment of the LINK
  // token and the Oracle contract
  if (!network.startsWith('kovan')) {
    LinkToken.setProvider(deployer.provider)
    Oracle.setProvider(deployer.provider)
    try {
      await deployer.deploy(LinkToken, { from: defaultAccount })
      await deployer.deploy(Oracle, LinkToken.address, { from: defaultAccount })
      console.log('LinkToken and Oracle deployed to development chain!');
    } catch (err) {
      console.error(err)
    }
  } else {
    // For now, this is hard coded to Kovan
    const KOVAN_KEYHASH = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
    const KOVAN_FEE = '100000000000000000'
    const KOVAN_LINK_TOKEN = '0xa36085F69e2889c224210F603D836748e7dC0088'
    const KOVAN_VRF_COORDINATOR = '0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9'
    deployer.deploy(OwlsJackpot, KOVAN_LINK_TOKEN, KOVAN_KEYHASH, KOVAN_VRF_COORDINATOR, KOVAN_FEE);
  }
}
