let possibleWords = allWords

// Guess = SERVE
//       = SOALV
//       = SIVIP
//https://api.dictionaryapi.dev/api/v2/entries/en/barmy

$(document).ready(() => {
    $(".win-screen").hide();
    $(".close-win-button").click(() => {
        $(".win-screen").hide();
    })

    letterInputs = $('.input-textbox').children().toArray()

    $(".letter-input").keyup(function(e) {
        console.log(e.key)
        switch (e.keyCode) {
            case "ShiftLeft":
            case "ShiftRight":
            case 9:
                break;
            case 39: // Arrow Right
                $(this).nextAll(".letter-input:first").focus();
                break;
            case 37: // Arrow Left
                $(this).prevAll(".letter-input:first").focus();
                break;
            case 8: // Backspace
                e.target.value = ""
                $(this).prev(".letter-input").focus();
                break;

            case 13: // Enter
                wordSubmitted();
                break;

            default:
                if(e.key.length == 1 && e.key.match(/[a-z]/i)){
                    e.target.value = e.code.slice(-1)
                    $(this).next('.letter-input').focus();
                } else {
                    e.target.value = ""
                    return;
                }
                break;
        }
    })

    // Returns how similar they are ["wrong", "right", "place"]
    getSimilarity = (guess, target) => {
        guess = guess.toUpperCase();
        target = target.toUpperCase();

        let lettersRemaining = target.split("")
        let ret = Array.from(Array(target.length).keys())
        // Check for correct letters first
        guess.split('').forEach((letter, index) => {
            if(letter == target[index]){
                ret[index] = "right"
                removeValueFromArray(lettersRemaining, letter)
            }
        })

        // Check for letters in the wrong place
        guess.split('').forEach((letter, index) => {
            if(ret[index] == "right") {
                return;
            }

            if(lettersRemaining.includes(letter)) {
                removeValueFromArray(lettersRemaining, letter)
                ret[index] = "place"
            } else {
                ret[index] = "wrong"
            }
        })

        return ret
    }

    wordSubmitted = () => {
        let guess;
        // Ensure 5 letters were provided
        if(guess = getInput()){

            //Check if word is in list of words
            if(allWords.includes(guess.toLowerCase()) == false) {
                addHistoricRow(guess, ["error", "error", "error", "error", "error"])

                // Clear input
                $(".letter-input").val("")
                // Set focus to first input
                $(".letter-input").get(0).focus()

                return
            }

            // Find least optimal similarity
            candidateSimilarities = {}
            possibleWords.forEach(word => {
                let similarity = getSimilarity(guess, word)
                if(candidateSimilarities[similarity]) {
                    candidateSimilarities[similarity].push(word)
                } else {
                    candidateSimilarities[similarity] = []
                    candidateSimilarities[similarity].push(word)
                }
            })

            bestSimilarity = Object.keys(candidateSimilarities).reduce((accumulator, curVal) => {
                if(accumulator == null) {
                    return curVal
                } else {
                    if(candidateSimilarities[curVal].length == candidateSimilarities[accumulator].length) {

                        if(curVal.includes("wrong") && !accumulator.includes("wrong")){
                            return curVal
                        } else if (curVal.includes("place") && !accumulator.includes("place")) {
                            return curVal
                        } else {
                            return accumulator
                        }

                    } else {
                        return candidateSimilarities[curVal].length > candidateSimilarities[accumulator].length ? curVal : accumulator
                    }
                }
            }, null)
            possibleWords = candidateSimilarities[bestSimilarity]
            bestSimilarity = getSimilarity(guess, possibleWords[0]);

            console.log(possibleWords)

            addHistoricRow(guess, bestSimilarity)

            // Check Win
            if(bestSimilarity.filter(a => a == "right").length == 5) {
                // Run on win
                let correctWord = possibleWords[0]
                $(".win-screen").show();
                $(".win-metrics").html(`It took you ${$(".letter-array").length - 1} to guess ${correctWord}`)
                $(".input-textbox").hide()
            }

            // Clear input
            $(".letter-input").val("")
            // Set focus to first input
            $(".letter-input").get(0).focus()
        }
    }

    addHistoricRow = (word, similarity) => {

        let newRow = '<div class="letter-array">'
        word.split('').forEach((letter, index) => {
            newRow += `<input class="${similarity[index]} letter" value="${letter}" type="text" disabled="true"/>`
        });
        newRow += '</div>'

        $(".letters").append(newRow)
    }

    // Returns null if there is no valid input 
    getInput = () => {
        let word = ""
        for (let i = 0; i < letterInputs.length; i++) {
            if(!letterInputs[i]?.value?.match(/[a-z]/i)) {
                return null
            }
            word += letterInputs[i].value
        }
        return word
    }

});

const removeValueFromArray = (array, value) => {
    const index = array.indexOf(value);
    if (index > -1) {
        array.splice(index, 1);
    }
}