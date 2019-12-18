var fs = require('fs');

const apiKey = 'VzHEmR0khvWF0u253dYRoceV67P7V2brb5p0fLqFrxVQ0b8aQGQW9vufK8WELBBh';
const apiSecret = 'jjr5jh69voCYuwYPR2hedp5bv9nGDmRqxw4KuesaclKBqC7hO8tSx7C53ksYeYV4';
const invalidPairings = ['PHBPAX','GTOPAX','TFUELUSDC','TFUELPAX','WINBTC','PHBUSDC',
'GTOTUSD','ETCPAX', 'GTOUSDC','ETCUSDC','BCPTPAX','BCPTUSDC','ANKRTUSD','ANKRUSDC','ANKRPAX',
'PERLUSDC','TFUELTUSD','BCPTTUSD','WAVESPAX','VENUSDT','TUSDBTC','PAXBTC','DENTBTC',
'NPXSBTC','ERDPAX','ATOMPAX','BCHSVUSDC','ERDUSDC','BCHSVPAX','BCHSVBTC','BCCBTC','BCCUSDT',
'FTMPAX','BTTBTC','BCHABCBTC','BCHABCUSDT','BCHABCPAX','BCHABCUSDC','BCHABCTUSD','BCHABCBUSD',
'ONEPAX','PAXONE','ONETUSD','TUSDONE','DOGEPAX','PAXDOGE','USDCDOGE','DOGEUSDC','FTMTUSD','TUSDFTM',
];

const binance = require('node-binance-api')().options({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    useServerTime: true // If you get timestamp errors, synchronize to server time at startup
});

/* This file will handle finding available cycles for coins
Input is an array of binance tickers. 
output is write to db.json.

ex. data model:
{ startingPair: 'MITHBTC',
    bridgePair: 'MITHUSDT',
    finalPair: 'BTCUSDT' },
*/

function findCycles(coins) {
    const data = {};
    //get all the coin pairings on binance, and their exchange rate
    binance.prices((error, ticker) => {
        // console.log(ticker);
        //putting pairings in an array
        const allPairings = Object.keys(ticker).map(pairing => pairing);
        //start finding cycles of currency
        coins.forEach(coin => {
            const requiredPairings = new Set();
            filteredPairings = allPairings.filter(pairing => {
                if (pairing.includes(coin)) {
                    if (!invalidPairings.includes(pairing)) {
                        return pairing;
                    }
                }
            })
            const bridgeCoins = filteredPairings.map(startingPair => {                
                // find the bridging coins,
                // special logic for cases like 'BTCBBTC'
                // that split into array size 3
                const splitVal = startingPair.split(coin);
                if (splitVal.length === 2) {
                    if (splitVal[0] === "") {
                        return {firstPair: startingPair,secondCoin: splitVal[1]};
                    } else return {firstPair: startingPair,secondCoin: splitVal[0]};
                } else return {firstPair: startingPair,secondCoin: (coin + splitVal[1])};
            });

            //find the bridge pairs
            let bridgePairings = [];
            //for all the pairings (large, but constant)
            for (let i=0; i<allPairings.length;i++) {
                //n^2 for n = bridgeCoins.length
                for (let j=0; j<bridgeCoins.length;j++) {
                    for (let k=0; k<bridgeCoins.length;k++) {
                        //save an operation
                        if (j===k) continue
                            //if the concat of the two bridgecoins exists in all pairs
                            if ((bridgeCoins[j].secondCoin+bridgeCoins[k].secondCoin) === allPairings[i]) {
                                //push obj with first pair and middle pair
                                if (!invalidPairings.includes(allPairings[i])) {
                                    bridgePairings.push({startingPair: bridgeCoins[j].firstPair, bridgePair: allPairings[i]});
                                    break;
                                }
                            }
                    }
                }
            }

            //find the last coin pairing
            let finalPairings = [];
            bridgePairings.forEach(bridgePairing => {
                //find coin by replacing w/ "", take leftover
                const finalBridgeCoin = bridgePairing.bridgePair.replace(bridgePairing.startingPair.replace(coin,""),"");
                filteredPairings.forEach(startingPair => {
                    //literally check if both string combos of the coins
                    // exists in the initial filtered pairings
                    if (startingPair === ((coin+finalBridgeCoin) || (finalBridgeCoin+coin))) {
                        //push obj with all pairings 
                        if (!invalidPairings.includes(startingPair)) {
                            finalPairings.push({...bridgePairing,finalPair:startingPair});
                            requiredPairings.add(bridgePairing.startingPair);
                            requiredPairings.add(bridgePairing.bridgePair);
                            requiredPairings.add(startingPair);
                        }
                    }
                });
            });
            // data.push({[coin]: finalPairings})
            data[coin+"cycles"] = finalPairings;
            data["requiredPairings"] = Array.from(requiredPairings);
            console.log(requiredPairings);
            console.log(finalPairings.length);
        });
        //write to json file
        fs.writeFile ("cycles.json", JSON.stringify({data: data}), function(err) {
            if (err) throw err;
            console.log('cycles saved to cycles.json');
            console.log('~~~~~~~~~~~~~~~~~~~~~~~~~NUFF SAID~~~~~~~~~~~~~~~~~~~~~~~~~');
            }
        );
    });
    
}

findCycles(["BTC"]);