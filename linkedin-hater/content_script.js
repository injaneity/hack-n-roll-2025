const negativeMessages = [
  "This is absolutely terrible.",
  "I can't believe how bad this is.",
  "This is such a disappointment.",
  "Horrible execution.",
  "Completely unimpressive.",
  "This needs a lot of work.",
  "Utterly underwhelming.",
  "This is not worth the effort.",
  "Such a waste of time.",
  "This is shockingly bad.",
  "Terrible idea.",
  "Who thought this was a good idea?",
  "I expected much better.",
  "Very poorly done.",
  "This is just plain bad.",
  "So frustrating to see.",
  "This is absolutely subpar.",
  "I wouldn't recommend this to anyone.",
  "So many things wrong here.",
  "Such a letdown.",
  "This doesn't even make sense.",
  "Awful execution overall.",
  "I really hate this.",
  "This lacks any real effort.",
  "What a disaster.",
  "This needs a complete overhaul.",
  "Just terrible.",
  "This is laughably bad.",
  "So poorly thought out.",
  "This is way below expectations.",
  "This makes no sense.",
  "How can anyone like this?",
  "Terribly done.",
  "What a mess.",
  "This is absolutely atrocious.",
  "So disappointing.",
  "This is garbage.",
  "This is an insult to effort.",
  "Horribly designed.",
  "This needs to be scrapped.",
  "Not worth even a second look.",
  "Absolutely pathetic.",
  "This is truly horrendous.",
  "Not even close to decent.",
  "This is outright offensive.",
  "This is a waste of potential.",
  "So underwhelming.",
  "This isn't even acceptable.",
  "This is completely broken.",
  "Awfully managed.",
  "What were they thinking?",
  "This has no redeeming qualities.",
  "So irritating to deal with.",
  "This is a failure.",
  "A real eyesore.",
  "Who approved this?",
  "This should not exist.",
  "Horrendously done.",
  "So below average.",
  "This is incredibly poor.",
  "This reeks of laziness.",
  "Absolutely unacceptable.",
  "This is trash.",
  "Terribly unprofessional.",
  "This is totally inadequate.",
  "This is way off the mark.",
  "Such a poor effort.",
  "This can't be serious.",
  "An absolute joke.",
  "This is disastrously bad.",
  "Not worth mentioning.",
  "I can't stand this.",
  "This is deeply flawed.",
  "This is hopeless.",
  "This could not be worse.",
  "An epic failure.",
  "Nothing works here.",
  "This is shockingly ineffective.",
  "This isn't even salvageable.",
  "Such poor judgment.",
  "This is an embarrassment.",
  "So much for quality.",
  "Not even close to good.",
  "This is utterly pointless.",
  "Completely incompetent.",
  "This is bottom-tier work.",
  "This is cringe-worthy.",
  "This has no value.",
  "Just plain awful.",
  "This should never have seen the light of day.",
  "What a trainwreck.",
  "This is beyond saving.",
  "No thought went into this.",
  "This is completely amateurish.",
  "This is hopelessly flawed.",
  "This feels insulting.",
  "How did this even happen?",
  "No effort here whatsoever.",
  "This is absolutely not okay.",
  "This is entirely unimpressive.",
];

// // Function to fetch negative messages from the text file
// async function fetchNegativeMessages() {
//   try {
//     const response = await fetch(
//       chrome.runtime.getURL("data/negative_messages.txt")
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const text = await response.text();
//     // Split the text into an array of sentences, filtering out any empty lines
//     const messages = text
//       .split("\n")
//       .map((line) => line.trim())
//       .filter((line) => line.length > 0);
//     return messages;
//   } catch (error) {
//     console.error("Failed to fetch negative messages:", error);
//     return [];
//   }
// }

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

    const parentWithClass = element.closest(".comments-comment-entity--reply");

    if (parentWithClass) {
      const authorChild = Array.from(
        parentWithClass.querySelectorAll("*")
      ).find((child) => child.textContent.trim() === "Author");

      if (authorChild) {
        console.log("Found child with text 'Author':", authorChild);
        return;
      } else {
        console.log("No child with text 'Author' found.");
      }
    } else {
      console.log("Parent with the specified class not found.");
    }

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
  // Ensure negativeMessages is defined and has content
  if (!negativeMessages || negativeMessages.length === 0) return;

  // Set up a MutationObserver to watch for dynamically added comments
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // Iterate over all added nodes
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Select elements with the target class within the added node
            const newElements = node.querySelectorAll(
              "div.update-components-text.relative"
            );
            newElements.forEach((element) => {
              // Check if the parent element contains the comment class
              const parent = element.parentElement;
              if (
                parent &&
                parent.classList.contains("feed-shared-main-content--comment")
              ) {
                // Avoid replacing text multiple times
                if (element.dataset.replaced !== "true") {
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

                  // Mark the element as replaced
                  element.dataset.replaced = "true";
                }
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
