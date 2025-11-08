document.addEventListener("DOMContentLoaded", () => {
  // --- 1. SET YOUR API URL HERE ---
  // This is the URL you get from Render after deploying your backend.
  // We'll use the local one for testing first.
  //const API_URL = "http://127.0.0.1:8000/predict";
  const API_URL = "https://spam-classifier-project-vker.onrender.com/predict"; // <-- Change to this later

  // --- 2. GET ALL THE ELEMENTS ---
  const messageInput = document.getElementById("message-input");
  const checkButton = document.getElementById("check-button");
  const resetButton = document.getElementById("reset-button");

  // Button inner parts
  const buttonText = document.getElementById("button-text");
  const buttonLoader = document.getElementById("button-loader");

  // Result container and its parts
  const resultContainer = document.getElementById("result-container");
  const resultTitle = document.getElementById("result-title");
  const resultMessage = document.getElementById("result-message");

  // --- 3. ADD EVENT LISTENERS ---
  checkButton.addEventListener("click", handleCheck);
  resetButton.addEventListener("click", handleReset);

  // Also allow pressing "Enter" to check
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      handleCheck();
    }
  });

  // --- 4. MAIN FUNCTIONS ---

  function handleCheck() {
    const message = messageInput.value;

    if (!message.trim()) {
      alert("Please enter a message.");
      return;
    }

    // Set "Checking" state
    setLoading(true);

    // Make the REAL API call
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: message }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // We got a successful response
        const isSpam = data.prediction === "spam";
        showResult(isSpam);
      })
      .catch((error) => {
        console.error("Error:", error);
        // Show an error in the result box
        showResult(true, "Error: Could not check message.");
      })
      .finally(() => {
        // Always reset the button
        setLoading(false);
      });
  }

  function handleReset() {
    messageInput.value = "";
    resultContainer.style.display = "none";
    resetButton.style.display = "none";
    // Clear old classes
    resultContainer.classList.remove("is-spam", "is-safe");
    messageInput.focus();
  }

  // --- 5. HELPER FUNCTIONS ---

  function setLoading(isLoading) {
    if (isLoading) {
      checkButton.disabled = true;
      buttonText.textContent = "Checking...";
      buttonLoader.style.display = "block";
    } else {
      checkButton.disabled = false;
      buttonText.textContent = "Check Message";
      buttonLoader.style.display = "none";
    }
  }

  function showResult(isSpam, errorMessage = null) {
    // Clear old classes
    resultContainer.classList.remove("is-spam", "is-safe");

    if (errorMessage) {
      // Show an error state
      resultContainer.classList.add("is-spam"); // Use spam styling for errors
      resultTitle.textContent = "⚠️ Error";
      resultMessage.textContent = errorMessage;
    } else if (isSpam) {
      // Show SPAM result
      resultContainer.classList.add("is-spam");
      resultTitle.textContent = "⚠️ Spam Detected";
      resultMessage.textContent =
        "This message appears to be spam. Be cautious!";
    } else {
      // Show SAFE (ham) result
      resultContainer.classList.add("is-safe");
      resultTitle.textContent = "✓ Message is Safe";
      resultMessage.textContent = "This message looks safe. No spam detected.";
    }

    // Show the result area
    resultContainer.style.display = "flex";
    resetButton.style.display = "inline-flex";
  }
});