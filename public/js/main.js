const codeGenerate = function() {
    return Math.random().toString(36).substr(2, 4).toUpperCase();
};

const scoreChangeTotal = function( songID ) {
    document.querySelector('[name="create-form"]');
}

// Where we store the array of scores.
var scoreStore = {};

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

    var voteCount = 0;
    var voteAverage = 0;
    var voteTotal = 0;

    for (var [sessionID, singleVote] of Object.entries(scoreStore[scoreVal.songID][ scoreVal.field ]['votes'])) {
        voteCount++;
        voteTotal += singleVote.value;
    }

    voteAverage = voteTotal / voteCount;
    scoreStore[scoreVal.songID][ scoreVal.field ]['total'] = voteTotal;
    scoreStore[scoreVal.songID][ scoreVal.field ]['count'] = voteCount;
    scoreStore[scoreVal.songID][ scoreVal.field ]['average'] = voteAverage;

    // displayScore( scoreStore );
};

const displayScore = ( scoreStore ) => {
    for (var [songKey, songStore] of Object.entries(scoreStore)) {
        var localTotal = 0;
        var songTotal = 0;

        for (var [scoreType, singleScore] of Object.entries(songStore)) {
            var scoreSelector = '[data-score-label="' + scoreType + '"][data-score-id="' + songKey + '"] .score__average .score__value';

            if ( scoreType === 'Total' ) {
                scoreSelector = '[data-score-label="' + scoreType + '"][data-score-id="' + songKey + '"] .total__average .total__value';
            }

            var averageValue = document.querySelector(scoreSelector);
            averageValue.innerHTML = scoreStore[songKey][scoreType]['average'];
        }
    }
}

const colourArr = [ 'orange', 'green', 'violet', 'brown', 'black', 'red', 'olive', 'blue', 'purple' ];
const personArr = [];

const insertNotes = (notes)  => {
    var personPos = 0;

    notes.forEach( (obj, i) => {
        var colourVal = 'primary';
        var userData = document.querySelector('.scorecard');
        var listBlock = document.querySelector('.scorecard__notes[data-tab="notes-'+ obj.songID  + '"] .ui.list');

        // if the message is not by the current user
        if ( obj.user.displayName !== userData.dataset.userName ) {
            if ( ! personArr.includes(obj.user.displayName) ) {
                personArr.push(obj.user.displayName);
            }

            personPos = personArr.length - 1;
            colourVal = colourArr[ personPos ];
        }

        var listBlock = document.querySelector('.scorecard__notes[data-tab="notes-'+ obj.songID  + '"] .ui.list');
        var listElement = '<li class="item" data-id="' + obj._id + '"><div class="ui ' + colourVal + ' horizontal label">' + obj.user.displayName + '</div>' + obj.value + '</li>';
        if ( listBlock.innerHTML.indexOf( obj.value ) === -1 ){
            $(listBlock).append(listElement);
        }

        var messageCount = document.querySelector('.scorecard__notes[data-tab="notes-'+ obj.songID  + '"] input');
        messageCount.dataset.messageCount = messageCount.dataset.messageCount+1;
    } );
}

socket.on( 'new-scores', (data) => {
    if ( data.field === 'Note' ) {
        console.log('Got a new note');
        insertNotes( [data] );
    }

    //insertScore(data);
} );

socket.on( 'new-notes', (data) => {
    insertNotes(data);
} );

window.addEventListener("load",function() {
    var createForm = document.querySelector('[name="create-form"]');

    if ( createForm && createForm.length > 0 ) {
        var newRoomCode = createForm.querySelector('[name="user-room"]');
        newRoomCode.value = codeGenerate();
    }

    // if we're on the room page
    // look up the scores for each user

    // get all notes
        // populate notes
});


var rankingOrder = function() {
    var scoreArr = [ 12, 10, 8, 7, 6, 5, 4, 3, 2, 1 ];

    var rankArr = [];
    var entries = document.querySelectorAll('.scorecard__entry .total[data-score-label="Total"]');

    // for each entry
    entries.forEach( function( obj, i ) {
        // get the total
        // and the entry number
        rankArr.push( {
            score: parseInt(obj.dataset.scoreValue, 10),
            entry: parseInt(obj.dataset.scoreId, 10)
        } );
    } );

    // order the array by total
    var sortedRankArr = rankArr.sort( function(a,b) {
        return b.score - a.score;
    } );

    var rankCount = 1;

    // set the ranking for each entry
    sortedRankArr.forEach( function(obj, i) {
        var nextElement = i+1;
        sortedRankArr[i]['rank'] = rankCount;

        var rankElm = document.querySelectorAll('.scorecard__entry .total[data-score-label="Ranking"][data-score-id="'+ sortedRankArr[i]['entry'] +'"]');
        var rankElmTotal = rankElm[0].querySelectorAll('.total__value');

        var rankRow = document.querySelectorAll('.leaderboard__row[data-leaderboard-id="'+ sortedRankArr[i]['entry'] +'"]');
        var rankScore = rankRow[0].querySelectorAll('.leaderboard__score');
        var rankPoints = rankRow[0].querySelectorAll('.leaderboard__points');

        rankElm[0].dataset.scoreValue = rankCount;
        rankRow[0].dataset.leaderboardScore = sortedRankArr[i]['score'];
        rankRow[0].dataset.leaderboardRank = rankCount;
        rankElmTotal[0].innerHTML = rankCount;
        rankScore[0].innerHTML = sortedRankArr[i]['score'];

        if ( sortedRankArr[i]['rank'] < scoreArr.length + 1 ) {
            rankPoints[0].innerHTML = scoreArr[ sortedRankArr[i]['rank'] - 1 ];
        } else {
            rankPoints[0].innerHTML = 0;
        }


        if ( sortedRankArr[nextElement] !== undefined ) {
            if ( sortedRankArr[i]['score'] > sortedRankArr[nextElement]['score'] ) {
                rankCount++;
            }
        }
    } );

    var allRankRows = document.querySelectorAll('.leaderboard__row');
    var sortedRankRows = Array.prototype.slice.call(allRankRows , 0);

    // order the rows by rank
    sortedRankRows.sort( function(a,b) {
        return parseInt(b.dataset.leaderboardScore, 10) - parseInt(a.dataset.leaderboardScore, 10);
    } );

    // print them back into the table
    var allRankTable = document.querySelectorAll('.leaderboard__list table tbody');
    allRankTable[0].innerHTML = '';

    sortedRankRows.forEach( function( obj, i ) {
        allRankTable[0].appendChild( obj );
    } );

}

var totalScores = function( entry ) {
    var scoreTotal = 0;

    var entry = document.querySelectorAll('.scorecard__entry[data-entry="' + entry + '"]');
    var allSliders = entry[0].querySelectorAll('.slider');
    var scoreData = entry[0].querySelectorAll('.total[data-score-label="Total"]');
    var scoreDataText = entry[0].querySelectorAll('.total[data-score-label="Total"] .total__value');

    allSliders.forEach( function( i, a ) {
        scoreTotal = parseInt(i.dataset.scoreValue, 10) + scoreTotal;
    } );

    scoreData[0].dataset.scoreValue = scoreTotal;
    scoreDataText[0].innerHTML = scoreTotal;

    return scoreTotal;
}

var sliderChange = function ( value, element ) {
    element[0].dataset.scoreValue = value;
    scoreTotal = totalScores( element[0].dataset.scoreId );
    rankingOrder();

    // send update to database
    var scoreData = {
        'field' : element[0].dataset.scoreLabel,
        'songID' : element[0].dataset.scoreId,
        'value' : value
    };

    socket.emit( 'score-change', scoreData );

    if ( value !== scoreData.value ) {
        var fullData = scoreData;
        var userData = document.querySelector('.scorecard');

        fullData.user = {
            displayName : userData.dataset.userName,
            sessionID: userData.dataset.userId,
        }

        insertScore( scoreData );
    }
};

$('.menu .item').tab();
$('.ui.dropdown').dropdown();

$('.ui.slider').each( function(index) {
    $(this).slider({
        min: 0,
        max: $(this).data('scoreMax'),
        start: $(this).data('scoreValue'),
        step: 1,
        smooth: true,
        onChange: function(e) {
            sliderChange(e, $(this) );
        }
    });
} );

$('.note__form .note__submit').on('click', function(e) {
    var songID = $(this).parent().find('input').data('entry');
    var messageCount = $(this).parent().find('input').attr('data-message-count');
    var messageVal = $(this).parent().find('input').val();
    var userData = document.querySelector('.scorecard');

    var scoreData = {
        'field' : 'Note',
        'songID' : songID,
        'value' : messageVal,
        'count': parseInt( messageCount, 10)
    };

    $(this).parent().find('input').attr('data-message-count', parseInt(messageCount, 10) + 1);

    var newListItem = '<li class="item"><div class="ui primary horizontal label">' + userData.dataset.userName + '</div>' + messageVal + '</li>';
    $('[data-tab="notes-' + songID + '"] .ui.divided.relaxed.list').append(newListItem);

    socket.emit( 'score-change', scoreData );

    $(this).parent().find('input').val('');
});