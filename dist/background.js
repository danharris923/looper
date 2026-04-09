chrome.action.onClicked.addListener(async (tab) => {
  // Validate tab ID exists
  if (!tab || !tab.id) {
    console.warn('Invalid tab or tab ID');
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, {action: 'toggle_pedal'});
  } catch (error) {
    // Content script not loaded - this is expected behavior
    console.log('Content script not yet loaded on this tab');
  }
});