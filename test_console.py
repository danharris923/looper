from playwright.sync_api import sync_playwright
import time
import os

extension_path = os.path.join(os.getcwd(), 'dist')
print(f"Loading extension from: {extension_path}")

console_logs = []
console_errors = []

with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        "",
        headless=False,
        args=[
            f'--disable-extensions-except={extension_path}',
            f'--load-extension={extension_path}',
            '--disable-blink-features=AutomationControlled'
        ]
    )

    page = context.new_page()

    # Capture console messages
    page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: console_errors.append(str(err)))

    page.goto('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    print("Waiting for page to load...")
    time.sleep(5)

    print("\n=== CONSOLE LOGS ===")
    for log in console_logs:
        print(log)

    print("\n=== CONSOLE ERRORS ===")
    for err in console_errors:
        print(err)

    # Check if content script loaded
    check = page.evaluate("""
        () => {
            const scripts = Array.from(document.querySelectorAll('script'));
            return {
                totalScripts: scripts.length,
                hasContentJS: scripts.some(s => s.src && s.src.includes('content.js')),
                extensionFunctions: {
                    findVideo: typeof findVideo,
                    createLoopStation: typeof createLoopStation,
                    VideoLooper: typeof VideoLooper
                }
            }
        }
    """)

    print("\n=== SCRIPT CHECK ===")
    print(f"Total scripts: {check['totalScripts']}")
    print(f"Has content.js: {check['hasContentJS']}")
    print(f"Extension functions: {check['extensionFunctions']}")

    time.sleep(5)
    context.close()
