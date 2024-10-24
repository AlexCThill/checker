// Array of customer emails
let customerEmail = [
  "email1@example.com",
  "athill@lumens.com",
  "email2@example.com",
  "email3@example.com",
  "athill@lumens.com",
  "email4@example.com",
  "athill@lumens.com",
  "email5@example.com",
  "email6@example.com",
];

// Array to store email addresses that have carts
let CustomerEmailsWithCarts = [];
let currentIndex = 0;

// Function to send the next email to content.js for processing
function processNextEmail(tabId) {
  if (currentIndex < customerEmail.length) {
    // Send the current email to content.js
    console.log(
      "Sending email to content.js for processing:",
      customerEmail[currentIndex]
    );
    chrome.tabs.sendMessage(tabId, { email: customerEmail[currentIndex] });
    currentIndex++;
  } else {
    // All emails have been processed
    console.log("All emails have been processed.");
    // Open the popup and display the list of emails that have carts
    chrome.windows.create(
      {
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        width: 400,
        height: 600,
      },
      function () {
        chrome.runtime.sendMessage({
          action: "showEmails",
          emails: CustomerEmailsWithCarts,
        });
      }
    );
  }
}

// Listener for when the extension button is clicked
chrome.browserAction.onClicked.addListener(function (tab) {
  currentIndex = 0; // Reset index to 0
  CustomerEmailsWithCarts = []; // Reset the array storing emails with carts
  console.log("Reset CustomerEmailsWithCarts array.");

  // Open the Lumens search page and inject the content script
  chrome.tabs.create(
    { url: "https://www.lumens.com/csc/search-customer/" },
    function (newTab) {
      chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
        if (tabId === newTab.id && changeInfo.status === "complete") {
          processNextEmail(tabId); // Start processing the first email
        }
      });
    }
  );
});

// Listener for messages from content.js
chrome.runtime.onMessage.addListener(function (request, sender) {
  if (request.action === "storeEmail") {
    // Store the email if a cart is found
    console.log("Received email from content.js to store:", request.email);
    CustomerEmailsWithCarts.push(request.email);
  }

  if (request.action === "nextEmail") {
    console.log("Moving to next email.");
    // Process the next email
    processNextEmail(sender.tab.id);
  }
});
