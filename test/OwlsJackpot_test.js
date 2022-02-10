const { assert } = require('chai')
const { expectRevert } = require('@openzeppelin/test-helpers')

contract('OwlsJackpot', accounts => {
    const OwlsJackpotContract = artifacts.require('OwlsJackpot')
    const VRFCoordinatorMock = artifacts.require('VRFCoordinatorMock')
    const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')
    const defaultAccount = accounts[0]
    let owlsJackpotContract, vrfCoordinatorMock, link, keyhash, fee

    describe('request random number', () => {
        beforeEach(async () => {
            keyhash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
            fee = '1000000000000000000'
            link = await LinkToken.new({ from: defaultAccount })
            vrfCoordinatorMock = await VRFCoordinatorMock.new(link.address, { from: defaultAccount })
            owlsJackpotContract = await OwlsJackpotContract.new(link.address, keyhash, vrfCoordinatorMock.address, fee, { from: defaultAccount })
        })
        it('reverts without LINK', async () => {
            await expectRevert.unspecified(
                owlsJackpotContract.startRound(1, {from: defaultAccount })
            )
        })
        it('returns a random number with link', async () => {
            await link.transfer(owlsJackpotContract.address, web3.utils.toWei('1', 'ether'), { from: defaultAccount })
            let transaction = await owlsJackpotContract.startRound(1, { from: defaultAccount })
            assert.exists(transaction.receipt.rawLogs)
            // This is the event that is emitted
            let requestId = transaction.receipt.rawLogs[3].topics[0]
            await vrfCoordinatorMock.callBackWithRandomness(requestId, '777', owlsJackpotContract.address, { from: defaultAccount })

            let pastEvents = await owlsJackpotContract.getPastEvents('LogRandomnessFulfilled');
            let randomNumber = pastEvents[0].returnValues.randomness;
            assert.equal(randomNumber, 777)
        })
    })

    describe('Profit table', () => {
        const startRoundAndGetRequestId = async (spinCount, betSize) => {
            await owlsJackpotContract.startRound(spinCount, { from: defaultAccount, value: betSize });
            let pastEvents = await owlsJackpotContract.getPastEvents('LogRequestedRandomness');
            assert.exists(pastEvents[0].returnValues)
            return pastEvents[0].returnValues.requestId;
        };

        beforeEach(async () => {
            keyhash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
            fee = '1000000000000000000'
            link = await LinkToken.new({ from: defaultAccount })
            vrfCoordinatorMock = await VRFCoordinatorMock.new(link.address, { from: defaultAccount })
            owlsJackpotContract = await OwlsJackpotContract.new(link.address, keyhash, vrfCoordinatorMock.address, fee, { from: defaultAccount})

            // initialize contract with the LINK tokens
            await link.transfer(owlsJackpotContract.address, web3.utils.toWei('1', 'ether'), { from: defaultAccount })
        })

        it('No WIN', async () => {
            const betSize = web3.utils.toWei("0.0001", "ether");
            const spinCount = 1;
            const requestId = await startRoundAndGetRequestId(spinCount, betSize);

            const doubleWinBoundary = await owlsJackpotContract.DOUBLE_WIN_BOUNDARY.call();
            const outOfWinningRange = BigInt(doubleWinBoundary) + 1n;

            await vrfCoordinatorMock.callBackWithRandomness(requestId, outOfWinningRange, owlsJackpotContract.address, { from: defaultAccount })
            let pastRoundResults = await owlsJackpotContract.getPastEvents('LogRoundResult');
            const { returnValues } = pastRoundResults[0];

            assert.equal(returnValues.betSize, betSize);
            assert.equal(returnValues.multipliers.length, spinCount);
            assert.equal(returnValues.multipliers[0], 0);
            assert.equal(returnValues.player, defaultAccount);
        })

        it('2x WIN', async () => {
            const betSize = web3.utils.toWei("0.0001", "ether");
            const spinCount = 1;
            const requestId = await startRoundAndGetRequestId(spinCount, betSize);

            const doubleWinBoundary = await owlsJackpotContract.DOUBLE_WIN_BOUNDARY.call();

            await vrfCoordinatorMock.callBackWithRandomness(requestId, doubleWinBoundary, owlsJackpotContract.address, { from: defaultAccount })
            let pastRoundResults = await owlsJackpotContract.getPastEvents('LogRoundResult');
            const { returnValues } = pastRoundResults[0];

            assert.equal(returnValues.betSize, betSize);
            assert.equal(returnValues.multipliers.length, spinCount);
            assert.equal(returnValues.multipliers[0], 2);
            assert.equal(returnValues.player, defaultAccount);
        })

        it('4x WIN', async () => {
            const betSize = web3.utils.toWei("0.0001", "ether");
            const spinCount = 1;
            const requestId = await startRoundAndGetRequestId(spinCount, betSize);

            const quadrupleWinBoundary = await owlsJackpotContract.QUADRUPLE_WIN_BOUNDARY.call();

            await vrfCoordinatorMock.callBackWithRandomness(requestId, quadrupleWinBoundary, owlsJackpotContract.address, { from: defaultAccount })
            let pastRoundResults = await owlsJackpotContract.getPastEvents('LogRoundResult');
            const { returnValues } = pastRoundResults[0];

            assert.equal(returnValues.betSize, betSize);
            assert.equal(returnValues.multipliers.length, spinCount);
            assert.equal(returnValues.multipliers[0], 4);
            assert.equal(returnValues.player, defaultAccount);
        })

        it('8x WIN', async () => {
            const betSize = web3.utils.toWei("0.0001", "ether");
            const spinCount = 1;
            const requestId = await startRoundAndGetRequestId(spinCount, betSize);

            const octupleWinBoundary = await owlsJackpotContract.OCTUPLE_WIN_BOUNDARY.call();
  
            await vrfCoordinatorMock.callBackWithRandomness(requestId, octupleWinBoundary, owlsJackpotContract.address, { from: defaultAccount })
            let pastRoundResults = await owlsJackpotContract.getPastEvents('LogRoundResult');
            const { returnValues } = pastRoundResults[0];

            assert.equal(returnValues.betSize, betSize);
            assert.equal(returnValues.multipliers.length, spinCount);
            assert.equal(returnValues.multipliers[0], 8);
            assert.equal(returnValues.player, defaultAccount);
        })

        it('Multiple spins at once', async () => {
            const payment = web3.utils.toWei("0.0001", "ether");
            const spinCount = 2;
            const requestId = await startRoundAndGetRequestId(spinCount, payment);

            const doubleWinBoundary = await owlsJackpotContract.DOUBLE_WIN_BOUNDARY.call();

            await vrfCoordinatorMock.callBackWithRandomness(requestId, doubleWinBoundary, owlsJackpotContract.address, { from: defaultAccount })
            let pastRoundResults = await owlsJackpotContract.getPastEvents('LogRoundResult');
            const { returnValues } = pastRoundResults[0];
            const { winningIncrements, multipliers } = returnValues;

            const expectedBetSize = payment / spinCount;
            assert.equal(returnValues.betSize, payment / spinCount);
            assert.equal(returnValues.multipliers.length, spinCount);
            assert.equal(winningIncrements.length, spinCount);
            assert.equal(winningIncrements[0], expectedBetSize * multipliers[0]);
            assert.equal(winningIncrements[1], expectedBetSize * multipliers[1]);
            assert.equal(returnValues.player, defaultAccount);
        })
    })

    describe('Withdraw', () => {
        const startRoundAndGetRequestId = async (spinCount, betSize) => {
            await owlsJackpotContract.startRound(spinCount, { from: defaultAccount, value: betSize });
            let pastEvents = await owlsJackpotContract.getPastEvents('LogRequestedRandomness');
            assert.exists(pastEvents[0].returnValues)
            return pastEvents[0].returnValues.requestId;
        };

        beforeEach(async () => {
            keyhash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
            fee = '1000000000000000000'
            link = await LinkToken.new({ from: defaultAccount })
            vrfCoordinatorMock = await VRFCoordinatorMock.new(link.address, { from: defaultAccount })
            owlsJackpotContract = await OwlsJackpotContract.new(link.address, keyhash, vrfCoordinatorMock.address, fee, { from: defaultAccount, value:  web3.utils.toWei("0.01", "ether") })

            // initialize contract with the LINK tokens
            await link.transfer(owlsJackpotContract.address, web3.utils.toWei('1', 'ether'), { from: defaultAccount })
        })

        it('Successful', async () => {
            // 2x WIN round
            const doubleWinBoundary = await owlsJackpotContract.DOUBLE_WIN_BOUNDARY.call();
            const betSize = web3.utils.toWei("0.01", "ether");
            const spinCount = 1;
            const requestId = await startRoundAndGetRequestId(spinCount, betSize);

            await vrfCoordinatorMock.callBackWithRandomness(requestId, doubleWinBoundary, owlsJackpotContract.address, { from: defaultAccount })
            const winningsForUserBefore = await owlsJackpotContract.getWinningsForUser(defaultAccount);
            var playerBalanceBefore = await web3.eth.getBalance(defaultAccount);

            assert.equal(web3.utils.fromWei(parseInt(winningsForUserBefore).toString()), 0.02);

            await owlsJackpotContract.withdrawUserFunds({ from: defaultAccount });

            const winningsForUserAfter = await owlsJackpotContract.getWinningsForUser(defaultAccount);
            var playerBalanceAfter = await web3.eth.getBalance(defaultAccount);
            assert.equal(winningsForUserAfter, 0);
            assert.isTrue( parseInt(playerBalanceBefore) < parseInt(playerBalanceAfter), "Balance should be bigger after withdraw");
        })

        it('Fails - insufficent contract balance', async () => {
            // 8x WIN round
            const octupleWinBoundary = await owlsJackpotContract.OCTUPLE_WIN_BOUNDARY.call();
            const betSize = web3.utils.toWei("0.01", "ether");
            const spinCount = 1;
            const requestId = await startRoundAndGetRequestId(spinCount, betSize);

            await vrfCoordinatorMock.callBackWithRandomness(requestId, octupleWinBoundary, owlsJackpotContract.address, { from: defaultAccount })
            const winningsForUserBefore = await owlsJackpotContract.getWinningsForUser(defaultAccount);
            var playerBalanceBefore = await web3.eth.getBalance(defaultAccount);

            assert.equal(web3.utils.fromWei(parseInt(winningsForUserBefore).toString()), 0.08);

            await expectRevert.unspecified(
                owlsJackpotContract.withdrawUserFunds({ from: defaultAccount })
            );
        })
    })
})
