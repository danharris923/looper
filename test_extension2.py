from playwright.sync_api import sync_playwright
import time
import os

extension_path = os.path.join(os.getcwd(), 'dist')
print(f"Loading extension from: {extension_path}")

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

    print("Waiting for video to load...")
    time.sleep(5)

    # Execute script to check if content.js loaded
    result = page.evaluate("""
        () => {
            return {
                hasLoopStation: !!document.querySelector('.yt-loop-pedal'),
                hasFindVideo: typeof findVideo !== 'undefined',
                hasCreateLoopStation: typeof createLoopStation !== 'undefined'
            }
        }
    """)

    print(f"Extension status: {result}")

    # Trigger the extension manually
    print("Calling createLoopStation()...")
    page.evaluate("if (typeof createLoopStation === 'function') createLoopStation();")

    time.sleep(2)

    # Check for the new elements
    check = page.evaluate("""
        () => {
            const pedal = document.querySelector('.yt-loop-pedal');
            const hamburger = document.getElementById('hamburgerMenu');
            const settingsPanel = document.getElementById('settingsPanel');

            return {
                pedalExists: !!pedal,
                pedalTransform: pedal ? pedal.style.transform : null,
                hamburgerExists: !!hamburger,
                settingsPanelExists: !!settingsPanel,
                pedalHTML: pedal ? pedal.outerHTML.substring(0, 500) : null
            }
        }
    """)

    print("\n=== EXTENSION CHECK ===")
    print(f"Pedal exists: {check['pedalExists']}")
    print(f"Pedal transform: {check['pedalTransform']}")
    print(f"Hamburger menu exists: {check['hamburgerExists']}")
    print(f"Settings panel exists: {check['settingsPanelExists']}")
    print(f"\nFirst 500 chars of pedal HTML:\n{check['pedalHTML']}")

    page.screenshot(path='extension_activated.png', full_page=True)
    print("\nScreenshot saved as extension_activated.png")

    time.sleep(10)
    context.close()
