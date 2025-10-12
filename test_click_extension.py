from playwright.sync_api import sync_playwright
import time
import os

extension_path = os.path.join(os.getcwd(), 'dist')

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
    page.goto('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    print("Waiting for video...")
    time.sleep(5)

    # Trigger extension by sending message
    result = page.evaluate("""
        async () => {
            // Simulate clicking the extension icon
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                const response = {simulated: true};
                // Trigger the content script manually
                if (typeof createLoopStation === 'function') {
                    createLoopStation();
                    return {success: true, method: 'direct'};
                }
                return {success: false, createLoopStationType: typeof createLoopStation};
            }
            return {success: false, noChrome: true};
        }
    """)

    print(f"Result: {result}")

    # Wait a bit and check
    time.sleep(2)

    check = page.evaluate("""
        () => {
            const pedal = document.querySelector('.yt-loop-pedal');
            const hamburger = document.getElementById('hamburgerMenu');

            if (!pedal) {
                // List all classes in DOM
                const allElements = document.querySelectorAll('*');
                const classes = [];
                for (let el of allElements) {
                    if (el.className && typeof el.className === 'string') {
                        classes.push(...el.className.split(' '));
                    }
                }
                const uniqueClasses = [...new Set(classes)].filter(c => c.includes('loop') || c.includes('pedal'));

                return {
                    pedalExists: false,
                    searchedClasses: uniqueClasses,
                    globalFunctions: Object.keys(window).filter(k => k.includes('loop') || k.includes('Loop'))
                };
            }

            return {
                pedalExists: true,
                pedalTransform: pedal.style.transform,
                hamburgerExists: !!hamburger
            };
        }
    """)

    print("\n=== CHECK ===")
    print(check)

    page.screenshot(path='final_test.png', full_page=True)
    print("\nScreenshot: final_test.png")

    time.sleep(10)
    context.close()
