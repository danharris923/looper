chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.tabs.sendMessage(tab.id, {action: 'toggle_pedal'});
  } catch (error) {
    // Ignore errors - content script may not be loaded yet
  }
});