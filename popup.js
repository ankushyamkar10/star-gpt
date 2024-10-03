document.addEventListener("DOMContentLoaded", () => {
  const conversationList = document.getElementById("conversation-list");
  const refreshButton = document.getElementById("refresh-button");

  function loadConversations() {
    let conversations = [];

    chrome?.storage?.local?.get("starred-gpt-conversations", (result) => {
      console.log(result, result["starred-gpt-conversations"]);
      conversations = result["starred-gpt-conversations"];

      console.log(conversations);
      conversationList.innerHTML = "";
      conversations.forEach((conversation) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = conversation.url;
        link.textContent = conversation.name || "Unnamed Conversation";
        link.target = "_blank";
        li.appendChild(link);
        conversationList.appendChild(li);
      });
    });
  }

  // Load conversations when the popup is opened
  loadConversations();

  // Reload conversations when the refresh button is clicked
  refreshButton.addEventListener("click", loadConversations);
});
