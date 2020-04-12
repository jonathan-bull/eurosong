const codeGenerate = function() {
    return Math.random().toString(36).substr(2, 4).toUpperCase();
};

const scoreChangeTotal = function( songID ) {
    document.querySelector('[name="create-form"]');
}

// Where we store the array of scores.
let scoreStore = {};

// Insert a single score.
const insertScore = ( scoreVal ) => {
    if ( ! (scoreVal.songID in scoreStore ) ) {
        scoreStore[scoreVal.songID] = {
            'Staging' : { 'votes' : {}, 'total' : 0, 'count': 0, 'average': 0 },
            'Eurovision' : { 'votes' : {}, 'total' : 0, 'count': 0, 'average': 0 },
            'Song': { 'votes' : {}, 'total' : 0, 'count': 0, 'average': 0 },
            'Performance' : { 'votes' : {}, 'total' : 0, 'count': 0, 'average': 0 },
            'Total' : { 'ranking' : 0, 'score' : 0, 'count': 0, 'average' : 0 },
            'Notes' : {}
        };
    }

    scoreStore[scoreVal.songID][ scoreVal.field ]['votes'][ scoreVal.user.sessionID ] = { value: scoreVal.value, display: scoreVal.user.displayName };

    let voteCount = 0;
    let voteAverage = 0;
    let voteTotal = 0;

    for (let [sessionID, singleVote] of Object.entries(scoreStore[scoreVal.songID][ scoreVal.field ]['votes'])) {
        voteCount++;
        voteTotal += singleVote.value;
    }

    voteAverage = voteTotal / voteCount;
    scoreStore[scoreVal.songID][ scoreVal.field ]['total'] = voteTotal;
    scoreStore[scoreVal.songID][ scoreVal.field ]['count'] = voteCount;
    scoreStore[scoreVal.songID][ scoreVal.field ]['average'] = voteAverage;

    displayScore( scoreStore );
};

const displayScore = ( scoreStore ) => {
    for (let [songKey, songStore] of Object.entries(scoreStore)) {
        let localTotal = 0;
        let songTotal = 0;

        for (let [scoreType, singleScore] of Object.entries(songStore)) {
            let scoreSelector = '[data-score-label="' + scoreType + '"][data-score-id="' + songKey + '"] .score__average .score__value';

            if ( scoreType === 'Total' ) {
                scoreSelector = '[data-score-label="' + scoreType + '"][data-score-id="' + songKey + '"] .total__average .total__value';
            }

            let averageValue = document.querySelector(scoreSelector);
            averageValue.innerHTML = scoreStore[songKey][scoreType]['average'];
        }
    }
}

// who
let theTimeout;
// who
// who who who

const scoreChangeVal = function( clickedEl ) {
    if ( clickedEl.target.dataset && clickedEl.target.dataset.scoreAction ) {
        let scoreDirection = clickedEl.target.dataset.scoreAction;
        let scoreMaster = clickedEl.target.parentElement.parentElement;
        let scoreElement = scoreMaster.querySelector('.score__value');
        let scoreValue = Number(scoreElement.innerHTML);

        let scoreData = {
            'field' : scoreMaster.dataset.scoreLabel,
            'songID' : scoreMaster.dataset.scoreId,
            'value' : scoreValue
        };

        if ( scoreDirection === 'increase' ) {
            if ( scoreValue < 10 ) {
                scoreData.value = scoreValue + 1;
            }
        } else if ( scoreDirection === 'decrease' ) {
            if ( scoreValue > 0 ) {
                scoreData.value = scoreValue - 1;
            }
        }

        if ( scoreValue !== scoreData.value ) {
            scoreElement.innerHTML = String(scoreData.value);
            scoreMaster.setAttribute("data-score-value", scoreData.value)

            // timeout needed to prevent sending every change to the database
            if (theTimeout) {
                clearTimeout(theTimeout);
            }

            theTimeout = setTimeout( () => { socket.emit( 'score-change', scoreData ) }, 1000);

            let fullData = scoreData;
            let userData = document.querySelector('.scorecard');

            console.dir(userData.dataset);

            fullData.user = {
                displayName : userData.dataset.userName,
                sessionID: userData.dataset.userId,
            }

            insertScore( scoreData );
        }
    }
}



socket.on( 'new-scores', (data) => {
    insertScore(data);
} );

window.addEventListener("load",function() {
    let createForm = document.querySelector('[name="create-form"]');

    if ( createForm && createForm.length > 0 ) {
        let newRoomCode = createForm.querySelector('[name="user-room"]');
        newRoomCode.value = codeGenerate();
    }

    let scoreCard = document.querySelectorAll('.scorecard__scores');

    if ( scoreCard && scoreCard.length > 0 ) {
        let scoreChange = document.querySelectorAll('.score__change');

        scoreChange.forEach( (el) => {
            // console.dir(el);
            el.addEventListener('click', scoreChangeVal.bind(this) );
        } );

    }
});