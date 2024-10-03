let previousUrl = '';
let buttonClickedId = "";

const observer = new MutationObserver(function(mutations) {
  if (location.href !== previousUrl) {
      previousUrl = location.href;

      if(location.href.startsWith('https://chatgpt.com/c/')){
        waitForReactContent();
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
          addButtonListeners();
          console.log("gee")

      }
  });


  observer.observe(document.body, {
      childList: true,
      subtree: true,
  });
}

async function initializeExtension() {
  chrome.storage.local.get("starred-gpt-conversations", (result) => {
      const conversations = result["starred-gpt-conversations"] || [];
      const url = window.location.href;
      let isStarred = conversations.some((conv) => conv.url === url);

      removeExistingButton(); 

      const starButton = document.createElement("button");
      starButton.id = "gpt-star-button";
      starButton.textContent = isStarred ? "Starred" : "Star";
      starButton.style.position = "fixed";
      starButton.style.top = "50px";
      starButton.style.right = "10px";
      starButton.style.zIndex = "9999";
      starButton.style.padding = "5px 10px";
      starButton.style.backgroundColor = isStarred ? "#ffd700" : "transparent";
      starButton.style.color = "white";
      starButton.style.border = "1px solid #000000";
      starButton.style.borderRadius = "5px";
      starButton.style.cursor = "pointer";

      document.body.appendChild(starButton);

      starButton.onclick = function (event) {
          event.stopPropagation();

          if (!isStarred) {
              const preferredName = prompt(
                  "Enter keywords separated by ',' for this conversation:"
              );
              if (preferredName) {
                  conversations.push({ name: preferredName, url: url });
                  chrome.storage.local.set({
                      "starred-gpt-conversations": conversations,
                  });
                  starButton.textContent = "Starred";
                  starButton.style.backgroundColor = "#ffd700";
              }
              isStarred = true;
          } else {
              if (confirm("Do you really want to unstar the conversation?")) {
                  const index = conversations.findIndex((conv) => conv.url === url);
                  if (index !== -1) {
                      conversations.splice(index, 1);
                      chrome.storage.local.set({
                          "starred-gpt-conversations": conversations,
                      });
                      starButton.textContent = "Star";
                      starButton.style.backgroundColor = "transparent";
                      isStarred = false;
                  }
              }
          }
      };
  });
}

// Function to add event listeners to buttons
function addButtonListeners() {
    // Select all buttons that have aria-controls starting with 'radix-:'
    const buttons = document.querySelectorAll('button[aria-controls^="radix-:"]');
    console.log("Adding listeners to SVG children");
  
    if (buttons.length > 0) {
      buttons.forEach(button => {
        // Select the SVG child of the current button
        const svg = button.querySelector('svg');
        
        if (svg) {
          svg.addEventListener('click', (event) => {
            // Get the parent button element
            const parentButton = event.currentTarget.closest('button[aria-controls^="radix-:"]');
            
            if (parentButton) {
              console.log(`Button with aria-controls ${parentButton.getAttribute('aria-controls')} clicked via SVG`);
            }
          });
        }
      });
    }
  }
  
  

const config = {subtree: true, childList: true};
observer.observe(document, config);
