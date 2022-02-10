# Provably fair slot machine on blockchain (Proof of concept)

https://user-images.githubusercontent.com/726502/153215455-db9a2190-ba96-4b73-8852-90d0497a2ac2.mp4

## Features
- Web3 integration using Web3Modal -lib
- Animation using pixi.js
- Sign transaction and listen contract events
- Localization using react-intl
- Random numbers generated utilizing chain link
- Error handling if browser is not Web3 compatible or user is using wrong network

## Notes
- Use metamask plugin (or web3 compatible browser)
- Application contains two package.json files: one for contracts (backend) and one for UI (=> sleth/client). Remember npm install both of the separately.
- package.json contains commands to run development mode, build app, etc.
- App is currently deployed to Kovan. Contract is assuming that it contains link tokens which are consumed once random number is generated. Make sure to fill the contract if it's empty. Link tokens can be sent directly to contract address: https://kovan.etherscan.io/address/0x780593de5e237Fba6EfD98c05f2e99Bc7d87d700
- You can use following faucet to get testnet ether and link tokens: https://faucets.chain.link/
- UI is currently hosted by heroku app: http://owls-jackpot.herokuapp.com/
- Test coverage is poor but the test frameworks are configured.
- truffle-config.js contains network configurations, mnemonics, etc.
