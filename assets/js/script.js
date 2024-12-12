const startButton = document.getElementById("startGame");
const startContainer = document.querySelector(".start-container");
const gameContainer = document.querySelector(".game-container");
const livesElement = document.getElementById("lives");

const imageElement = document.getElementById("pokemonImage");
const loadingSpinner = document.getElementById("loadingSpinner");
const guessInput = document.getElementById("guess");
const submitButton = document.getElementById("submitGuess");
const skipButton = document.getElementById("skipButton");
const resultElement = document.getElementById("result");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");

let pokemonName = "";
let score = 0;
let streak = 0;
let highestStreak = 0;
let timer = 15;
let timerInterval;
let lives = 5;

// Initialize lives display
function initializeLives() {
  livesElement.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const life = document.createElement("img");
    life.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
    life.alt = "Pokéball";
    livesElement.appendChild(life);
  }
}

// Decrease a life
function loseLife() {
  if (lives > 0) {
    lives--;
    const lifeIcons = livesElement.querySelectorAll("img");
    lifeIcons[5 - lives - 1].classList.add("lost");

    if (lives === 0) {
      endGame(); // Handle game over
    }
  }
}

// End the game when lives run out
function endGame() {
  highestStreak = Math.max(highestStreak, streak); // Update highest streak
  gameContainer.innerHTML = `
    <div class="end-game">
      <h2>Game Over</h2>
      <p>Your Score: ${score}</p>
      <p>Highest Streak: ${highestStreak}</p>
      <button id="playAgain">Play Again</button>
    </div>
  `;

  const playAgainButton = document.getElementById("playAgain");
  playAgainButton.addEventListener("click", resetGame);
}

// Reset the game state
function resetGame() {
  score = 0;
  streak = 0;
  lives = 5;
  timer = 15;
  scoreElement.textContent = score;
  initializeLives();

  gameContainer.innerHTML = `
    <div class="header">
      <div class="lives">
        <span>HP</span>
        <div id="lives"></div>
      </div>
      <div class="timer-container">
        <span>Timer</span>
        <div id="timer">15</div>
      </div>
    </div>
    <div id="loadingSpinner" class="hide"></div>
    <img id="pokemonImage" class="pokemon-image" src="" alt="Who's that Pokémon?" />
    <input type="text" id="guess" placeholder="Enter Pokémon name" />
    <button id="submitGuess">Submit Guess</button>
    <button id="skipButton">Skip</button>
    <p id="result"></p>
    <p>Score: <span id="score">0</span></p>
  `;

  const newSubmitButton = document.getElementById("submitGuess");
  const newSkipButton = document.getElementById("skipButton");
  const newGuessInput = document.getElementById("guess");

  newSubmitButton.addEventListener("click", submitGuessHandler);
  newSkipButton.addEventListener("click", skipPokemon);

  newGuessInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submitGuessHandler();
    }
  });

  showLoadingAndFetchNewPokemon();
}

startButton.addEventListener("click", () => {
  startContainer.style.display = "none";
  gameContainer.style.display = "block";
  initializeLives();
  showLoadingAndFetchNewPokemon();
});

function showLoadingAndFetchNewPokemon() {
  loadingSpinner.classList.add("shaking");
  imageElement.style.visibility = "hidden";
  imageElement.src = "";

  setTimeout(() => {
    fetchNewPokemon(() => {
      loadingSpinner.classList.remove("shaking");
    });
  }, 1500); // Duration of shake animation
}

function fetchNewPokemon(callback) {
  const randomId = Math.floor(Math.random() * 150) + 1;

  fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}/`)
    .then((response) => response.json())
    .then((data) => {
      pokemonName = data.name.toLowerCase();

      imageElement.src = data.sprites.front_default;
      imageElement.style.filter = "brightness(0) saturate(100%)";
      imageElement.style.visibility = "visible";

      if (callback) callback();
    });

  timer = 15;
  timerElement.textContent = timer;
  clearInterval(timerInterval);
  startTimer();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer--;
    timerElement.textContent = timer;

    if (timer === 0) {
      clearInterval(timerInterval);
      loseLife();
      resultElement.textContent = `Time's up! The correct answer was ${pokemonName}.`;
      revealPokemon();
      setTimeout(() => {
        resultElement.textContent = "";
        showLoadingAndFetchNewPokemon();
      }, 1500);
    }
  }, 1000);
}

function revealPokemon() {
  imageElement.style.filter = "none";
}

submitButton.addEventListener("click", submitGuessHandler);
skipButton.addEventListener("click", skipPokemon);

function submitGuessHandler() {
  resultElement.textContent = "";
  const userGuess = guessInput.value.toLowerCase();
  if (userGuess === pokemonName) {
    score++;
    streak++;
    highestStreak = Math.max(highestStreak, streak);
    scoreElement.textContent = score;
    resultElement.textContent = `Correct! It's ${pokemonName}`;
    clearInterval(timerInterval);
    revealPokemon();
    setTimeout(() => {
      resultElement.textContent = "";
      showLoadingAndFetchNewPokemon();
    }, 1500);
  } else {
    resultElement.textContent = "";
    setTimeout(() => {
      resultElement.textContent = "Incorrect! Try again.";
    }, 50);
    loseLife();
    streak = 0; // Reset streak on wrong guess
  }
  guessInput.value = "";
}

function skipPokemon() {
  clearInterval(timerInterval);
  loseLife();
  resultElement.textContent = "";
  streak = 0; // Reset streak on skip
  showLoadingAndFetchNewPokemon();
}

guessInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitGuessHandler();
  }
});
