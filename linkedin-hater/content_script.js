function getElementTextContent(el) {
  return el ? el.innerText.trim() : "";
}

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

async function handleTextReplacement() {

  const negativeMessages = await fetchNegativeMessages();
  if (!negativeMessages || negativeMessages.length === 0) return;

  const observer = new MutationObserver((mutationsList) => {

    for (const mutation of mutationsList) {

      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {

          if (node.nodeType === Node.ELEMENT_NODE) {
            const newElements = node.querySelectorAll(
              "div.update-components-text.relative"
            );

            newElements.forEach((element) => {
              const parent = element.parentElement;
              if (
                parent &&
                parent.classList.contains("feed-shared-main-content--comment")
              ) {

                if (element.dataset.replaced !== "true") {
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

                  // proof of concept: appending post text
                  const postContainer = element.closest(".fie-impression-container");
                  let postContent = "";

                  if (postContainer) {
                    
                    const mainPost = postContainer.querySelector(
                      ".update-components-text.relative.update-components-update-v2__commentary"
                    );
                    if (mainPost) {
                      const breakWordsSpan = mainPost.querySelector("span.break-words.tvm-parent-container");
                      if (breakWordsSpan) {
                        const ltrSpan = breakWordsSpan.querySelector('span[dir="ltr"]');
                        postContent = getElementTextContent(ltrSpan);
                      }
                    }
                  }

                  const combinedMessage = `${randomMessage}\n[Original Post Extract: ${postContent}]`;

                  const childSpan = element.querySelector("span");
                  if (childSpan) {
                    childSpan.textContent = combinedMessage;
                  } else {
                    element.textContent = combinedMessage;
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
