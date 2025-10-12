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

    print("\nBrowser opened! Waiting 30 seconds...")
    print("PLEASE CLICK THE EXTENSION ICON NOW!")
    print("Checking in 30 seconds...\n")

    time.sleep(30)

    # Check DOM
    result = page.evaluate("""
        () => {
            const pedal = document.querySelector('.yt-loop-pedal');
            if (!pedal) return {error: 'No pedal found - extension not clicked?'};

            return {
                transform: pedal.style.transform,
                hasHamburger: !!document.getElementById('hamburgerMenu'),
                hasSettings: !!document.getElementById('settingsPanel'),
                computedWidth: window.getComputedStyle(pedal).width,
                computedTransform: window.getComputedStyle(pedal).transform
            };
        }
    """)

    print("="*60)
    print("RESULT:")
    for key, value in result.items():
        print(f"  {key}: {value}")
    print("="*60)

    page.screenshot(path='auto_test.png', full_page=True)
    print("\nScreenshot saved: auto_test.png")
    print("Closing in 5 seconds...")
    time.sleep(5)
    context.close()
