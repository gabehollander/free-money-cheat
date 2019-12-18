const fs = require('fs');
const c = require('./cycles.json');
// const fs = fsRemote.createClient;

const apiKey = 'VzHEmR0khvWF0u253dYRoceV67P7V2brb5p0fLqFrxVQ0b8aQGQW9vufK8WELBBh';
const apiSecret = 'jjr5jh69voCYuwYPR2hedp5bv9nGDmRqxw4KuesaclKBqC7hO8tSx7C53ksYeYV4';

const binance = require('node-binance-api')().options({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    useServerTime: true // If you get timestamp errors, synchronize to server time at startup
});
// console.log(c);
// const cc = fs.readFileSync(c);
// const cycles = JSON.parse(c);
const cycles = c;


arbitrageData = [];

function calculateArbitrage(coins, res) {
    // console.log(cycles.data.requiredPairings);
    binance.prices(cycles.data.requiredPairings,(error, ticker) => {
        // console.log(coins);
        const ret = coins.map(coin => {
            const currentCycleGroup = cycles.data[coin+'cycles'];
            currentCycleGroupRatios = currentCycleGroup.map(triPair => {
                // console.log("~~~~~~~~~~~~~~~~~~~~~~~");
                // console.log(triPair.startingPair+"-"+ticker[triPair.startingPair]);
                // console.log(triPair.bridgePair+"-"+ticker[triPair.bridgePair]);
                // console.log(triPair.finalPair+"-"+ticker[triPair.finalPair]);

                const exr1 = triPair.startingPair.endsWith(coin) ?
                    (1/ticker[triPair.startingPair]) :
                    ticker[triPair.startingPair]
                
                const bridgeCoin = triPair.startingPair.replace(coin,"");
                const exr2 = triPair.bridgePair.endsWith(bridgeCoin) ?
                    (1/ticker[triPair.bridgePair]) :
                    ticker[triPair.bridgePair]
                
                const finalCoin  = triPair.bridgePair.replace(bridgeCoin,"");
                const exr3 = triPair.finalPair.endsWith(finalCoin) ?
                    (1/ticker[triPair.finalPair]) :
                    ticker[triPair.finalPair]

                const arbitrageLabel = coin+bridgeCoin+finalCoin;

                return { label: arbitrageLabel, percent: (exr1*exr2*exr3)}
            });
            // console.log(JSON.stringify(currentCycleGroupRatios.sort((a, b) => (a.percent > b.percent) ? 1 : -1)));
            // arbitrageData.push(currentCycleGroupRatios);
            // res.send( currentCycleGroupRatios);
            return currentCycleGroupRatios
        })
        res.send(ret);
        // arbitrageData.push(priceData);
        // console.log(priceData);
        // console.log(arbitrageData);

    })
}
// setInterval(() => {
//     calculateArbitrage(['BTC']);
// },1000)

module.exports = {
    calculateArbitrage: calculateArbitrage,
  };









