const scoresBox = document.querySelector('.scores-overlay');
const rulesBox = document.querySelector('.rules-overlay');
const diffSelect = document.querySelector('select');
const uiWord = document.querySelector('.word');
const uiTime = document.querySelector('.time-left');
const uiScore = document.querySelector('.score');
const gameBtn = document.querySelector('.game-btn');
const wordInput = document.querySelector('.word-input');
const gameCard = document.querySelector('.game-card');
const scoresEl = document.querySelector('.scores-body');



let currentWord = '';
let timeLeft = 10;
let totalScore = 0;
let randomWords = [];
let timeInterval;


// Fetch all words and put into an array
async function getWords() {
  let numWords;
  if (diffSelect.value === 'easy') {
    numWords = 100;
  } else if (diffSelect.value === 'medium') {
    numWords = 500;
  } else {
    numWords = 1000;
  }

  const res = await fetch(
    `https://random-word-api.herokuapp.com/word?number=${numWords}`
  );
  const data = await res.json();
  randomWords = data;
  getRandomWord();
}

// Get random word 

function getRandomWord() {
  const index = Math.floor(Math.random() * randomWords.length);
  if (index === randomWords.length) {
    getRandomWord();
  }

  currentWord = randomWords[index];
  populateUI(currentWord, timeLeft, totalScore);
}

// Update Difficulty
function updateDifficulty() {
  timeLeft = 10;
  totalScore = 0;
  getWords();
}

// Start game
function startGame(e) {
  if (e.target.textContent === 'Start Game') {
    timeLeft = 10;
    gameBtn.textContent = 'Restart Game';
    gameBtn.style.backgroundColor = '#d9534f';
    wordInput.value = '';
    wordInput.disabled = false;
   
    timeInterval = setInterval(timeDecrement, 1000);
  } else {
    window.location.reload();
  }
}

// decrement time each second
function timeDecrement() {
  timeLeft--;
  if (timeLeft > 0) {
    populateUI(currentWord, timeLeft, totalScore);
  } else {
    clearInterval(timeInterval);
    changeState();
    updateHighScores();
  }
}

// Check for the enetred word with current word
function checkWord() {
  if (
    wordInput.value.toLowerCase() === currentWord.toLowerCase() &&
    wordInput.value !== ''
  ) {
    totalScore++;
    updateTime();
    getRandomWord();
    wordInput.value = '';
  }
}

// Update Time
function updateTime() {
  if (diffSelect.value === 'easy') {
    timeLeft += 3;
  } else if (diffSelect.value === 'medium') {
    timeLeft += 2;
  } else {
    timeLeft++;
  }
}

// Change state of card when time left is 0
function changeState() {
  gameCard.innerHTML = `
    <h2>TIME RAN OUT!!!</h2>
    <p class="game-over">Your total score is ${totalScore}
    <br />
    We hope you enjoyed our game</p>
    <button class="btn play-again-btn">Play Again</button>
  `;
}

// Play Again
function playAgain(e) {
  if (e.target.classList.contains('play-again-btn')) {
    window.location.reload();
  }
}

// Get high scores from local storage
function getHighScores() {
  let highScores = {
    easy: [0, null],
    medium: [0, null],
    hard: [0, null],
  };

  if (JSON.parse(localStorage.getItem('scores')) !== null) {
    highScores = JSON.parse(localStorage.getItem('scores'));
  }
  return highScores;
}

// Update High Scores
function updateHighScores() {
  let highScores = getHighScores();

  if (diffSelect.value === 'easy' && totalScore > highScores.easy[0]) {
    highScores.easy[0] = totalScore;
    highScores.easy[1] = moment().format('MMM Do YYYY');
  } else if (
    diffSelect.value === 'medium' &&
    totalScore > highScores.medium[0]
  ) {
    highScores.medium[0] = totalScore;
    highScores.medium[1] = moment().format('MMM Do YYYY');
  } else if (diffSelect.value === 'hard' && totalScore > highScores.hard[0]) {
    highScores.hard[0] = totalScore;
    highScores.hard[1] = moment().format('MMM Do YYYY');
  }

  localStorage.setItem('scores', JSON.stringify(highScores));
}

// Populate High Scores in UI
function populateHighScores() {
  const highScores = getHighScores();

  scoresEl.innerHTML = `
    <div class="score-item score-item-head">Difficulty</div>
    <div class="score-item score-item-head">Score</div>
    <div class="score-item score-item-head">Date</div>
    <div class="score-item">Easy</div>
    <div class="score-item">${highScores.easy[0]}</div>
    <div class="score-item">${
      highScores.easy[1] === null ? 'N/A' : highScores.easy[1]
    }</div>
    <div class="score-item">Medium</div>
    <div class="score-item">${highScores.medium[0]}</div>
    <div class="score-item">${
      highScores.medium[1] === null ? 'N/A' : highScores.medium[1]
    }</div>
    <div class="score-item">Hard</div>
    <div class="score-item">${highScores.hard[0]}</div>
    <div class="score-item">${
      highScores.hard[1] === null ? 'N/A' : highScores.hard[1]
    }</div>
  `;
}

// Populate UI
function populateUI(currentWord, timeLeft, totalScore) {
  uiWord.innerText = currentWord;
  uiTime.innerText = `Time Left: ${timeLeft}s`;
  uiScore.innerText = `Score: ${totalScore}`;
}

// App
getWords();
populateHighScores();

// Event Listeners
document.getElementById('scores-btn').addEventListener('click', () => {
  scoresBox.classList.add('show');
});
document.getElementById('close-scores').addEventListener('click', () => {
  scoresBox.classList.remove('show');
});
document.getElementById('rules-btn').addEventListener('click', () => {
  rulesBox.classList.add('show');
});
document.getElementById('close-rules').addEventListener('click', () => {
  rulesBox.classList.remove('show');
});
document.querySelector('.navbar-toggle').addEventListener('click', () => {
  document.querySelector('.navbar').classList.toggle('show');
  document.querySelector('.navbar-toggle i').classList.toggle('fa-chevron-up');
  document
    .querySelector('.navbar-toggle i')
    .classList.toggle('fa-chevron-down');
});
 

gameBtn.addEventListener('click', startGame);
diffSelect.addEventListener('change', updateDifficulty);
wordInput.addEventListener('input', checkWord);
gameCard.addEventListener('click', playAgain);

