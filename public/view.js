// JSON user token contains user info if user logged in. null if logged out


//const e = require("express");

//TODO put in session so that it isnt lost when refresh
let user = null;

const UPDATE_INTERVAL = 10000;


// JSON contains market info (e.g open/closed and days on)
let marketInfo = null;

//manages sign in/up form--------------------------------------------
const signInBox = document.querySelector("#sign-in-box");
const signUpBox = document.querySelector("#sign-up-box");

const signInForm = document.querySelector("#sign-in-form");
const signUpForm = document.querySelector("#sign-up-form");

const signUpLink = document.querySelector("#sign-up-link");
const signInLink = document.querySelector("#sign-in-link");

signInForm.addEventListener("submit", e => {
    e.preventDefault();

    const email = signInForm["sign-in-email"].value;
    const password = signInForm["sign-in-password"].value;
    signInForm.reset();

    //Controller Function
    controllerSignIn(email, password);
});

signUpForm.addEventListener("submit", e => {
    e.preventDefault();

    const email = signUpForm["sign-up-email"].value;
    const password = signUpForm["sign-up-password"].value;
    signUpForm.reset();

    //Controller Function
    controllerSignUp(email, password);
});

signUpLink.addEventListener("click", e => {
    e.preventDefault();

    signInForm.reset();

    signInBox.style.display = "none";
    signUpBox.style.display = "inline-block";
});

signInLink.addEventListener("click", e => {
    e.preventDefault();

    signUpForm.reset();

    signInBox.style.display = "inline-block";
    signUpBox.style.display = "none";
});
//manages sign in/up form--------------------------------------------

//-------------------------------------------------------------------

//manages notifications----------------------------------------------
const notifOverlay = document.querySelector("#notif-overlay");
const notifBox = document.querySelector("#notif-box");
const notifTitle = document.querySelector("#notif-title");
const notifMessage = document.querySelector("#notif-message");
const exitX = document.querySelector("#exit-X");

exitX.addEventListener("click", e => {
    notifOverlay.style.display = "none";
});

notifOverlay.addEventListener("click", e => {
    notifOverlay.style.display = "none";
});

function viewShowNotification(title, message) {
    notifTitle.innerHTML = title;
    notifMessage.innerHTML = message;
    notifOverlay.style.display = "flex";
}
//manages notifications----------------------------------------------

//-------------------------------------------------------------------

//manages sign in/out process----------------------------------------
//major sections:
const homeSection = document.querySelector("#home-section");
const marketInfoSection = document.querySelector("#date-and-logout-section");
const logOutButton = document.querySelector("#log-out-btn");

logOutButton.onclick = e => {
    controllerSignOut();
}

function viewSignOut() {
    viewHideNavBar();
    viewHideAllSections();
    viewHideSearchSection();
    marketInfoSection.style.display = "none";
    homeSection.style.display = "flex";
}

function viewSignIn() {
    homeSection.style.display = "none";
    marketInfoSection.style.display = "flex";
    viewShowSearchSection()
    viewShowNavBar();
}
//manages sign in/out process----------------------------------------

//-------------------------------------------------------------------

//manages search section process-------------------------------------
const searchSection = document.querySelector("#search-section");

const welcomeMessage = document.querySelector("#welcome-message");

const watchListLink = document.querySelector("#watchlists-link");
const watchlistsPopupMenu = document.querySelector("#watchlists-popup-menu");
const watchlistMenuExitButton = document.querySelector("#exit-watchlists-popup-menu");
const watchlistMenuSelect = document.querySelector("#popup-watchlist-dropdown");
const watchlistContainer = document.querySelector("#watchlist-popup-row-container");
const watchlistManageLink = document.querySelector("#manage-watchlists-link");

const searchInput = document.querySelector("#search-input");
const searchForm = document.querySelector("#search-form");
const searchResultsMenu = document.querySelector("#search-results-menu");

watchlistManageLink.onclick = e => {
    e.preventDefault();
    controllershowSetAlarmSection();
}

watchListLink.onclick = e => {
    e.preventDefault();

    if (watchlistsPopupMenu.style.display === "none") {
        controllerShowWatchListPopupMenu();
    } else {
        watchlistsPopupMenu.style.display = "none";
    }
}

watchlistMenuExitButton.onclick = e => {
    watchlistsPopupMenu.style.display = "none";
}

searchInput.addEventListener("keyup", e => {
    if (searchInput.value === "") {
        searchResultsMenu.style.display = "none";
    } else {
        controllerSearchStocks(searchInput.value);
    }
});

searchForm.addEventListener("submit", e => {
    e.preventDefault();
    if (searchInput.value === "") {
        searchResultsMenu.style.display = "none";
    } else {
        controllerSearchStocks(searchInput.value);
    }
});

watchlistMenuSelect.addEventListener("change", e => {
    controllerPopulateWatchlistContainer(watchlistMenuSelect.value);
});

function viewPopulateStockSearchResults(results) {
    searchResultsMenu.innerHTML = "";

    for (const stock in results) {
        newStockLink = document.createElement("a");
        newStockLink.href = "";
        newStockLink.innerHTML = stock;
        newStockLink.classList.add("link");
        newStockLink.id = "stock-link-" + stock;
        newStockLink.addEventListener("click", e => {
            e.preventDefault();
            controllerLoadStockPage(stock);
        });
        randDiv = document.createElement("div");
        randDiv.appendChild(newStockLink);
        searchResultsMenu.appendChild(randDiv);
    }
    searchResultsMenu.style.display = "block";
}

function viewHideSearchSection() {
    searchSection.style.display = "none";
}

function viewShowSearchSection() {
    welcomeMessage.innerHTML = "Welcome <b>" + user.email.split("@")[0]; + "</b>";
    searchSection.style.display = "flex";
}

function viewPopulateWatchlistPopupMenu(watchlists) {
    watchlistsPopupMenu.style.display = "block";
    watchlistMenuSelect.innerHTML = "";

    if (JSON.stringify(watchlists) === '{}') {
        watchlistContainer.innerHTML = "";
        newHoldingRow = document.createElement("div");
        newHoldingRow.classList.add("holding-row");
        newHoldingRow.innerHTML = "<p class=\"paragraph\">You don't have any watchlists</p>";
        watchlistContainer.appendChild(newHoldingRow);
    } else {
        for (const watchlist in watchlists) {
            newOption = document.createElement("option");
            newOption.value = watchlist;
            newOption.innerHTML = watchlist;
            watchlistMenuSelect.appendChild(newOption);
        }
        viewPopulateWatchlistContainer(watchlists[Object.keys(watchlists)[0]], Object.keys(watchlists)[0]);
    }
}

function viewPopulateWatchlistContainer(watchlist, watchlistName) {
    watchlistContainer.innerHTML = "";
    //let rowCounter = 0;

    if (watchlist === undefined || watchlist.length == 0) {
        newHoldingRow = document.createElement("div");
        newHoldingRow.classList.add("holding-row");
        newHoldingRow.innerHTML = "<p class=\"paragraph\">You don't have any stocks in this watchlist</p>";
        watchlistContainer.appendChild(newHoldingRow);
    } else {
        watchlist.forEach(function(stock, i) {
            newHoldingRow = document.createElement("div");
            newHoldingRow.classList.add("holding-row");
            if (i % 2 === 0) {
                newHoldingRow.classList.add("even-holding-row");
            }

            stockLink = document.createElement("a");
            stockLink.classList.add("link");
            stockLink.innerHTML = stock;
            stockLink.href = "";
            stockLink.id = "watch-list-stock-link" + stock + i;
            stockLink.addEventListener("click", e => {
                e.preventDefault();
                controllerLoadStockPage(stock);
            });

            delButton = document.createElement("button");
            delButton.classList.add("bin-button");
            delButton.id = "del-btn-stock-" + stock + i;
            delButton.addEventListener("click", e => {
                e.preventDefault();
                controllerDeleteStockFromWatchList(watchlistName, stock);
            });

            newHoldingRow.appendChild(stockLink);
            newHoldingRow.appendChild(delButton);

            watchlistContainer.appendChild(newHoldingRow);
        });
    }



}
//manages search section process-------------------------------------

//-------------------------------------------------------------------

//manages navbar tabs and sections process---------------------------
const navBar = document.querySelector("#nav-bar");

//navbar elements:
const myPortfolioNavBarEle = document.querySelector("#my-portfolio");
const placeOrderNavBarEle = document.querySelector("#place-order");
const myOrdersNavBarEle = document.querySelector("#my-orders");
const activityNavBarEle = document.querySelector("#activity");
const fundWithdrawNavBarEle = document.querySelector("#fund-withdraw");
const setAlarmNavBarEle = document.querySelector("#set-alarm");

myPortfolioNavBarEle.addEventListener("click", e => {
    controllerShowMyPortfolioSection();
});

placeOrderNavBarEle.addEventListener("click", e => {
    controllerShowPlaceOrderSection();
});

myOrdersNavBarEle.addEventListener("click", e => {
    controllerShowMyOrdersSection();
});

activityNavBarEle.addEventListener("click", e => {
    controllerShowActivitySection();
});

fundWithdrawNavBarEle.addEventListener("click", e => {
    controllerShowFundWithdrawSection();
});

setAlarmNavBarEle.addEventListener("click", e => {
    console.log("k");
    controllershowSetAlarmSection();
    console.log("waddap");
});

function viewShowNavBar() {
    navBar.style.display = "flex";
    //TODO save which section was open in session to go straight to it on reload
    myPortfolioNavBarEle.classList.add("selected-nav-bar-element");
    controllerShowMyPortfolioSection();
}

function viewHideNavBar() {
    viewDeselectAllNavBarElements();
    navBar.style.display = "none";
}

function viewDeselectAllNavBarElements() {
    //helper funtion that deselects all navabr elements
    myPortfolioNavBarEle.classList.remove("selected-nav-bar-element");
    placeOrderNavBarEle.classList.remove("selected-nav-bar-element");
    myOrdersNavBarEle.classList.remove("selected-nav-bar-element");
    activityNavBarEle.classList.remove("selected-nav-bar-element");
    fundWithdrawNavBarEle.classList.remove("selected-nav-bar-element");
    setAlarmNavBarEle.classList.remove("selected-nav-bar-element");
}
//manages navbar tabs and sections process---------------------------

//-------------------------------------------------------------------

//manages displaying/hiding sections---------------------------------
function viewHideAllSections() {
    //TODO delets all saved data
    myPortfolioSection.style.display = "none";
    fundWithdrawSection.style.display = "none";
    placeOrderSection.style.display = "none";
    myOrdersSection.style.display = "none";
    stockInfoSection.style.display = "none";
    setAlarmSection.style.display = "none";
    watchlistsPopupMenu.style.display = "none";
    searchResultsMenu.style.display = "none";
    searchInput.value = "";
    activitySection.style.display = "none";
    //TODO add rest of sections
}
//manages displaying/hiding sections---------------------------------

//-------------------------------------------------------------------

//manages displaying/hiding myPortfolio section----------------------
const myPortfolioSection = document.querySelector("#my-portfolio-section");
const unrealizedGainLossEle = document.querySelector("#total-unrealized-gain-loss");
const combinedBookCostEle = document.querySelector("#combined-book-cost");
const combinedTotalEle = document.querySelector("#combined-total");

const cashEle = document.querySelector("#cash");
const investmentsEle = document.querySelector("#investments");
const totalEle = document.querySelector("#total");

const rowContainer = document.querySelector("#holding-rows-container");

function viewShowMyPortfolioSection(unrealizedGainLoss,
    combinedBookCost,
    cash,
    investments,
    total,
    holdings) {

    viewDeselectAllNavBarElements();
    myPortfolioNavBarEle.classList.add("selected-nav-bar-element");

    unrealizedGainLossEle.innerHTML = "$" + unrealizedGainLoss;
    combinedBookCostEle.innerHTML = "$" + combinedBookCost;
    combinedTotalEle.innerHTML = "$" + total;

    cashEle.innerHTML = "$" + cash;
    investmentsEle.innerHTML = "$" + investments;
    totalEle.innerHTML = "$" + total;

    myPortfolioSection.style.display = "block";

    rowContainer.innerHTML = "";
    let holdingCounter = 1;
    for (symbol in holdings) {
        let newHoldingRow = document.createElement("div");
        newHoldingRow.classList.add("holding-row");
        if (holdingCounter % 2 === 0) {
            newHoldingRow.classList.add("even-holding-row");
        }
        let symbolP = document.createElement("p");
        symbolP.classList.add("paragraph");
        symbolP.innerHTML = symbol;

        let quantityP = document.createElement("p");
        quantityP.classList.add("paragraph");
        quantityP.innerHTML = holdings[symbol].quantity;

        let bookCostP = document.createElement("p");
        bookCostP.classList.add("paragraph");
        bookCostP.innerHTML = parseInt(holdings[symbol].average) * parseInt(holdings[symbol].quantity);

        let marketValueP = document.createElement("p");
        marketValueP.classList.add("paragraph");

        function marketValueInnerHTMLCallBack(info) {
            marketValueP.innerHTML = (holdings[symbol].quantity * info.curPrice);
        }
        controllerGetCurStockData(symbol, marketValueInnerHTMLCallBack);

        let avgP = document.createElement("p");
        avgP.classList.add("paragraph");
        avgP.innerHTML = holdings[symbol].average;

        let unrealizedGLP = document.createElement("p");
        unrealizedGLP.classList.add("paragraph");

        function unrealizedGLPInnerHTMLCallBack(info) {
            unrealizedGLP.innerHTML = ((holdings[symbol].quantity * info.curPrice) -
                parseInt(holdings[symbol].average) * parseInt(holdings[symbol].quantity));
        }
        controllerGetCurStockData(symbol, unrealizedGLPInnerHTMLCallBack);

        newHoldingRow.appendChild(symbolP);
        newHoldingRow.appendChild(quantityP);
        newHoldingRow.appendChild(bookCostP);
        newHoldingRow.appendChild(marketValueP);
        newHoldingRow.appendChild(avgP);
        newHoldingRow.appendChild(unrealizedGLP);

        rowContainer.appendChild(newHoldingRow);

        holdingCounter += 1;
    }

}

//TODO hide and delete user info function

//manages displaying/hiding myPortfolio section----------------------

//-------------------------------------------------------------------

//manages displaying/hiding myOrders section-------------------------

const myOrdersSection = document.querySelector("#my-orders-section");
const pendingOrdersDiv = document.querySelector("#pending-orders-container");
const processedOrdersDiv = document.querySelector("#processed-orders-container");

function viewUpdateOrdersDivs(userOrders) {
    pendingOrdersDiv.innerHTML = "";
    processedOrdersDiv.innerHTML = "";

    let pendingCount = 0;
    let processedCount = 0;
    let order;

    for (const orderuuid in userOrders) {
        order = userOrders[orderuuid];

        let newHoldingRow = document.createElement("div");
        newHoldingRow.classList.add("holding-row");

        let orderP = document.createElement("p");
        orderP.classList.add("paragraph");
        orderP.innerHTML = "<b>Order: </b>" + order.operation;

        let symbolP = document.createElement("p");
        symbolP.classList.add("paragraph");
        symbolP.innerHTML = "<b>Symbol: </b>" + order.symbol;

        let quantityP = document.createElement("p");
        quantityP.classList.add("paragraph");
        quantityP.innerHTML = "<b>Quantity: </b>" + order.initQuantity;

        let priceP = document.createElement("p");
        priceP.classList.add("paragraph");
        if (order.price === null) {
            priceP.innerHTML = "<b>Limit Price: </b>N/A";
        } else {
            priceP.innerHTML = "<b>Limit Price: </b>$" + order.price;
        }


        let statusP = document.createElement("p");
        statusP.classList.add("paragraph");
        statusP.innerHTML = "<b>Status: </b>" + order.resolution;

        newHoldingRow.appendChild(orderP);
        newHoldingRow.appendChild(symbolP);
        newHoldingRow.appendChild(quantityP);
        newHoldingRow.appendChild(priceP);
        newHoldingRow.appendChild(statusP);

        if (order.resolution === "Pending" || order.resolution === "Partial") {
            pendingCount += 1;

            let cancelbutton = document.createElement("button");
            cancelbutton.classList.add("bin-button");
            cancelbutton.id = "cancel-order-" + order.orderuuid;
            cancelbutton.addEventListener("click", e => {
                e.preventDefault();
                controllerCancelOrder(order);
            });

            newHoldingRow.appendChild(cancelbutton);

            if (pendingCount % 2 === 0) {
                newHoldingRow.classList.add("even-holding-row");
            }
            pendingOrdersDiv.appendChild(newHoldingRow);
        } else {
            processedCount += 1;
            if (processedCount % 2 === 0) {
                newHoldingRow.classList.add("even-holding-row");
            }
            processedOrdersDiv.appendChild(newHoldingRow);
        }
    }
}

function viewShowMyOrdersSection() {
    viewDeselectAllNavBarElements();
    myOrdersNavBarEle.classList.add("selected-nav-bar-element");
    myOrdersSection.style.display = "block";
}

//TODO hide and delete user info function

//manages displaying/hiding myOrders section-------------------------

//-------------------------------------------------------------------

//manages displaying/hiding fund/withdraw section--------------------
const fundWithdrawSection = document.querySelector("#fund-withdraw-section");
const fWCashAmountEle = document.querySelector("#fW-cash-amount");
const fwForm = document.querySelector("#fund-withdraw-form");

function viewShowFundWithdrawSection(cash) {
    viewDeselectAllNavBarElements();
    fundWithdrawNavBarEle.classList.add("selected-nav-bar-element");
    fWCashAmountEle.innerHTML = "Total Available Cash in Account: $" + cash;
    fundWithdrawSection.style.display = "block";
}

fwForm.addEventListener("submit", e => {
    e.preventDefault();

    const cashAmout = fwForm["cash-amount"].value;
    const operation = fwForm["operation"].value;
    fwForm.reset();

    if (operation === "Fund") {
        controllerFundAccount(cashAmout);
    } else {
        controllerWithdrawAccount(cashAmout);
    }
});
//manages displaying/hiding fund/withdraw section--------------------

//-------------------------------------------------------------------

//manages displaying/hiding place order section----------------------
const placeOrderSection = document.querySelector("#place-order-section");
const ordersForm = document.querySelector("#place-order-form");

function viewShowPlaceOrderSection() {
    viewDeselectAllNavBarElements();
    placeOrderNavBarEle.classList.add("selected-nav-bar-element");
    placeOrderSection.style.display = "block";
}

ordersForm.addEventListener("submit", e => {
    e.preventDefault();

    const orderOperation = ordersForm["order-operation"].value;
    const stockSymbol = ordersForm["stock-symbol"].value;
    const quantity = ordersForm["stock-quantity"].value;
    const maxMinPrice = ordersForm["max-min-price"].value;
    const goodThrough = ordersForm["good-through"].value;

    ordersForm.reset();

    if (orderOperation === "Buy") {
        controllerPlaceBuyOrder(stockSymbol, quantity, maxMinPrice, goodThrough);
    } else {
        controllerPlaceSellOrder(stockSymbol, quantity, maxMinPrice, goodThrough);
    }
});

//manages displaying/hiding place order section----------------------

//-------------------------------------------------------------------

//manages stock info section section---------------------------------
let viewingCurStock;

const stockInfoSection = document.querySelector("#stock-info-section");
const stockTitleName = document.querySelector("#stock-title-name");
const stockTitlePrice = document.querySelector("#stock-title-price");

const stockInfoOpen = document.querySelector("#stock-info-open");
const stockInfoBid = document.querySelector("#stock-info-bid");
const stockInfoAsk = document.querySelector("#stock-info-ask");
const stockInfoClose = document.querySelector("#stock-info-close");
const stockInfoVolume = document.querySelector("#stock-info-volume");
const stockInfoHigh = document.querySelector("#stock-info-high");
const stockInfoLow = document.querySelector("#stock-info-low");

const addStockToWatchlistForm = document.querySelector("#add-to-watchlist-form");
const addStockToWatchlistFormSelect = document.querySelector("#add-to-watchlist-select");

const setAlarmForm = document.querySelector("#alarm-form");

setAlarmForm.addEventListener("submit", e => {
    e.preventDefault();
    if (setAlarmForm["form-change-percentage"].value === "" || parseInt(setAlarmForm["form-change-percentage"].value) <= 0) {
        viewShowNotification("Error", "Can't have change percentage of 0.");
    } else {
        controllerSetNewAlarm(viewingCurStock, setAlarmForm["form-change-percentage"].value);
    }
});


addStockToWatchlistForm.addEventListener("submit", e => {
    e.preventDefault();

    if (addStockToWatchlistFormSelect.value === "") {
        viewShowNotification("Error", "Please Select a Watchlist First.")
    } else {
        controllerAddStockToWatchlist(addStockToWatchlistFormSelect.value, viewingCurStock);
    }
})

function viewShowStockPage(stock) {
    viewingCurStock = stock;
    viewDeselectAllNavBarElements();

    stockTitleName.innerHTML = stock.toUpperCase();
    stockInfoSection.style.display = "block";

    controllerPopulateWatchlistStockPageSelect();
}

function viewPopulateWatchlistStockPageSelect(watchlists) {
    addStockToWatchlistFormSelect.innerHTML = "";

    for (const watchlist in watchlists) {
        newOption = document.createElement("option");
        newOption.value = watchlist;
        newOption.innerHTML = watchlist;
        addStockToWatchlistFormSelect.appendChild(newOption);
    }
}

function viewUpdateStockData(stockData) {
    stockTitlePrice.innerHTML = stockData.curPrice;

    stockInfoOpen.innerHTML = "$" + stockData.open;
    stockInfoBid.innerHTML = stockData.lastBid + "/" + stockData.lastBidSize;
    stockInfoAsk.innerHTML = stockData.lastAsk + "/" + stockData.lastAskSize;
    stockInfoClose.innerHTML = "$" + stockData.close;
    stockInfoVolume.innerHTML = stockData.volume;
    stockInfoHigh.innerHTML = "$" + stockData.high;
    stockInfoLow.innerHTML = "$" + stockData.low;
}
//manages stock info section section---------------------------------

//-------------------------------------------------------------------

//manages my alarms section------------------------------------------
const setAlarmSection = document.querySelector("#my-alarms-section");

const newWatchListForm = document.querySelector("#new-watchlist-form");
const managerWatchlistsContainer = document.querySelector("#manager-watchlists-container");

const activeAlarmsContainer = document.querySelector("#active-alarms-container");
const disabledAlarmsContainer = document.querySelector("#disabled-alarms-container");

newWatchListForm.addEventListener("submit", e => {
    e.preventDefault();

    controllerCreateNewWatchList(newWatchListForm["new-watch-list-name"].value);
});

function viewShowSetAlarmSection() {
    setAlarmSection.style.display = "block";
}

function viewPopulateWatchlistManager(watchlists) {
    let rowCounter = 0;
    managerWatchlistsContainer.innerHTML = "";
    for (const name in watchlists) {
        newHoldingRow = document.createElement("div");
        newHoldingRow.classList.add("holding-row");
        if (rowCounter % 2 === 0) {
            newHoldingRow.classList.add("even-holding-row");
        }

        nameP = document.createElement("p");
        nameP.classList.add("paragraph");
        nameP.innerHTML = name;

        delButton = document.createElement("button");
        delButton.classList.add("bin-button");
        delButton.id = "del-watchlist-" + name;
        delButton.addEventListener("click", e => {
            controllerDeleteWatchlist(name);
        });

        newHoldingRow.appendChild(nameP);
        newHoldingRow.appendChild(delButton);

        managerWatchlistsContainer.appendChild(newHoldingRow);
        rowCounter += 1;
    }
}

function viewPopulateAlarms(alarms) {
    activeAlarmsContainer.innerHTML = "";
    disabledAlarmsContainer.innerHTML = "";
    let aCounter = 0;
    let dCounter = 0;

    for (const alarm in alarms) {
        newHoldingRow = document.createElement("div");
        newHoldingRow.classList.add("holding-row");

        p = document.createElement("p");
        p.classList.add("paragraph");
        p.innerHTML = "<b>Symbol: </b>" + alarms[alarm].symbol;

        changeDiv = document.createElement("div");
        changeDiv.style.display = "flex";
        changeDiv.innerHTML = "<p class=\"paragraph\"><b>Change Percentage</b></p>";

        changeInput = document.createElement("input");
        changeInput.classList.add("form-field-holding-row");
        changeInput.value = alarms[alarm].change;
        changeInput.type = "number";
        changeInput.id = "change-val-for-alarm" + alarm;
        changeInput.addEventListener("keyup", e => {
            e.preventDefault();
            if (changeInput.value === "" || parseInt(changeInput.value) <= 0) {
                viewShowNotification("Error", "Can't have change percentage of 0.");
            } else {
                controllerChangeAlarm(alarm, parseInt(changeInput.value));
            }
        });
        changeDiv.appendChild(changeInput);

        btnsDiv = document.createElement("div");
        btnsDiv.style.display = "flex";

        visbtn = document.createElement("button");
        if (alarms[alarm].enabled) {
            visbtn.classList.add("enabled-button");
            visbtn.id = "btn-disable-alarm" + alarm;
            visbtn.addEventListener("click", e => {
                e.preventDefault();
                controllerDisableAlarm(alarm);
            });
            aCounter += 1;
        } else {
            visbtn.classList.add("disabled-button");
            visbtn.id = "btn-enable-alarm" + alarm;
            visbtn.addEventListener("click", e => {
                e.preventDefault();
                controllerEnableAlarm(alarm);
            });
            dCounter += 1;
        }
        btnsDiv.appendChild(visbtn);

        delBtn = document.createElement("button");
        delBtn.classList.add("bin-button");
        delBtn.id = "del-btn-alarm-" + alarm;
        delBtn.addEventListener("click", e => {
            e.preventDefault();
            controllerDeleteAlarm(alarm);
        });
        btnsDiv.appendChild(delBtn);

        newHoldingRow.appendChild(p);
        newHoldingRow.appendChild(changeDiv);
        newHoldingRow.appendChild(btnsDiv);

        if (alarms[alarm].enabled) {
            if (aCounter % 2 === 0) {
                newHoldingRow.classList.add("even-holding-row");
            }
            activeAlarmsContainer.appendChild(newHoldingRow);
        } else {
            if (dCounter % 2 === 0) {
                newHoldingRow.classList.add("even-holding-row");
            }
            disabledAlarmsContainer.appendChild(newHoldingRow);
        }
    }

}
//manages my alarms section------------------------------------------

//-------------------------------------------------------------------

//manages activity section-------------------------------------------
const activitySection = document.querySelector("#activity-section");
const activityForm = document.querySelector("#activity-audit-form");
const activityContainer = document.querySelector("#custom-activity-container");

activityForm.addEventListener("submit", e => {
    e.preventDefault();

    controllerGetUserActivity(activityForm["select-activity"].value);
});

function viewShowActivitySection() {
    viewHideAllSections();
    activityNavBarEle.classList.add("selected-nav-bar-element");
    activitySection.style.display = "block";
}

function viewGetUserActivity(activity) {
    activityContainer.innerHTML = "";
    counter = 0;
    activity.forEach(function(activity, i) {
        newHoldingRow = document.createElement("div");
        newHoldingRow.classList.add("holding-row");
        newHoldingRow.innerHTML = "<p class=\"paragraph\">" + activity + "</p>";
        if (counter % 2 === 0) {
            newHoldingRow.classList.add("even-holding-row");
        }
        counter += 1;
        activityContainer.appendChild(newHoldingRow);
    });


}
//manages activity section-------------------------------------------

//-------------------------------------------------------------------

//manages page onload process----------------------------------------
const pageBody = document.querySelector("#page-body");
pageBody.onload = e => {
        if (user) {
            viewSignIn(user);
        }
    }
    //manages page onload process----------------------------------------






//controller 



function controllerSignIn(userEmail, userPassword) {
    //TODO encryption

    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/authenticate', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": userEmail, "password": userPassword }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to sign in. Please check your network");
    }

    request.onload = function() {
        if (this.status == 200) {
            user = JSON.parse(this.response);
            viewSignIn(user);
            //controllerInfoUpdater();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to sign in. Please check your email and password combination.");
        } else {
            viewShowNotification("Error:", "Failed to sign in due to unknown error, please try again later.");
        }
    }
}

function controllerSignUp(userEmail, userPassword) {
    //TODO encryption

    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/register', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": userEmail, "password": userPassword }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to sign up. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            viewSignIn(user);
            //controllerInfoUpdater();
            viewShowNotification("Welcome!", "Sign up was successful! You are logged in now!");
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to sign up. Please sign in if you already have an account.");
        } else {
            viewShowNotification("Error:", "Failed to sign up due to unknown error, please try again later.");
        }
    }
}


function controllerSignOut() {
    user = null;
    viewSignOut();
}

function controllerGetCurStockData(symbol, callback) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/stockdata', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "symbol": symbol }));
    //request.send(symbol);

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to fetch stock data. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            let res = JSON.parse(this.response);
            callback(res);
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to fetch stock data. Please check your network");
            //returnVal = {};
        } else {
            viewShowNotification("Error:", "Failed to fetch stock data. Please check your network");
            //returnVal = {};
        }
    }

}


function controllerShowMyPortfolioSection() {
    console.log("called controller");

    viewHideAllSections();

    let combinedBookCost = 0;
    let investments = 0;
    let unrealizedGainLoss = 0;
    let cash = user.cash;
    let total = cash + investments;

    viewShowMyPortfolioSection(unrealizedGainLoss,
        combinedBookCost,
        cash,
        investments,
        total,
        user.holdings);


    for (symbol in user.holdings) {
        console.log("dsa");
        controllerGetCurStockData(symbol, function(symbolInfo) {
            combinedBookCost += (user.holdings[symbol].average * user.holdings[symbol].quantity);
            console.log("fml" + combinedBookCost);
            investments += (user.holdings[symbol].quantity * symbolInfo.curPrice);
            unrealizedGainLoss += ((user.holdings[symbol].quantity * symbolInfo.curPrice) - (user.holdings[symbol].average * user.holdings[symbol].quantity));
            console.log("should be visible now");
            viewShowMyPortfolioSection(unrealizedGainLoss,
                combinedBookCost,
                cash,
                investments,
                total,
                user.holdings);
        });
    }


}


function controllerShowFundWithdrawSection() {
    viewHideAllSections();
    viewShowFundWithdrawSection(user.cash);
}

function controllerShowMyOrdersSection() {
    viewHideAllSections();
    viewShowMyOrdersSection();

    const request = new XMLHttpRequest();
    let userOrders;

    //TODO change port when production
    request.open('POST', '/userOrders', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to load your orders. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            userOrders = JSON.parse(this.response);
            //controllerInfoUpdater();
            viewUpdateOrdersDivs(userOrders);
            controllerStartUserOrdersUpdater();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to load your orders. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to load your orders due to unknown error, please try again later.");
        }
    }
}

function controllerCancelOrder(order) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/cancelOrder', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password, "order": order }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to send cancel request. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            viewShowNotification("Confirmation:", "Your order was cancelled successfully.<br> <b>NOTE:</b> Changes may not appear immediately on your dashboard.");
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to load your orders. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to load your orders due to unknown error, please try again later.");
        }
    }
}


function controllerStartUserOrdersUpdater() {
    //updates user orders every UPDATE_INTERVAL (miliseconds)
    setTimeout(function() {
        const request = new XMLHttpRequest();
        let userOrders;

        //TODO change port when production
        request.open('POST', '/userOrders', true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.send(JSON.stringify({ "email": user.email, "password": user.password }));

        request.onerror = function() {
            viewShowNotification("Error:", "Failed to load your orders. Please check your network");
            if (myOrdersSection.style.display !== "none") {
                controllerStartUserOrdersUpdater();
            }
        }

        request.onload = function() {
            console.log(this.status);
            if (this.status == 200) {
                userOrders = JSON.parse(this.response);
                //controllerInfoUpdater();
                viewUpdateOrdersDivs(userOrders);
            } else if (this.status == 401) {
                viewShowNotification("Error:", "Failed to load your orders. Please check your network");
            } else {
                viewShowNotification("Error:", "Failed to load your orders due to unknown error, please try again later.");
            }
            if (myOrdersSection.style.display !== "none") {
                controllerStartUserOrdersUpdater();
            }
        }
    }, UPDATE_INTERVAL);
}

//TODO select correct status codes
function controllerFundAccount(cashAmout) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/fund', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password, "amount": cashAmout }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to fund your account. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            //controllerInfoUpdater();
            viewShowNotification("Success!", "Total Available Cash in Account: $" + user.cash);
            controllerShowFundWithdrawSection();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to fund your account. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to sign in due to unknown error, please try again later.");
        }
    }
}


function controllerWithdrawAccount(cashAmout) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/withdraw', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password, "amount": cashAmout }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to withdraw from your account. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            //controllerInfoUpdater();
            viewShowNotification("Success!", "Total Available Cash in Account: $" + user.cash);
            controllerShowFundWithdrawSection();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to withdraw from your account. Please check balance.");
        } else {
            viewShowNotification("Error:", "Failed to sign in due to unknown error, please try again later.");
        }
    }
    controllerShowFundWithdrawSection();
}


function controllerShowPlaceOrderSection() {
    viewHideAllSections();
    viewShowPlaceOrderSection();
}


function controllerPlaceBuyOrder(stockSymbol, quantity, maxMinPrice, goodThrough) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/buy', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({
        "email": user.email,
        "password": user.password,
        "symbol": stockSymbol.toUpperCase(),
        "quantity": quantity,
        "maxMinPrice": maxMinPrice,
        "goodThrough": goodThrough
    }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to place order. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            //controllerInfoUpdater();
            viewShowNotification("Success!", "Your order was placed");
            //controllerShowFundWithdrawSection();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to place order. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to place order due to unknown error, please try again later.");
        }
    }
}


function controllerPlaceSellOrder(stockSymbol, quantity, maxMinPrice, goodThrough) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/sell', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({
        "email": user.email,
        "password": user.password,
        "symbol": stockSymbol.toUpperCase(),
        "quantity": quantity,
        "maxMinPrice": maxMinPrice,
        "goodThrough": goodThrough
    }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to place order. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            //controllerInfoUpdater();
            viewShowNotification("Success!", "Your order was placed");
            //controllerShowFundWithdrawSection();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to place order. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to place order due to unknown error, please try again later.");
        }
    }
}


function controllerSearchStocks(query) {
    //stock name search AJAX
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            viewPopulateStockSearchResults(JSON.parse(this.response));
        }
    };
    xhttp.open("GET", "stocks?symbol=" + query.toUpperCase(), true);
    xhttp.send();
}

function controllerLoadStockPage(stock) {

    //console.log("loading page for" + stock);

    viewHideAllSections();
    viewShowStockPage(stock);

    const request = new XMLHttpRequest();
    let stockData;

    //TODO change port when production
    request.open('POST', '/stockdata', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "symbol": stock }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to load stock data. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            stockData = JSON.parse(this.response);
            viewUpdateStockData(stockData);
            controllerStartStockDataUpdater();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to load stock data. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to load stock data due to unknown error, please try again later.");
        }
    }
}

let stockUpdaterOn = false;

function controllerStartStockDataUpdater() {
    console.log(stockUpdaterOn);

    if (!stockUpdaterOn) {
        stockUpdaterOn = true;
        //updates stock data every UPDATE_INTERVAL (miliseconds)
        stock = viewingCurStock;
        setTimeout(function() {
            if (stockInfoSection.style.display !== "none" && viewingCurStock === stock) {
                console.log("waited 10 now going for " + stock);
                const request = new XMLHttpRequest();
                let stockData;

                //TODO change port when production
                request.open('POST', '/stockdata', true);
                request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                request.send(JSON.stringify({ "symbol": stock }));

                request.onerror = function() {
                    viewShowNotification("Error:", "Failed to load stock data. Please check your network");
                    if (stockInfoSection.style.display !== "none" && viewingCurStock === stock) {
                        stockUpdaterOn = false;
                        controllerStartStockDataUpdater();
                    } else {
                        stockUpdaterOn = false;
                    }
                }

                request.onload = function() {
                    if (this.status == 200) {
                        stockData = JSON.parse(this.response);
                        viewUpdateStockData(stockData);
                    } else if (this.status == 401) {
                        viewShowNotification("Error:", "Failed to load stock data. Please check your network");
                    } else {
                        viewShowNotification("Error:", "Failed to load stock data due to unknown error, please try again later.");
                    }
                    if (stockInfoSection.style.display !== "none" && viewingCurStock === stock) {
                        stockUpdaterOn = false;
                        controllerStartStockDataUpdater();
                    } else {
                        stockUpdaterOn = false;
                    }
                }
            } else {
                stockUpdaterOn = false
            }
        }, UPDATE_INTERVAL);
    }
}

function controllershowSetAlarmSection() {
    viewHideAllSections();
    viewDeselectAllNavBarElements();
    setAlarmNavBarEle.classList.add("selected-nav-bar-element");
    viewShowSetAlarmSection();
    controllerPopulateAlarms();
    controllerUpdateWatchlistsInManager();
    console.log("heya");
    //todo start updaters
}

function controllerCreateNewWatchList(watchListName) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/createWatchlist', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password, "watchListName": watchListName }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to create watchlist. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            //console.log(user);
            viewShowNotification("Success:", "Watchlist created successfully");
            controllerUpdateWatchlistsInManager();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to create watchlist. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to create watchlist due to unknown error, please try again later.");
        }
    }
}


function controllerUpdateWatchlistsInManager() {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/getUserWatchlists', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to get watchlists. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            viewPopulateWatchlistManager(JSON.parse(this.response));
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to get watchlists. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to get watchlists due to unknown error, please try again later.");
        }
    }
}

function controllerDeleteWatchlist(name) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/deleteWatchlist', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password, "watchListName": name }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to delete watchlist. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            viewShowNotification("Success:", "Deleted Watchlist");
            controllerUpdateWatchlistsInManager();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to delete watchlist. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to delete watchlist due to unknown error, please try again later.");
        }
    }
}

function controllerShowWatchListPopupMenu() {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/getUserWatchlists', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to get watchlists. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            viewPopulateWatchlistPopupMenu(JSON.parse(this.response));
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to get watchlists. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to get watchlists due to unknown error, please try again later.");
        }
    }
}

function controllerPopulateWatchlistContainer(watchlist) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/getUserWatchlists', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to get watchlists. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            viewPopulateWatchlistContainer(JSON.parse(this.response)[watchlist], watchlist);
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to get watchlists. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to get watchlists due to unknown error, please try again later.");
        }
    }
}

function controllerPopulateWatchlistStockPageSelect() {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/getUserWatchlists', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to get watchlists. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            viewPopulateWatchlistStockPageSelect(JSON.parse(this.response));
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to get watchlists. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to get watchlists due to unknown error, please try again later.");
        }
    }
}

function controllerAddStockToWatchlist(watchlist, stock) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/addStockToWatchlist', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password, "watchlist": watchlist, "stock": stock }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to add stock to watchlist. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            viewShowNotification("Success:", "Stock added to watchlist");
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to add stock to watchlist. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to add stock to watchlist due to unknown error, please try again later.");
        }
    }
}

function controllerDeleteStockFromWatchList(watchlist, stock) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/removeStockFromWatchlist', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password, "watchlist": watchlist, "stock": stock }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to remove stock from watchlist. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            viewShowNotification("Success:", "removed stock from watchlist");
            controllerPopulateWatchlistContainer();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to remove stock from watchlist. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to remove stock from watchlist due to unknown error, please try again later.");
        }
    }
}

function controllerPopulateAlarms() {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/getUserAlarms', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to get alarms. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            let alarmsResponse = JSON.parse(this.response);
            viewPopulateAlarms(alarmsResponse);
            controllerStartAlarms(alarmsResponse);
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to set alarm. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to set alarm due to unknown error, please try again later.");
        }
    }
}

function controllerSetNewAlarm(stock, change) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/setAlarm', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password, "stock": stock, "change": change }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to set alarm. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            viewShowNotification("Success:", "Alarm Set!");
            controllerPopulateAlarms();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to set alarm. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to set alarm due to unknown error, please try again later.");
        }
    }
}

function controllerDisableAlarm(alarm) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/disableAlarm', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password, "alarm": alarm }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to disable alarm. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            controllerPopulateAlarms();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to disable alarm. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to disable alarm due to unknown error, please try again later.");
        }
    }
}

function controllerEnableAlarm(alarm) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/enableAlarm', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password, "alarm": alarm }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed enable alarm. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            controllerPopulateAlarms();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed enable alarm. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed enable alarm due to unknown error, please try again later.");
        }
    }
}

function controllerChangeAlarm(alarm, newVal) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/changeAlarm', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password, "alarm": alarm, "val": newVal }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed edit alarm. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            controllerPopulateAlarms();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed edit alarm. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed edit alarm due to unknown error, please try again later.");
        }
    }
}

function controllerDeleteAlarm(alarm) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/deleteAlarm', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password, "alarm": alarm }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed delete alarm. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            user = JSON.parse(this.response);
            controllerPopulateAlarms();
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed delete alarm. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed delete alarm due to unknown error, please try again later.");
        }
    }
}
/*
let alarmUpdaterList = [];
class alarmUpdater {
    constructor(symbol, enabled, comparisonPrice, change) {
        this.symbol = symbol;
        this.enabled = enabled;
        this.comparisonPrice = comparisonPrice;
        this.change = change;
        this.alarmDeleted = false;
    }
    startAlarmUpdater() {
        setTimeout(function() {
            console.log("WTF IS HAPPENING");
            console.log(this.alarmDeleted);
            console.log(this.enabled);
            if ((!this.alarmDeleted) && this.enabled) {

                controllerGetCurStockData(symbol, stockData => {
                    if (((comparisonPrice * ((change / 100) + 1)) <= stockData.curPrice) ||
                        ((comparisonPrice * (1 - (change / 100))) >= stockData.curPrice)) {
                        viewShowNotification("ALARM NOTIFICATION:", "The stocks are movin'! [" + symbol + "]");
                        //todo expire (disable) today on server
                        this.deleteAlarmUpdater();
                    } else {
                        console.log("failed this else");
                        this.startAlarmUpdater();
                    }
                });
            } else {
                console.log("failed this else 2");
            }

        }, UPDATE_INTERVAL);
    }

    deleteAlarmUpdater() {
        console.log("deleted alarm");
        this.alarmDeleted = true;
    }
}
*/

let allAlarms;
let alarmsUpdaterOn = false;

function controllerStartAlarms(alarms) {
    /*

    alarmUpdaterList.forEach(function(item, index) {
        item.deleteAlarmUpdater();
    });

    alarmUpdaterList = [];

    for (alarm in alarms) {
        newAlarmUpdater = new alarmUpdater(alarms[alarm].symbol, alarms[alarm].enabled, alarms[alarm].comparisonPrice, alarms[alarm].change);
        alarmUpdaterList.push(newAlarmUpdater);
        console.log("here is alarm");
        console.log(newAlarmUpdater);
        newAlarmUpdater.startAlarmUpdater();
    }

    console.log(alarmUpdaterList);
    */
    allAlarms = alarms;

    if (!alarmsUpdaterOn) {
        controllerAlarmsUpdater();
    }
}

function controllerAlarmsUpdater() {
    setTimeout(function() {
        for (alarmid in allAlarms) {
            alarm = allAlarms[alarmid];

            if (alarm.enabled) {

                controllerGetCurStockData(alarm.symbol, stockData => {
                    if (((alarm.comparisonPrice * ((alarm.change / 100) + 1)) <= stockData.curPrice) ||
                        ((alarm.comparisonPrice * (1 - (alarm.change / 100))) >= stockData.curPrice)) {
                        viewShowNotification("ALARM NOTIFICATION:", "The stocks are movin'! [" + alarm.symbol + "]");
                        controllerDisableAlarm(alarm.uuid);
                    } else {
                        console.log("failed this else");
                    }
                });
            } else {
                console.log("failed this else 2");
            }
        }
        if (user) {
            controllerAlarmsUpdater();
        } else {
            alarmsUpdaterOn = false;
        }


    }, UPDATE_INTERVAL);
}

function controllerShowActivitySection() {
    viewDeselectAllNavBarElements();
    viewShowActivitySection();
}

function controllerGetUserActivity(type) {
    const request = new XMLHttpRequest();

    //TODO change port when production
    request.open('POST', '/getUserActivity', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({ "email": user.email, "password": user.password, "type": type }));

    request.onerror = function() {
        viewShowNotification("Error:", "Failed to get user activity. Please check your network");
    }

    request.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            viewGetUserActivity(JSON.parse(this.response));
        } else if (this.status == 401) {
            viewShowNotification("Error:", "Failed to get user activity. Please check your network");
        } else {
            viewShowNotification("Error:", "Failed to get user activity to unknown error, please try again later.");
        }
    }
}