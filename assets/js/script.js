const startButton = document.getElementById("startGame");
const startContainer = document.querySelector(".start-container");
const gameContainer = document.querySelector(".game-container");
const livesElement = document.getElementById("lives");
const endGameContainer = document.querySelector(".end-game-container");

let imageElement;
let loadingSpinner;
let guessInput;
let submitButton;
let skipButton;
let resultElement;
let scoreElement;
let timerElement;

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
    life.src =
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
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
  gameContainer.classList.add("hide");
  endGameContainer.classList.remove("hide");

  // Display final score and highest streak
  document.getElementById("finalScore").textContent = score;
  document.getElementById("finalStreak").textContent = highestStreak;

  const playAgainButton = document.getElementById("playAgain");
  playAgainButton.addEventListener("click", resetGame);
}

// Reset the game state
function resetGame() {
  score = 0;
  streak = 0;
  lives = 5;
  timer = 15;
  highestStreak = 0;

  // Reset UI state
  gameContainer.classList.remove("hide");
  endGameContainer.classList.add("hide");

  // Reset variables and initialize UI
  initializeLives();
  initializeDynamicElements();
  showLoadingAndFetchNewPokemon();
}

// Reinitialize dynamic elements and event listeners
function initializeDynamicElements() {
  imageElement = document.getElementById("pokemonImage");
  loadingSpinner = document.getElementById("loadingSpinner");
  guessInput = document.getElementById("guess");
  submitButton = document.getElementById("submitGuess");
  skipButton = document.getElementById("skipButton");
  resultElement = document.getElementById("result");
  scoreElement = document.getElementById("score");
  timerElement = document.getElementById("timer");

  submitButton.addEventListener("click", submitGuessHandler);
  skipButton.addEventListener("click", skipPokemon);

  guessInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submitGuessHandler();
    }
  });
}

startButton.addEventListener("click", () => {
  startContainer.style.display = "none";
  gameContainer.style.display = "block";
  initializeLives();
  initializeDynamicElements();
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
