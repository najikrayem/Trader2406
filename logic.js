const { v4: uuidv4 } = require('uuid');


let users = {};
let stocks = {};
let userOrders = {};
let userWatchlists = {};
let userAlarms = {};
let userActivities = {};


class UserAccount {
    constructor(email, password) {
        this.email = email;
        this.password = password;
        this.cash = 0;
        this.holdings = {};
    }
}

class MarketOrder {
    constructor(account, operation, orderuuid, quantity, price, goodThrough, symbol) {
        this.account = account;
        this.operation = operation;
        this.orderuuid = orderuuid;
        this.quantity = quantity;
        this.initQuantity = quantity;
        this.price = price;
        this.goodThrough = goodThrough;
        this.resolution = "Pending";
        this.symbol = symbol;
    }
}

class Stock {
    constructor(symbol, numShares, initialPrice) {
        this.numShares = numShares;
        this.symbol = symbol;
        this.curPrice = initialPrice;
        this.buyOrders = {};
        this.sellOrders = this.initialOffering(numShares, initialPrice, symbol);
        this.open = initialPrice; //TODO
        this.previousClose = initialPrice; //TODO
        this.volume = 0; //TODO
        this.dayHigh = initialPrice; //TODO
        this.dayLow = initialPrice; //TODO
        this.lastBid = 0;
        this.lastBidSize = 0;
        this.lastAsk = initialPrice;
        this.lastAskSize = numShares;
    }

    initialOffering(numShares, initialPrice, symbol) {
        let order = new MarketOrder(null, "Sell", uuidv4(), numShares, initialPrice, null, symbol);
        const orders = {};
        orders[order.orderuuid] = order;
        return orders;
    }

    addBuyOrder(buyOrder) {
        this.lastBid = buyOrder.price !== null ? buyOrder.price : this.curPrice;
        this.lastBidSize = buyOrder.quantity;

        //attempts to process order first
        if (!this.newBuyOrder(buyOrder)) {
            //adds to orders list to be processed later if could not process now
            this.buyOrders[buyOrder.orderuuid] = buyOrder;
        }
    }

    addSellOrder(sellOrder) {
        this.lastAsk = sellOrder.price !== null ? sellOrder.price : this.curPrice;
        this.lastAskSize = sellOrder.quantity;

        //attempts to process order first
        if (!this.newSellOrder(sellOrder)) {
            //adds to orders list to be processed later if could not process now
            this.sellOrders[sellOrder.orderuuid] = sellOrder;
        }
    }

    newBuyOrder(buyOrder) {
        //processes new order
        //TODO check if market is open
        let transactionPrice;
        let curPriceForThisFunction = this.curPrice;

        function checkOrderCompatible(sellOrder) {
            if (!sellOrder.resolution === "Partial" || !sellOrder.resolution === "Pending") {
                return false;
            }

            if (isNaN(buyOrder.price)) {
                buyOrder.price = null;
            }

            if (isNaN(sellOrder.price)) {
                sellOrder.price = null;
            }


            if (sellOrder.price === null && buyOrder.price === null) {
                transactionPrice = curPriceForThisFunction;
                return true;
            } else if (sellOrder.price === null || buyOrder.price === null) {
                if (sellOrder.price === null) {
                    transactionPrice = buyOrder.price;
                    return true;
                } else if (buyOrder.price === null) {
                    transactionPrice = sellOrder.price;
                    return true;
                } else {
                    return false;
                }
            } else {
                transactionPrice = (sellOrder.price + buyOrder.price) / 2
                return sellOrder.price <= buyOrder.price;
            }
        }

        //finds a matching selling order
        let matchSellOrder;
        for (const sellOrderuuid in this.sellOrders) {
            if (checkOrderCompatible(this.sellOrders[sellOrderuuid])) {
                matchSellOrder = this.sellOrders[sellOrderuuid];
                break;
            }
        }

        if (matchSellOrder === undefined) {
            return false;
        } else {

            let transactionQuantity;
            if (matchSellOrder.quantity <= buyOrder.quantity) {
                transactionQuantity = matchSellOrder.quantity;
            } else {
                transactionQuantity = buyOrder.quantity;
            }

            return this.processTransaction(buyOrder, matchSellOrder, transactionQuantity, transactionPrice);
        }
    }

    newSellOrder(sellOrder) {
        //processes new order
        //TODO check if market is open
        let transactionPrice;
        let curPriceForThisFunction = this.curPrice;

        function checkOrderCompatible(buyOrder) {
            if (!buyOrder.resolution === "Partial" || !sellOrder.resolution === "Pending") {
                return false;
            }

            if (isNaN(sellOrder.price)) {
                sellOrder.price = null;
            }

            if (isNaN(buyOrder.price)) {
                buyOrder.price = null;
            }

            if (sellOrder.price === null && buyOrder.price === null) {
                transactionPrice = curPriceForThisFunction;
                return true;
            } else if (sellOrder.price === null || buyOrder.price === null) {
                if (sellOrder.price === null) {
                    transactionPrice = buyOrder.price;
                    return true;
                } else if (buyOrder.price === null) {
                    transactionPrice = sellOrder.price;
                    return true;
                } else {
                    return false;
                }
            } else {
                transactionPrice = (sellOrder.price + buyOrder.price) / 2
                return sellOrder.price <= buyOrder.price;
            }
        }

        //finds a matching selling order
        let matchBuyOrder = this.buyOrders.find(checkOrderCompatible);
        for (const buyOrderuuid in this.buyOrders) {
            if (checkOrderCompatible(this.buyOrders[buyOrderuuid])) {
                matchBuyOrder = this.buyOrders[buyOrderuuid];
                break;
            }
        }
        if (matchBuyOrder === undefined) {
            return false;
        } else {

            let transactionQuantity;
            if (matchBuyOrder.quantity <= sellOrder.quantity) {
                transactionQuantity = matchBuyOrder.quantity;
            } else {
                transactionQuantity = sellOrder.quantity;
            }

            return this.processTransaction(matchBuyOrder, sellOrder, transactionQuantity, transactionPrice);
        }
    }

    processTransaction(buyOrder, sellOrder, transactionQuantity, transactionPrice) {
        //checks if buyer has enough funds
        if (users[buyOrder.account].cash >= (transactionQuantity * transactionPrice)) {
            //checks if seller has enough stock
            if ((sellOrder.account === null && sellOrder.quantity >= transactionQuantity) ||
                ((sellOrder.account !== null) && users[sellOrder.account].holdings[this.symbol].quantity >= transactionQuantity)) {
                //TODO add orders to activity for both users
                if (sellOrder.account !== null) {
                    //decrease holding for seller and order
                    users[sellOrder.account].holdings[this.symbol].quantity -= transactionQuantity;
                    sellOrder.quantity -= transactionQuantity;
                } else {
                    sellOrder.quantity -= transactionQuantity;
                }

                //add new holding for buyer if does not have one
                if (!(this.symbol in users[buyOrder.account].holdings)) {
                    users[buyOrder.account].holdings[this.symbol] = { "quantity": 0, "average": 0 }
                }
                //edit average for buyer
                users[buyOrder.account].holdings[this.symbol].average = (
                    (parseInt(users[buyOrder.account].holdings[this.symbol].average) *
                        parseInt(users[buyOrder.account].holdings[this.symbol].quantity)
                    ) + (transactionQuantity * transactionPrice)
                ) / (transactionQuantity + parseInt(users[buyOrder.account].holdings[this.symbol].quantity));
                //increase holding for buyer decrease for order
                users[buyOrder.account].holdings[this.symbol].quantity += transactionQuantity;
                buyOrder.quantity -= transactionQuantity;
                if (!sellOrder.account === null) {
                    //add cash to seller
                    users[sellOrder.account].cash += transactionQuantity * transactionPrice;
                }
                //remove cash from buyer
                users[buyOrder.account].cash -= transactionQuantity * transactionPrice;

                //sets market price
                this.curPrice = transactionPrice;

                if (sellOrder.account !== null) {
                    if (userOrders[sellOrder.account][sellOrder.orderuuid] === undefined) {
                        userOrders[sellOrder.account][sellOrder.orderuuid] = {};
                    }
                }

                if (sellOrder.quantity === 0) {
                    sellOrder.resolution = "Processed";
                    if (sellOrder.account != null) {
                        userOrders[sellOrder.account][sellOrder.orderuuid].resolution = "Processed";
                    }
                } else {
                    sellOrder.resolution = "Partial"
                    if (sellOrder.account != null) {
                        userOrders[sellOrder.account][sellOrder.orderuuid].resolution = "Partial";
                    }
                    this.sellOrders[sellOrder.orderuuid] = sellOrder;
                }

                if (buyOrder.account != null) {
                    if (userOrders[buyOrder.account][buyOrder.orderuuid] === undefined) {
                        userOrders[buyOrder.account][buyOrder.orderuuid] = {};
                    }
                }

                if (buyOrder.quantity === 0) {
                    buyOrder.resolution = "Processed"
                    if (buyOrder.account != null) {
                        userOrders[buyOrder.account][buyOrder.orderuuid].resolution = "Processed";
                    }
                } else {
                    buyOrder.resolution = "Partial"
                    if (buyOrder.account != null) {
                        userOrders[buyOrder.account][buyOrder.orderuuid].resolution = "Partial";
                    }
                    this.buyOrders[buyOrder.orderuuid] = buyOrder;
                }

                this.volume += transactionQuantity;
                if (this.dayHigh < transactionPrice) {
                    this.dayHigh = transactionPrice;
                }
                if (this.dayLow > transactionPrice) {
                    this.dayLow = transactionPrice;
                }

                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    getSnapShot() {
        return {
            "symbol": this.symbol,
            "curPrice": this.curPrice,
            "lastBid": this.lastBid,
            "lastBidSize": this.lastBidSize,
            "lastAsk": this.lastAsk,
            "lastAskSize": this.lastAskSize,
            "open": this.open,
            "close": this.previousClose,
            "volume": this.volume,
            "high": this.dayHigh,
            "low": this.dayLow
        }
    }
}

stocks["AXP"] = new Stock("AXP", 1000, 10);
stocks["AMGN"] = new Stock("AMGN", 1000, 10);
stocks["AAPL"] = new Stock("AAPL", 1000, 10);
stocks["BA"] = new Stock("BA", 1000, 10);
stocks["CAT"] = new Stock("CAT", 1000, 10);
stocks["CSCO"] = new Stock("CSCO", 1000, 10);
stocks["CVX"] = new Stock("CVX", 1000, 10);
stocks["GS"] = new Stock("GS", 1000, 10);
stocks["HD"] = new Stock("HD", 1000, 10);
stocks["HON"] = new Stock("HON", 1000, 10);
stocks["IBM"] = new Stock("IBM", 1000, 10);
stocks["INTC"] = new Stock("INTC", 1000, 10);
stocks["JNJ"] = new Stock("JNJ", 1000, 10);
stocks["KO"] = new Stock("KO", 1000, 10);
stocks["JPM"] = new Stock("JPM", 1000, 10);
stocks["MCD"] = new Stock("MCD", 1000, 10);
stocks["MMM"] = new Stock("MMM", 1000, 10);
stocks["MRK"] = new Stock("MRK", 1000, 10);
stocks["MSFT"] = new Stock("MSFT", 1000, 10);
stocks["NKE"] = new Stock("NKE", 1000, 10);
stocks["PG"] = new Stock("PG", 1000, 10);
stocks["TRV"] = new Stock("TRV", 1000, 10);
stocks["UNH"] = new Stock("UNH", 1000, 10);
stocks["CRM"] = new Stock("CRM", 1000, 10);
stocks["VZ"] = new Stock("VZ", 1000, 10);
stocks["V"] = new Stock("V", 1000, 10);
stocks["WBA"] = new Stock("WBA", 1000, 10);
stocks["WMT"] = new Stock("WMT", 1000, 10);
stocks["DIS"] = new Stock("DIS", 1000, 10);
stocks["DOW"] = new Stock("DOW", 1000, 10);



/*example of user objects
users = {
    "test@test.com": {

        "email": "test@test.com",
        "password": "password",

        "cash": 17.04,

        "holdings": {

            "NVAX": {quantity, bookcost},
            "SWKS": {quantity, bookcost},
            "AAPL": {quantity, bookcost},
            "FTS": {quantity, bookcost}
        }
    }
}
*/





function authenticateUser(userInfo) {
    //TODO make user database mongodb
    if (userInfo.email in users) {
        const thisUser = users[userInfo.email];
        if (thisUser.password === userInfo.password) {
            return thisUser;
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user";
    }
}

function registerUser(userInfo) {
    if (!(userInfo.email in users)) {
        const newUser = new UserAccount(userInfo.email, userInfo.password); //creates new user
        users[userInfo.email] = newUser;
        return newUser;
    } else {
        throw "user already exists";
    }
}


function fundAccount(fundRequestInfo) {
    if (fundRequestInfo.email in users) {
        const thisUser = users[fundRequestInfo.email];
        if (thisUser.password === fundRequestInfo.password) {
            thisUser.cash += parseInt(fundRequestInfo.amount);
            addActivityToUser("funds-activity", "Added " + fundRequestInfo.amount + " to account", fundRequestInfo.email);

            return thisUser;
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }

}

function withdrawAccount(withdrawRequestInfo) {
    if (withdrawRequestInfo.email in users) {
        const thisUser = users[withdrawRequestInfo.email];
        if (thisUser.password === withdrawRequestInfo.password) {
            if (thisUser.cash >= withdrawRequestInfo.amount) {
                thisUser.cash -= withdrawRequestInfo.amount;
                addActivityToUser("withdrawals-activity", "Withdrawn " + withdrawRequestInfo.amount + " from account", withdrawRequestInfo.email);
                return thisUser;
            } else {
                throw "not enough cash"
            }
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}

function placeBuyOrder(orderReq) {
    //checks if symbol exists
    if (orderReq.symbol in stocks) {
        //checks if user exists
        if (orderReq.email in users) {
            const thisUser = users[orderReq.email];
            if (thisUser.password === orderReq.password) {
                if (orderReq.maxMinPrice === "") {
                    orderReq.maxMinPrice = null;
                } else {
                    orderReq.maxMinPrice = parseInt(orderReq.maxMinPrice);
                }
                const order = new MarketOrder(orderReq.email,
                    "Buy",
                    uuidv4(),
                    parseInt(orderReq.quantity),
                    parseInt(orderReq.maxMinPrice),
                    orderReq.goodThrough,
                    orderReq.symbol);

                if (userOrders[orderReq.email] === undefined) {
                    userOrders[orderReq.email] = {};
                }
                stocks[orderReq.symbol].addBuyOrder(order);
                userOrders[orderReq.email][order.orderuuid] = order;
                addActivityToUser("buy-order-activity", "Placed purchase order from " + orderReq.quantity + " stocks [" + orderReq.symbol + "]", orderReq.email);
                return thisUser;
            } else {
                throw "wrong password"
            }
        } else {
            throw "no such user"
        }
    } else {
        throw "no such symbol"
    }

}

function placeSellOrder(orderReq) {
    //checks if symbol exists
    if (orderReq.symbol in stocks) {
        //checks if user exists
        if (orderReq.email in users) {
            const thisUser = users[orderReq.email];
            if (thisUser.password === orderReq.password) {
                const order = new MarketOrder(orderReq.email,
                    "Sell",
                    uuidv4(),
                    parseInt(orderReq.quantity),
                    parseInt(orderReq.maxMinPrice),
                    orderReq.goodThrough,
                    orderReq.symbol);



                if (userOrders[orderReq.email] === undefined) {
                    userOrders[orderReq.email] = {};
                }
                stocks[orderReq.symbol].addSellOrder(order);

                userOrders[orderReq.email][order.orderuuid] = order;

                addActivityToUser("sell-order-activity", "Placed sell order of " + orderReq.quantity + " stocks [" + orderReq.symbol + "]", orderReq.email);
                return thisUser;
            } else {
                throw "wrong password"
            }
        } else {
            throw "no such user"
        }
    } else {
        throw "no such symbol"
    }

}

function getStockData(req) {
    if (req.symbol in stocks) {
        return stocks[req.symbol].getSnapShot();
    } else {
        throw "no such stock"
    }
}


function cancelOrder(req) {
    if (req.email in users) {
        const thisUser = users[req.email];
        if (thisUser.password === req.password) {
            const thisOrder = req.order;
            if (req.order.operation === "Buy") {
                if (stocks[thisOrder.symbol].buyOrders[thisOrder.orderuuid].resolution !== "Processed" ||
                    stocks[thisOrder.symbol].buyOrders[thisOrder.orderuuid].resolution !== "Cancelled" ||
                    stocks[thisOrder.symbol].buyOrders[thisOrder.orderuuid].resolution !== "Expired") {
                    stocks[thisOrder.symbol].buyOrders[thisOrder.orderuuid].resolution = "Cancelled";
                    userOrders[thisUser.email][thisOrder.orderuuid].resolution = "Cancelled";
                    return thisUser;
                }
            } else {
                if (stocks[thisOrder.symbol].sellOrders[thisOrder.orderuuid].resolution !== "Processed" ||
                    stocks[thisOrder.symbol].sellOrders[thisOrder.orderuuid].resolution !== "Cancelled" ||
                    stocks[thisOrder.symbol].sellOrders[thisOrder.orderuuid].resolution !== "Expired") {
                    stocks[thisOrder.symbol].sellOrders[thisOrder.orderuuid].resolution = "Cancelled";
                    userOrders[thisUser.email][thisOrder.orderuuid].resolution = "Cancelled";
                    return thisUser;
                }
            }
            throw "order already processed"
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}

function getUserOrders(req) {
    //checks if user exists
    if (req.email in users) {
        let thisUser = users[req.email];
        //checks if password matches
        if (thisUser.password === req.password) {
            if (userOrders[thisUser.email] === undefined) {
                userOrders[thisUser.email] = {}
            }
            return userOrders[thisUser.email];
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}

function APIGetStock(paramSymbol, paramMinPrice, paramMaxPrice) {
    let returnArray = {};

    while (Object.keys(returnArray).length === 0) {
        for (symbol in stocks) {
            if (paramSymbol === undefined || symbol.includes(paramSymbol)) {
                if (paramMinPrice === undefined || stocks[symbol].curPrice >= parseInt(paramMinPrice)) {
                    if (paramMaxPrice === undefined || stocks[symbol].curPrice <= parseInt(paramMaxPrice)) {
                        returnArray[symbol] = stocks[symbol].getSnapShot();
                    }
                }
            }
        }
        if (!paramMaxPrice === undefined) {
            paramMaxPrice = undefined;
            continue;
        }
        if (!paramMinPrice === undefined) {
            paramMinPrice = undefined;
            continue;
        }
        if (!paramSymbol === undefined) {
            paramSymbol = undefined;
            continue;
        } else {
            return returnArray;
        }
    }
    return returnArray;
}

function createWatchlist(req) {
    //checks if user exists
    if (req.email in users) {
        let thisUser = users[req.email];
        //checks if password matches
        if (thisUser.password === req.password) {
            if (userWatchlists[thisUser.email] === undefined) {
                userWatchlists[thisUser.email] = {}
            }
            if (userWatchlists[thisUser.email][req.watchListName] === undefined) {
                userWatchlists[thisUser.email][req.watchListName] = [];
            } else {
                throw "watchlist already exists"
            }
            return thisUser;
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}

function getUserWatchlists(req) {
    //checks if user exists
    if (req.email in users) {
        let thisUser = users[req.email];
        //checks if password matches
        if (thisUser.password === req.password) {
            if (userWatchlists[thisUser.email] === undefined) {
                userWatchlists[thisUser.email] = {};
            }
            return userWatchlists[thisUser.email];
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}

function deleteWatchlist(req) {
    //checks if user exists
    if (req.email in users) {
        let thisUser = users[req.email];
        //checks if password matches
        if (thisUser.password === req.password) {
            if (userWatchlists[thisUser.email] === undefined) {
                userWatchlists[thisUser.email] = {}
            }
            delete userWatchlists[thisUser.email][req.watchListName];
            return thisUser;
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}

function addStockToWatchlist(req) {
    //checks if user exists
    if (req.email in users) {
        let thisUser = users[req.email];
        //checks if password matches
        if (thisUser.password === req.password) {
            if (userWatchlists[thisUser.email] === undefined) {
                userWatchlists[thisUser.email] = {};
            }
            if (userWatchlists[thisUser.email][req.watchlist] === undefined) {
                userWatchlists[thisUser.email][req.watchlist] = [];
            }
            userWatchlists[thisUser.email][req.watchlist].push(req.stock);
            return thisUser;
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}

function removeStockFromWatchlist(req) {
    //checks if user exists
    if (req.email in users) {
        let thisUser = users[req.email];
        //checks if password matches
        if (thisUser.password === req.password) {
            if (userWatchlists[thisUser.email] === undefined) {
                userWatchlists[thisUser.email] = {};
            }
            if (userWatchlists[thisUser.email][req.watchlist] === undefined) {
                userWatchlists[thisUser.email][req.watchlist] = [];
            }
            userWatchlists[thisUser.email][req.watchlist].splice(userWatchlists[thisUser.email][req.watchlist].indexOf(req.stock), 1);
            return thisUser;
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}

class alarm {
    constructor(symbol, change, comparisonPrice) {
        this.uuid = uuidv4();
        this.symbol = symbol;
        this.change = change;
        this.comparisonPrice = comparisonPrice;
        this.enabled = true;
        this.expiredForToday = false;
    }
}


function setAlarm(req) {
    //checks if user exists
    if (req.email in users) {
        let thisUser = users[req.email];
        //checks if password matches
        if (thisUser.password === req.password) {
            if (userAlarms[thisUser.email] === undefined) {
                userAlarms[thisUser.email] = {};
            }
            newAlarm = new alarm(req.stock, parseInt(req.change), stocks[req.stock].open);
            userAlarms[thisUser.email][newAlarm.uuid] = newAlarm;
            return thisUser;
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}

function disableAlarm(req) {
    //checks if user exists
    if (req.email in users) {
        let thisUser = users[req.email];
        //checks if password matches
        if (thisUser.password === req.password) {
            if (userAlarms[thisUser.email] === undefined) {
                userAlarms[thisUser.email] = {};
                throw "no such alarm"
            }
            userAlarms[thisUser.email][req.alarm].enabled = false;
            return thisUser;
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}

function enableAlarm(req) {
    //checks if user exists
    if (req.email in users) {
        let thisUser = users[req.email];
        //checks if password matches
        if (thisUser.password === req.password) {
            if (userAlarms[thisUser.email] === undefined) {
                userAlarms[thisUser.email] = {};
                throw "no such alarm"
            }
            userAlarms[thisUser.email][req.alarm].enabled = true;
            return thisUser;
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}

function changeAlarm(req) {
    //checks if user exists
    if (req.email in users) {
        let thisUser = users[req.email];
        //checks if password matches
        if (thisUser.password === req.password) {
            if (userAlarms[thisUser.email] === undefined) {
                userAlarms[thisUser.email] = {};
                throw "no such alarm"
            }
            userAlarms[thisUser.email][req.alarm].change = req.val;
            return thisUser;
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}

function deleteAlarm(req) {
    //checks if user exists
    if (req.email in users) {
        let thisUser = users[req.email];
        //checks if password matches
        if (thisUser.password === req.password) {
            if (userAlarms[thisUser.email] === undefined) {
                userAlarms[thisUser.email] = {};
                throw "no such alarm"
            }
            delete userAlarms[thisUser.email][req.alarm];
            return thisUser;
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}


function getUserAlarms(req) {
    //checks if user exists
    if (req.email in users) {
        let thisUser = users[req.email];
        //checks if password matches
        if (thisUser.password === req.password) {
            if (userAlarms[thisUser.email] === undefined) {
                userAlarms[thisUser.email] = {};
            }
            return userAlarms[thisUser.email];
        } else {
            throw "wrong password"
        }
    } else {
        throw "no such user"
    }
}

function addActivityToUser(type, description, user) {
    if (userActivities[user] === undefined) {
        userActivities[user] = {};
    }

    if (userActivities[user][type] === undefined) {
        userActivities[user][type] = [];
    }

    userActivities[user][type].push(description);
}

function getUserActivity(req) {
    //checks if user exists
    console.log(1);
    if (req.email in users) {
        console.log(2);
        let thisUser = users[req.email];
        console.log(3);
        //checks if password matches
        if (thisUser.password === req.password) {
            console.log(4);
            if (userActivities[req.email] === undefined) {
                userActivities[req.email] = {};
            }

            if (userActivities[req.email][req.type] === undefined) {
                console.log(5);
                userActivities[req.email][req.type] = [];
                console.log(6);
            }
            console.log(7);
            return userActivities[req.email][req.type];
        } else {
            console.log(8);
            throw "wrong password"
        }

    } else {
        console.log(9);
        throw "no such user"
    }
}




exports.authenticateUser = authenticateUser;
exports.registerUser = registerUser;
exports.fundAccount = fundAccount;
exports.withdrawAccount = withdrawAccount;
exports.placeBuyOrder = placeBuyOrder;
exports.placeSellOrder = placeSellOrder;
exports.getStockData = getStockData;
exports.APIGetStock = APIGetStock;
exports.cancelOrder = cancelOrder;
exports.getUserOrders = getUserOrders;
exports.createWatchlist = createWatchlist;
exports.getUserWatchlists = getUserWatchlists;
exports.deleteWatchlist = deleteWatchlist;
exports.addStockToWatchlist = addStockToWatchlist;
exports.removeStockFromWatchlist = removeStockFromWatchlist;
exports.setAlarm = setAlarm;
exports.disableAlarm = disableAlarm;
exports.enableAlarm = enableAlarm;
exports.changeAlarm = changeAlarm;
exports.deleteAlarm = deleteAlarm;
exports.getUserAlarms = getUserAlarms;
exports.getUserActivity = getUserActivity;