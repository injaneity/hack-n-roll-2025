function gatherTextUpToDepth(node, currentDepth, maxDepth) {
  if (currentDepth > maxDepth) return "";

  let text = "";
  if (node.nodeType === Node.TEXT_NODE) {
    text += node.textContent;
  } 

  else if (node.nodeType === Node.ELEMENT_NODE) {
    for (let child of node.childNodes) {
      text += gatherTextUpToDepth(child, currentDepth + 1, maxDepth);
    }
  }

  return text;
}

function replaceTextWithRandomMessage(messages) {
  if (messages.length === 0) {
    console.warn("No negative messages available to replace text.");
    return;
  }

  const elements = document.querySelectorAll("div.update-components-text.relative");

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

    // --------------------------------------------------------------
    // 1) Check for .comments-comment-entity--reply or a container
    //    from which you can locate an <h3> that indicates “Author”.
    // --------------------------------------------------------------
    const parentWithClass = element.closest(".comments-comment-entity--reply");
    if (parentWithClass) {
      // For example, we look for any <h3> that has text "Author" inside
      const h3WithAuthor = Array.from(parentWithClass.querySelectorAll("h3"))
        .find((h3) => h3.textContent.toLowerCase().includes("author"));

      // If found, skip replacement
      if (h3WithAuthor) {
        console.log("Skipping because an adjacent <h3> has 'Author' inside.");
        return;
      }
    }

    // If the check above did NOT find an <h3> with “Author,” proceed to replace
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

  const negativeMessages = await fetchNegativeMessages();
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
                  // -----------------------------
                  // Similar 'h3 Author' check here
                  // -----------------------------
                  const parentWithClass = element.closest(
                    ".comments-comment-entity--reply"
                  );
                  if (parentWithClass) {
                    const h3WithAuthor = Array.from(
                      parentWithClass.querySelectorAll("h3")
                    ).find((h3) =>
                      h3.textContent.toLowerCase().includes("author")
                    );

                    if (h3WithAuthor) {
                      console.log(
                        "Skipping because an adjacent <h3> has 'Author' inside."
                      );
                      return;
                    }
                  }

                  const commentContainer = element.closest(".comments-comment-entity");
                  if (commentContainer) {
                    // -----------------------------------------------------------
                    // Gather text up to depth 6, convert to lowercase, check for "author"
                    // -----------------------------------------------------------
                    const partialText = gatherTextUpToDepth(commentContainer, 0, 6).toLowerCase();

                    if (partialText.includes("author")) {
                      console.log("Skipping because 'author' was found within 6 nesting levels.");
                      return;
                    }
                  }

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

                  element.dataset.replaced = "true";
                }
              }
            });
          }
        });
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

async function fetchNegativeMessages() {
  try {
    const response = await fetch(
      chrome.runtime.getURL("data/negative_messages.txt")
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const text = await response.text();
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


if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", handleTextReplacement);
} else {
  handleTextReplacement();
}
