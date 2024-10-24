let currentEmail = ""; // Declare currentEmail globally

// Function to find the search input by ID and enter the email
function enterEmailAndSearch(email) {
  currentEmail = email; // Set currentEmail when processing each email
  const searchInput = document.getElementById("searchTerm");

  if (searchInput) {
    searchInput.value = currentEmail;
    console.log("Inserted email:", currentEmail);

    // Click the search button after entering the email
    clickSearchButton();
  } else {
    console.log("Search field not found. Moving to next email.");
    chrome.runtime.sendMessage({ action: "nextEmail" }); // Proceed to next email if input field is not found
  }
}

// Function to simulate a click on the search button
function clickSearchButton() {
  const searchButton = document.getElementById("cs-agent-search-customer");

  if (searchButton) {
    searchButton.click();
    console.log("Search button clicked.");

    // After clicking, wait for the results and check for a cart
    setTimeout(checkForCart, 2000); // Wait 2 seconds before checking for cart
  } else {
    console.log("Search button not found. Moving to next email.");
    chrome.runtime.sendMessage({ action: "nextEmail" }); // Proceed to next email if search button is not found
  }
}

// Function to check for a cart in the 'customer-search-list' table
function checkForCart() {
  const searchList = document.getElementById("customer-search-list");

  if (searchList) {
    const rows = searchList.getElementsByTagName("*"); // Get all elements inside the tbody
    let cartFound = false;

    // Iterate over elements to find 'Select Customer' text
    for (let i = 0; i < rows.length; i++) {
      const rowText = rows[i].innerText.trim(); // Get text content of each element
      if (rowText.includes("Select Customer")) {
        cartFound = true;
        console.log("Cart Found!!");

        // Send message to background.js to store the email
        console.log("Sending email to background.js to store:", currentEmail);
        chrome.runtime.sendMessage({
          action: "storeEmail",
          email: currentEmail,
        });
        break;
      }
    }

    if (!cartFound) {
      console.log("No cart found for this email.");
    }
  } else {
    console.log("Customer search list not found.");
  }

  // Proceed to the next email regardless of whether a cart is found
  chrome.runtime.sendMessage({ action: "nextEmail" });
}

// Listener for messages from background.js to process each email
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.email) {
    currentEmail = request.email; // Store the current email
    console.log("Received email from background.js:", currentEmail);
    enterEmailAndSearch(currentEmail); // Start the process for the current email
  }
});
