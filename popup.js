document.addEventListener("DOMContentLoaded", () => {
  const conversationList = document.getElementById("conversation-list");
  const refreshButton = document.getElementById("refresh-button");
  const searchInput = document.getElementById("search-input");

  let conversations = [];

  function loadConversations() {
    chrome.storage.local.get("starred-gpt-conversations", (result) => {
      conversations = result["starred-gpt-conversations"] || [];
      displayConversations(conversations);
    });
  }

  function displayConversations(conversationsToDisplay) {
    conversationList.innerHTML = "";
    conversationsToDisplay.forEach((conversation) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = conversation.url;
      link.textContent = conversation.name || "Unnamed Conversation";
      link.target = "_blank";
      li.appendChild(link);
      conversationList.appendChild(li);
    });
  }

  searchInput.addEventListener("input", (e) => {
    const searchText = e.target.value.toLowerCase();
    const filteredConversations = conversations.filter((conversation) =>
      (conversation.name || "Unnamed Conversation").toLowerCase().includes(searchText)
    );
    displayConversations(filteredConversations);
  });

  loadConversations();

  refreshButton.addEventListener("click", loadConversations);
});
