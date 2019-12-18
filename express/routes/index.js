const calcArb = require('./calculateArbitrage');
var express = require('express');
console.log(calcArb);

var router = express.Router();
/* GET home page. */
router.post('/arbitrage', function(req, res, next) {
    // console.log(req);
    calcArb.calculateArbitrage(req.body.data, res);
    // console.log(ret);
    // calcArb.calculateArbitrage(req.body.data,res);
});

module.exports = router;
