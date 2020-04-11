const codeGenerate = function() {
    return Math.random().toString(36).substr(2, 4).toUpperCase();
};

const scoreChangeTotal = function( songID ) {
    document.querySelector('[name="create-form"]');
}

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
            
            socket.emit( 'score-change', scoreData );
        }
    }

}

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