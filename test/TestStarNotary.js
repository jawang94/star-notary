const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    const tokenId = 1;
    const instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 2;
    const starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 3;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    const balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    const value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    const value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 4;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 5;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    const value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    const tokenId = 6;
    const instance = await StarNotary.deployed();
    await instance.createStar('Second star', tokenId, {from: accounts[0]})
    assert.equal(await instance.name(), 'StarNotary');
    assert.equal(await instance.symbol(), 'STAR');
});

it('lets 2 users exchange stars', async() => {
    const starId1 = 7;
    const starId2 = 8;
    const instance = await StarNotary.deployed();
    await instance.createStar('Exchange Star1', starId1, {from: accounts[0]});
    await instance.createStar('Exchange Star2', starId2, {from: accounts[1]});
    await instance.exchangeStars(starId1, starId2);
    assert.equal(await instance.ownerOf(starId1), accounts[1]);
    assert.equal(await instance.ownerOf(starId2), accounts[0]);
});

it('lets a user transfer a star', async() => {
    const starId = 9;
    const instance = await StarNotary.deployed();
    await instance.createStar('Transfer Star', starId, {from: accounts[0]});
    await instance.transferStar(accounts[1], starId, {from: accounts[0]});
    assert.equal(await instance.ownerOf(starId), accounts[1]);
});

it('lookUptokenIdToStarInfo test', async() => {
    const starId = 10;
    const starName = 'Look Up Star';
    const instance = await StarNotary.deployed();
    await instance.createStar(starName, starId, {from: accounts[0]});
    assert.equal(await instance.lookUptokenIdToStarInfo(starId), starName)
});