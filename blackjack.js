/* "Globals" */
var doesDealerHitOnSoft17 = true;
var players = [];
var playerWins = [];
var playerMoneyWins = [];
var houseProfit = 0;
var dealerHand = [];
var dealerBlackjackCount = 0;
var minbet = 5;
var shouldModifyBet = false;
var probModifier = 0.4;
var modifier = 3;
var numPlayers = 1;
var numTrials = 24000;
var deck = ['a', 'a', 'a', 'a',
            2, 2, 2, 2, 3, 3, 3, 3,
            4, 4, 4, 4, 5, 5, 5, 5,
            6, 6, 6, 6, 7, 7, 7, 7,
            8, 8, 8, 8, 9, 9, 9, 9,
            10, 10, 10, 10, 10, 10, 10, 10,
            10, 10, 10, 10, 10, 10, 10, 10];
var newDeck = ['a', 'a', 'a', 'a',
            2, 2, 2, 2, 3, 3, 3, 3,
            4, 4, 4, 4, 5, 5, 5, 5,
            6, 6, 6, 6, 7, 7, 7, 7,
            8, 8, 8, 8, 9, 9, 9, 9,
            10, 10, 10, 10, 10, 10, 10, 10,
            10, 10, 10, 10, 10, 10, 10, 10];
var playerRulePreferences = {
    dealerShows7 : 16,
    hitOnSoft17 : true
};
var badPlayerRulePreferences = {
    dealerShows7 : 15,
    hitOnSoft17 : false
};
            
initGlobals();
letsPlay(numTrials, numPlayers);

function initGlobals() {
    playerWins = new Array(numPlayers);
    playerMoneyWins = new Array(numPlayers);
    for (var i = 0; i < playerWins.length; i++) {
        playerWins[i] = 0;
        playerMoneyWins[i] = 0;
    }
}

function resetDeck() {
    deck = [];
    for (var i = 0; i < newDeck.length; i++) {
        deck.push(newDeck[i]);
    }
}

function letsPlay(numTrials, numPlayers) {
    for (var trials = 0; trials < numTrials; trials++) {
        resetDeck();
        players = [];
        dealerHand = [];
        for (var i = 0; i < numPlayers; i++) {
            var playerHandArr = [];
            players.push(playerHandArr);
        }
        firstDeal(numPlayers);
        //console.log(players);
        //console.log(dealerHand);
        
        var dealerShownCard = dealerHand[0];
        //If dealer gets blackjack on first two cards
        if (playerOptimalHandTotal(dealerHand) == 21) {
            dealerBlackjackCount ++;
            calculateWinners();
            continue;
        }
        
        //Hits by players in turn
        for (var i = 0; i < numPlayers; i++) {
            var prefs = playerRulePreferences;
            //if (i >= numPlayers - 2) prefs = badPlayerRulePreferences;
            var playerHand = players[i];
            var shouldPlayerHit = shouldPlayerHitOnTotal(playerOptimalHandTotal(playerHand), dealerShownCard, playerSoftAceCheck(playerHand), prefs);
            while (shouldPlayerHit) {
                players[i].push(dealOneCard(deck));
                playerHand = players[i];
                shouldPlayerHit = shouldPlayerHitOnTotal(playerOptimalHandTotal(playerHand), dealerShownCard, playerSoftAceCheck(playerHand), prefs);
            }
        }
        
        //Dealer's turn
        var shouldDealerHit = shouldDealerHitOnTotal(playerOptimalHandTotal(dealerHand), playerSoftAceCheck(dealerHand));
        while (shouldDealerHit) {
            dealerHand.push(dealOneCard(deck));
            var dealerHandTotal = playerOptimalHandTotal(dealerHand);
            shouldDealerHit = shouldDealerHitOnTotal(dealerHandTotal, playerSoftAceCheck(dealerHand));
        }
        calculateWinners();
        //console.log(players);
        //console.log(dealerHand);
    }
    calculateWinningStatistics();
    console.log(playerWins);
    console.log(playerMoneyWins);
    console.log("House profit: " + houseProfit);
}

function calculateWinners() {
    for (var i = 0; i < numPlayers; i++) {
        var bet = minbet;
        var prob = Math.random();
        if (shouldModifyBet && prob <= probModifier) bet *= probModifier;
        var playerWon = doesPlayerWin(playerOptimalHandTotal(players[i]), playerOptimalHandTotal(dealerHand));
        if (playerWon == 1) {
            playerWins[i] += 1;
            playerMoneyWins[i] += bet;
        } else if (playerWon == -1) {
            playerMoneyWins[i] -= bet;
        }
    }
}

function calculateWinningStatistics() {
    for (var i = 0; i < numPlayers; i++) {
        playerWins[i] = playerWins[i] / numTrials * 100.0 + "%";
        houseProfit -= playerMoneyWins[i];
    }
}

//return -1 for loss, 1 for win, 0 for push
function doesPlayerWin(pctotal, dctotal) {
    //player bust
    if (pctotal > 21) return -1;
    //dealer bust
    else if (dctotal > 21) return 1;
    //push
    else if (dctotal == pctotal) return 0;
    //player win
    else if (pctotal > dctotal) return 1;
    else return -1;
}

function firstDeal(numPlayers) {
    for (var i = 0; i < 2; i++) {
        for (var j = 0; j < numPlayers; j++) {
            players[j][i] = dealOneCard(deck);
        }
        dealerHand[i] = dealOneCard(deck);
    }
}

function dealOneCard(deck) {
    var cardIndexToDeal = Math.round((deck.length - 1) * Math.random());
    var cardValue = deck[cardIndexToDeal];
    deck.splice(cardIndexToDeal, 1);
    return cardValue;
}

function playerOptimalHandTotal(playerHand) {
    var total = 0;
    var aceCount = 0;
    for (var i = 0; i < playerHand.length; i++) {
        if (playerHand[i] == 'a') {
            total += 11;
            aceCount ++;
        }
        else total += playerHand[i];
    }
    if (aceCount > 0 && total > 21) {
        for (var i = 0; i < aceCount; i++) {
            total = total - 10;
            if (total <= 21) break;
        }
    }
    return total;
}

//Check for soft aces.  Soft aces are defined by the player having at 
//least one ace being able to have a value of 1 or 11 without 
//the total hand value being over 21
function playerSoftAceCheck(playerHand) {
    var handTotal = 0;
    var numAces = 0;
    for (var i = 0; i < playerHand.length; i++) {
        if (playerHand[i] == 'a') {
            handTotal += 11;
            numAces ++;
        } else handTotal += playerHand[i];
    }
    if (numAces == 0) return false;
    //Optimization...always soft ace if first two cards
    if (playerHand.length <= 2) return true;
    //If more than one ace
    if (numAces > 1) {
        var handTotalCheck = handTotal - ((numAces - 1) * 11) + (numAces - 1);
        if (handTotalCheck > 21) return false;
        else return true;
    }
    //If only one ace
    if (handTotal <= 21) return true;
    return false;
}

//Define the basic player rules
function shouldPlayerHitOnTotal(pcvalue, dcshown, isSoft, rulePrefs) {
    //Dealer shows 7 or higher
    if (dcshown >= 7) {
        if (pcvalue <= rulePrefs.dealerShows7) return true;
        //special rule that player should hit on "soft" 17
        else if (pcvalue == 17 && isSoft && rulePrefs.hitOnSoft17) return true;
        else return false;
    }
    //Dealer shows 6 or lower (including aces) 
    else {
        if (pcvalue >= 12 && pcvalue <= 15 && isSoft) return true;
        else if (pcvalue <= 11) return true;
        else return false;
    }
}

//Define the dealer rules
function shouldDealerHitOnTotal(dcvalue, isSoft17) {
    if (dcvalue == 17 && isSoft17 && doesDealerHitOnSoft17) return true;
    else if (dcvalue <= 16) return true;
    else return false;
}