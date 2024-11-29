let score = localStorage.getItem('score') || 0;
let highScore = localStorage.getItem('highScore') || 0;
let timer;
let timeLeft = 30;
let currentTrivia = {};
let soundCorrect = new Audio('correct-answer.mp3'); // Load sound for correct answer
let soundIncorrect = new Audio('incorrect-answer.mp3'); // Load sound for incorrect answer

document.getElementById('score').innerText = `Score: ${score}`;
document.getElementById('highscore').innerText = `High Score: ${highScore}`;

// Main function to initiate the question-fetching process
async function askQuestion() {
    // Reset timer and question-related UI elements
    resetTimer();
    resetAnswers();
    resetAnswerDisplay();
    document.getElementById('hint').innerText = ''; // Clear hint
    
    try {
        // Fetch trivia question from the API
        const trivia = await fetchTrivia();
        
        // Display the question
        displayQuestion(trivia);

        // Store the trivia data for checking the answer later
        currentTrivia = trivia;

        // Get answers and display them
        const answers = getShuffledAnswers(trivia);
        displayAnswers(answers, trivia.correct_answer);

    } catch (error) {
        handleError(error);
    }
}

// Function to fetch trivia question from Open Trivia Database API
async function fetchTrivia() {
    const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
    const data = await response.json();
    return data.results[0];
}

// Function to display the fetched trivia question
function displayQuestion(trivia) {
    document.getElementById('question').innerText = `សំណួរ៖ ${trivia.question}`;
}

// Function to get and shuffle answers, adding the correct answer
function getShuffledAnswers(trivia) {
    const answers = [...trivia.incorrect_answers, trivia.correct_answer];
    answers.sort(() => Math.random() - 0.5);
    return answers;
}

// Function to display answers as clickable options
function displayAnswers(answers, correctAnswer) {
    const answersContainer = document.getElementById('answers');
    answersContainer.innerHTML = ''; // Clear any previous answers

    answers.forEach(answer => {
        const answerElement = document.createElement('button');
        answerElement.classList.add('answer-option');
        answerElement.innerText = `ចម្លើយ៖ ${answer}`;
        answerElement.onclick = () => checkAnswer(correctAnswer, answerElement, answer);
        answersContainer.appendChild(answerElement);
    });
}

// Function to check if the selected answer is correct
function checkAnswer(correctAnswer, selectedElement, selectedAnswer) {
    const answerDisplay = document.getElementById('answer');
    
    if (selectedAnswer === correctAnswer) {
        answerDisplay.innerText = `✔️ ចម្លើយត្រឹមត្រូវ: ${correctAnswer}`;
        answerDisplay.style.color = '#4CAF50'; // Green for correct
        updateScore(true);
        soundCorrect.play(); // Play correct answer sound
    } else {
        answerDisplay.innerText = `❌ ចម្លើយខុស: ${selectedAnswer}. ចម្លើយត្រឹមត្រូវគឺ: ${correctAnswer}`;
        answerDisplay.style.color = '#FF6347'; // Red for incorrect
        updateScore(false);
        soundIncorrect.play(); // Play incorrect answer sound
        giveHint(); // Provide hint after wrong answer
    }

    answerDisplay.style.display = 'block';
    disableAnswers(); // Disable all answer buttons
    highlightSelectedAnswer(selectedElement, selectedAnswer, correctAnswer);
}

// Function to disable answer buttons after selection
function disableAnswers() {
    const answerOptions = document.querySelectorAll('.answer-option');
    answerOptions.forEach(option => {
        option.disabled = true;
    });
}

// Function to highlight the selected answer button
function highlightSelectedAnswer(element, selectedAnswer, correctAnswer) {
    element.style.backgroundColor = selectedAnswer === correctAnswer ? '#4CAF50' : '#FF6347';
}

// Function to update the score in local storage
function updateScore(isCorrect) {
    if (isCorrect) score++;
    localStorage.setItem('score', score);
    document.getElementById('score').innerText = `Score: ${score}`;
    updateHighScore();
}

// Update the high score if the current score exceeds it
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        document.getElementById('highscore').innerText = `High Score: ${highScore}`;
    }
}

// Function to give a hint after an incorrect answer
function giveHint() {
    const hint = currentTrivia.correct_answer.length > 10 ? "Hint: It might be a long word!" : "Hint: It's a short word!";
    document.getElementById('hint').innerText = hint;
}

// Reset timer and UI elements for the next question
function resetTimer() {
    timeLeft = 30;
    document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;
    clearInterval(timer);
    startTimer();
}

// Function to start the timer
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeout();
        }
    }, 1000);
}

// Handle timeout scenario when time runs out
function handleTimeout() {
    document.getElementById('answer').innerText = '⏰ Time is up! Please try again.';
    document.getElementById('answer').style.color = '#FF6347'; // Red for timeout
    document.getElementById('answer').style.display = 'block';
    disableAnswers();
}

// Reset UI elements related to answers
function resetAnswers() {
    document.getElementById('answers').innerHTML = '';
}

// Reset answer display
function resetAnswerDisplay() {
    document.getElementById('answer').style.display = 'none';
}

// Handle error in fetching trivia
function handleError(error) {
    console.error('Error fetching trivia:', error);
    document.getElementById('question').innerText = 'មិនអាចទាញយកសំណួរ។ សូមព្យាយាមម្តងទៀត!';
}
