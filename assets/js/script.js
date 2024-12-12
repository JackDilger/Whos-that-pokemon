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
        const playAgain = confirm("Game Over! You've lost all your lives. Would you like to play again?");
        if (playAgain) {
          resetGame();
        } else {
          location.reload(); // Restart the game fully if the user chooses not to play again
        }
      }
    
      // Reset the game state
      function resetGame() {
        score = 0;
        lives = 5;
        timer = 15;
        scoreElement.textContent = score;
        initializeLives();
        showLoadingAndFetchNewPokemon();
      }
    
      startButton.addEventListener("click", () => {
        startContainer.style.display = "none";
        gameContainer.style.display = "block";
        initializeLives(); // Display lives at the start
        showLoadingAndFetchNewPokemon();
      });
    
      // Unified logic for showing the spinner and fetching a new Pokémon
      function showLoadingAndFetchNewPokemon() {
        // Show the spinner and start shaking
        loadingSpinner.classList.add("shaking");
        imageElement.style.visibility = "hidden";
        imageElement.src = ""; // Clear the current image
    
        // Add a delay for the shake animation before fetching a new Pokémon
        setTimeout(() => {
          fetchNewPokemon(() => {
            // Stop shaking only after the new Pokémon has loaded
            loadingSpinner.classList.remove("shaking");
          });
        }, 1500); // Duration of the shake animation
      }
    
      function fetchNewPokemon(callback) {
        const randomId = Math.floor(Math.random() * 150) + 1; // Random Pokémon ID (1-150)
    
        fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}/`)
          .then((response) => response.json())
          .then((data) => {
            pokemonName = data.name.toLowerCase();
    
            // Set new Pokémon image and apply silhouette filter
            imageElement.src = data.sprites.front_default;
            imageElement.style.filter = "brightness(0) saturate(100%)";
            imageElement.style.visibility = "visible"; // Show the new Pokémon
    
            // Trigger callback to stop spinner animation
            if (callback) callback();
          });
    
        // Reset timer for the next round
        timer = 15;
        timerElement.textContent = timer;
    
        // Clear and restart timer interval
        clearInterval(timerInterval);
        startTimer();
      }
    
      function startTimer() {
        timerInterval = setInterval(() => {
          timer--;
          timerElement.textContent = timer;
    
          if (timer === 0) {
            clearInterval(timerInterval);
            loseLife(); // Lose a life on timeout
            resultElement.textContent = `Time's up! The correct answer was ${pokemonName}.`;
            revealPokemon();
            setTimeout(() => {
              resultElement.textContent = ""; // Clear the result text
              showLoadingAndFetchNewPokemon(); // Use the unified transition logic
            }, 1500); // Start a new round after the shake animation
          }
        }, 1000);
      }
    
      function revealPokemon() {
        imageElement.style.filter = "none"; // Reveal the Pokémon
      }
    
      submitButton.addEventListener("click", submitGuessHandler);
      skipButton.addEventListener("click", skipPokemon);
    
      function submitGuessHandler() {
        resultElement.textContent = ""; // Clear any previous result text
        const userGuess = guessInput.value.toLowerCase();
        if (userGuess === pokemonName) {
          score++;
          scoreElement.textContent = score;
          resultElement.textContent = `Correct! It's ${pokemonName}`;
          clearInterval(timerInterval);
          revealPokemon();
          setTimeout(() => {
            resultElement.textContent = ""; // Clear the result text
            showLoadingAndFetchNewPokemon(); // Use the unified transition logic
          }, 1500); // Start a new round after the shake animation
        } else {
          resultElement.textContent = ""; // Clear the text briefly
          setTimeout(() => {
            resultElement.textContent = "Incorrect! Try again."; // Reapply the message
          }, 50); // A slight delay ensures the DOM refreshes
          loseLife(); // Lose a life on wrong guess
        }
        guessInput.value = ""; // Clear input field
      }
    
      function skipPokemon() {
        clearInterval(timerInterval); // Clear the timer for the current Pokémon
        loseLife(); // Reduce a life when skipping
        resultElement.textContent = ""; // Clear result text
        showLoadingAndFetchNewPokemon(); // Use the unified transition logic
      }
    
      guessInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          submitGuessHandler();
        }
      });