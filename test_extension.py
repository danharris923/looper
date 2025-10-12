from playwright.sync_api import sync_playwright
import time
import os

extension_path = os.path.join(os.getcwd(), 'dist')
print(f"Loading extension from: {extension_path}")

with sync_playwright() as p:
    # Launch browser with extension
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

    print("Opened YouTube. Click the extension icon to test it.")
    print("Waiting 30 seconds for you to interact...")

    time.sleep(30)

    # Take screenshot
    page.screenshot(path='extension_test.png')
    print("Screenshot saved as extension_test.png")

    context.close()
