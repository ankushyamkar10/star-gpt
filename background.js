// Existing code...

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStarredConversations') {
      chrome.storage.local.get('starred-gpt-conversations', (result) => {
        sendResponse({ conversations: result['starred-gpt-conversations'] || [] });
      });
      return true; // Indicates that the response is asynchronous
    }
  
    if (request.action === 'starConversation') {
      chrome.storage.local.get('starred-gpt-conversations', (result) => {
        let conversations = result['starred-gpt-conversations'] || [];
        conversations.push(request.conversation);
        chrome.storage.local.set({ 'starred-gpt-conversations': conversations }, () => {
          sendResponse({ success: true });
        });
      });
      return true;
    }
  
    if (request.action === 'unstarConversation') {
      chrome.storage.local.get('starred-gpt-conversations', (result) => {
        let conversations = result['starred-gpt-conversations'] || [];
        conversations = conversations.filter(conv => conv.url !== request.url);
        chrome.storage.local.set({ 'starred-gpt-conversations': conversations }, () => {
          sendResponse({ success: true });
        });
      });
      return true;
    }
  });
  
  // Optional: Add any other background functionality here