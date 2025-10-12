from playwright.sync_api import sync_playwright
import time
import os

extension_path = os.path.join(os.getcwd(), 'dist')

console_messages = []
page_errors = []

with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        "",
        headless=False,
        args=[
            f'--disable-extensions-except={extension_path}',
            f'--load-extension={extension_path}'
        ]
    )

    page = context.new_page()

    # Capture all console messages
    page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: page_errors.append(str(err)))

    page.goto('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    print("Waiting 5 seconds for page load...")
    time.sleep(5)

    print("\n=== CONSOLE MESSAGES ===")
    for msg in console_messages:
        print(msg)

    print("\n=== PAGE ERRORS ===")
    for err in page_errors:
        print(err)

    # Check if content script functions exist
    result = page.evaluate("""
        () => {
            return {
                hasFindVideo: typeof findVideo !== 'undefined',
                hasCreateLoopStation: typeof createLoopStation !== 'undefined',
                hasVideoLooper: typeof VideoLooper !== 'undefined',
                hasPedalVisible: typeof pedalVisible !== 'undefined',
                chromeRuntime: typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined'
            }
        }
    """)

    print("\n=== CONTENT SCRIPT CHECK ===")
    for key, value in result.items():
        print(f"{key}: {value}")

    # Now try to manually send the message via JavaScript
    print("\n=== CLICKING EXTENSION (via message) ===")
    click_result = page.evaluate("""
        async () => {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                try {
                    // Try to trigger content script manually
                    if (typeof createLoopStation === 'function') {
                        createLoopStation();
                        return {success: true, method: 'direct call'};
                    } else {
                        return {success: false, error: 'createLoopStation not defined'};
                    }
                } catch (e) {
                    return {success: false, error: e.toString()};
                }
            }
            return {success: false, error: 'chrome.runtime not available'};
        }
    """)

    print(f"Manual trigger result: {click_result}")

    time.sleep(2)

    # Check if pedal exists now
    pedal_check = page.evaluate("""
        () => {
            const pedal = document.querySelector('.yt-loop-pedal');
            return {
                pedalExists: !!pedal,
                pedalHTML: pedal ? pedal.outerHTML.substring(0, 200) : null
            }
        }
    """)

    print("\n=== PEDAL CHECK ===")
    print(f"Pedal exists: {pedal_check['pedalExists']}")
    if pedal_check['pedalHTML']:
        print(f"Pedal HTML preview: {pedal_check['pedalHTML']}")

    print("\nBrowser will close in 10 seconds...")
    time.sleep(10)
    context.close()
