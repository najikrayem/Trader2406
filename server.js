const express = require('express');
const logic = require('./logic.js')
const app = express();

//TODO change port when production
const PORT = process.env.PORT || 3000;
//const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

//sign in request
app.post('/authenticate', function(req, res) {
    try {
        res.status(200).send(logic.authenticateUser(req.body));
    } catch (e) {
        res.status(401).send({ error: "wrong email/pasword combo" });
    }
})

//TODO select correct status codess
//sign up request
app.post('/register', function(req, res) {
    try {
        res.status(200).send(logic.registerUser(req.body));
    } catch (e) {
        res.status(401).send({ error: "user already exists" });
    }
})

//fund account request
app.post('/fund', function(req, res) {
    try {
        res.status(200).send(logic.fundAccount(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

//withdraw from account request
app.post('/withdraw', function(req, res) {
    try {
        res.status(200).send(logic.withdrawAccount(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

//place buy order request
app.post('/buy', function(req, res) {
    try {
        res.status(200).send(logic.placeBuyOrder(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

//place buy order request
app.post('/sell', function(req, res) {
    try {
        res.status(200).send(logic.placeSellOrder(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

//request stock info
app.post('/stockdata', function(req, res) {
    try {
        res.status(200).send(logic.getStockData(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

//request list of user orders
app.post('/userOrders', function(req, res) {
    try {
        res.status(200).send(logic.getUserOrders(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

//attempt cancelling order
app.post('/cancelOrder', function(req, res) {
    try {
        res.status(200).send(logic.cancelOrder(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

//PUBLIC API
app.get('/stocks', function(req, res) {
    let paramSymbol = req.query.symbol;
    let paramMinPrice = req.query.minprice;
    let paramMaxPrice = req.query.maxprice;

    try {
        res.status(200).send(logic.APIGetStock(paramSymbol, paramMinPrice, paramMaxPrice));
    } catch (e) {
        res.status(400).send({ error: "error" });
    }
})

app.post('/createWatchlist', function(req, res) {
    try {
        res.status(200).send(logic.createWatchlist(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

app.post('/getUserWatchlists', function(req, res) {
    try {
        res.status(200).send(logic.getUserWatchlists(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

app.post('/deleteWatchlist', function(req, res) {
    try {
        res.status(200).send(logic.deleteWatchlist(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

app.post('/addStockToWatchlist', function(req, res) {
    try {
        res.status(200).send(logic.addStockToWatchlist(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})


app.post('/removeStockFromWatchlist', function(req, res) {
    try {
        res.status(200).send(logic.removeStockFromWatchlist(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

app.post('/setAlarm', function(req, res) {
    try {
        res.status(200).send(logic.setAlarm(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

app.post('/getUserAlarms', function(req, res) {
    try {
        res.status(200).send(logic.getUserAlarms(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

app.post('/disableAlarm', function(req, res) {
    try {
        res.status(200).send(logic.disableAlarm(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

app.post('/enableAlarm', function(req, res) {
    try {
        res.status(200).send(logic.enableAlarm(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})


app.post('/changeAlarm', function(req, res) {
    try {
        res.status(200).send(logic.changeAlarm(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

app.post('/deleteAlarm', function(req, res) {
    try {
        res.status(200).send(logic.deleteAlarm(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

app.post('/getUserActivity', function(req, res) {
    try {
        res.status(200).send(logic.getUserActivity(req.body));
    } catch (e) {
        res.status(401).send({ error: "error" });
    }
})

app.listen(PORT, () => {
    console.log(`running at http://localhost:${PORT}`);
});