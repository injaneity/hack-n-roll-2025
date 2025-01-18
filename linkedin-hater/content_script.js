// Function to fetch negative messages from the text file
async function fetchNegativeMessages() {
  try {
    const response = await fetch(
      chrome.runtime.getURL("data/negative_messages.txt")
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const text = await response.text();
    // Split the text into an array of sentences, filtering out any empty lines
    const messages = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return messages;
  } catch (error) {
    console.error("Failed to fetch negative messages:", error);
    return [];
  }
}

// Function to replace text in elements with the class "update-components-text"
function replaceTextWithRandomMessage(messages) {
  if (messages.length === 0) {
    console.warn("No negative messages available to replace text.");
    return;
  }

  // Select all elements with the specified class
  const elements = document.querySelectorAll(
    "div.update-components-text.relative"
  );

  if (elements.length === 0) {
    console.warn(
      'No elements found with the class "update-components-text relative".'
    );
    return;
  }

  // Iterate over each element and replace its text content
  elements.forEach((element) => {
    // Select a random message from the array
    const randomIndex = Math.floor(Math.random() * messages.length);
    const randomMessage = messages[randomIndex];

    // Replace the inner text of the child span to preserve any HTML structure
    const childSpan = element.querySelector("span");
    if (childSpan) {
      childSpan.textContent = randomMessage;
    } else {
      // Fallback: replace the entire div's text content if span not found
      element.textContent = randomMessage;
    }
  });
}

// Function to handle initial and dynamically added elements
async function handleTextReplacement() {
  const negativeMessages = [
    "Everything is going wrong today.",
    "I can't believe this is happening.",
    "Nothing ever works out as planned.",
    "This is a terrible mistake.",
    "I don't think this will succeed.",
    // Add more sentences as needed
  ];

  if (negativeMessages.length === 0) return;

  // Initial replacement
  replaceTextWithRandomMessage(negativeMessages);

  // Set up a MutationObserver to watch for dynamically added comments
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // Find any new elements with the target class
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const newElements = node.querySelectorAll(
              "div.update-components-text.relative"
            );
            newElements.forEach((element) => {
              const randomIndex = Math.floor(
                Math.random() * negativeMessages.length
              );
              const randomMessage = negativeMessages[randomIndex];

              const childSpan = element.querySelector("span");
              if (childSpan) {
                childSpan.textContent = randomMessage;
              } else {
                element.textContent = randomMessage;
              }
            });
          }
        });
      }
    }
  });

  // Start observing the document body for added child nodes
  observer.observe(document.body, { childList: true, subtree: true });
}

// Execute the replacement when the DOM is fully loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", handleTextReplacement);
} else {
  handleTextReplacement();
}
