/* "Globals" */
var doesDealerHitOnSoft17 = true;

console.log(shouldPlayerHit(6, 'a', 6, true));

/*
 Initially playerCard1 and playerCard2 are the first two cards received.
 After multiple hits, playerCard1 becomes the running total and playerCard2
 becomes the card just dealt
*/
function shouldPlayerHit(playerCard1, playerCard2, dealerCardShown, isSoft) {
    var pTotal1 = 0,
        pTotal2 = 0;
        
    //If player has aces
    if (playerCard1 == 'a' && playerCard2 == 'a') {
        pTotal1 = 2;
        pTotal2 = 12;
    }
    else if (playerCard1 == 'a') {
        pTotal1 = playerCard2 + 1;
        pTotal2 = playerCard2 + 11;
    } else if (playerCard2 == 'a') {
        pTotal1 = playerCard1 + 1;
        pTotal2 = playerCard1 + 11;
    } 
    if (isSoft) {
        var test1 = shouldPlayerHitOnTotal(pTotal1, dealerCardShown, true);
        var test2 = shouldPlayerHitOnTotal(pTotal2, dealerCardShown, true);
        if (!test1 || !test2) return false;
        else return true;
    }
    
    //If player has no aces
    return shouldPlayerHitOnTotal(playerCard1 + playerCard2, dealerCardShown, false);
}

//Define the basic player rules
function shouldPlayerHitOnTotal(pcvalue, dcshown, isSoft) {
    //Dealer shows 7 or higher
    if (dcshown >= 7) {
        if (pcvalue <= 16) return true;
        //special rule that player should hit on "soft" 17
        else if (pcvalue == 17 && isSoft) return true;
        else return false;
    }
    //Dealer shows 6 or lower (including aces) 
    else {
        console.log(pcvalue);
        if (pcvalue >= 12 && pcvalue <= 15 && isSoft) return true;
        else if (pcvalue <= 11) return true;
        else return false;
    }
}

//Define the dealer rules
function shouldDealerHit(dcvalue, isSoft17) {
    if (dcvalue <= 16) return true;
    else if (dcvalue == 17 && isSoft17) return true;
    else return true;
}

function doesDealerShowAce(card) {
    if (card == 'a') return true;
    return false;
}