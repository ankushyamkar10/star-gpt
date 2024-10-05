let previousUrl = "";
let buttonClickedId = "";

const observer = new MutationObserver(function (mutations) {
  if (location.href !== previousUrl) {
    previousUrl = location.href;

    if (location.href.startsWith("https://chatgpt.com/c/")) {
      waitForReactContent();
      console.log("first");
    } else {
      removeExistingButton();
    }
  }
});

function removeExistingButton() {
  const existingButton = document.getElementById("gpt-star-button");
  if (existingButton) {
    existingButton.remove();
  }
}

function waitForReactContent() {
  const observer = new MutationObserver((mutations, obs) => {
    const appContent = document.querySelector(
      'div[class^="react-scroll-to-bottom"]'
    );
    if (appContent) {
      obs.disconnect();
      initializeExtension();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

async function initializeExtension() {
  chrome.runtime.sendMessage(
    { action: "getStarredConversations" },
    (response) => {
      const conversations = response.conversations || [];
      const url = window.location.href;
      let isStarred = conversations.some((conv) => conv.url === url);

      removeExistingButton();
      const starButton = document.createElement("button");
      starButton.id = "gpt-star-button";
      starButton.appendChild(createStarIcon(isStarred));
      starButton.style.background = "none";
      starButton.style.border = "none";
      starButton.style.cursor = "pointer";
      starButton.style.color = isStarred ? "#ffd700" : "#ffffff";
      starButton.style.marginLeft = "right"; // Add some spacing between buttons
  
      // Find the target button
      const targetButton = document.querySelector('[data-testid="share-chat-button"]');
      if (targetButton && targetButton.parentNode) {
        // Insert the star button before the target button
        targetButton.parentNode.insertBefore(starButton, targetButton);
      } else {
        console.error("Target button not found");
        return;
      }

      starButton.onclick = function (event) {
        event.stopPropagation();

        if (!isStarred) {
          const preferredName = prompt(
            "Enter keywords separated by ',' for this conversation:"
          );
          if (preferredName) {
            chrome.runtime.sendMessage(
              {
                action: "starConversation",
                conversation: { name: preferredName, url: url },
              },
              (response) => {
                if (response.success) {
                  starButton.innerHTML = '';
                  starButton.appendChild(createStarIcon(true));
                  starButton.style.color = "#ffd700";
                  isStarred = true;
                }
              }
            );
          }
        } else {
          if (confirm("Do you really want to unstar the conversation?")) {
            chrome.runtime.sendMessage(
              {
                action: "unstarConversation",
                url: url,
              },
              (response) => {
                if (response.success) {
                  starButton.innerHTML = '';
                  starButton.appendChild(createStarIcon(false));
                  starButton.style.color = "#ffffff";
                  isStarred = false;
                }
              }
            );
          }
        }
      };
    }
  );
}


const config = { subtree: true, childList: true };
observer.observe(document, config);

function createStarIcon(filled) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z");
  
  if (filled) {
    path.setAttribute("fill", "currentColor");
  }

  svg.appendChild(path);
  return svg;
}