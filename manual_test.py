from playwright.sync_api import sync_playwright
import os

extension_path = os.path.join(os.getcwd(), 'dist')
print(f"\n{'='*60}")
print(f"EXTENSION PATH: {extension_path}")
print(f"{'='*60}\n")

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

    print("\n" + "="*60)
    print("INSTRUCTIONS:")
    print("1. Wait for YouTube to load (5 seconds)")
    print("2. Click the EXTENSION ICON in the toolbar")
    print("3. Browser will stay open for 60 seconds")
    print("4. Check if you see:")
    print("   - SMALLER pedal (70% size)")
    print("   - HAMBURGER MENU (top-left)")
    print("="*60 + "\n")

    input("Press ENTER when ready to take screenshot...")

    page.screenshot(path='manual_check.png', full_page=True)
    print("\nScreenshot saved: manual_check.png")

    # Check what's actually in the DOM
    result = page.evaluate("""
        () => {
            const pedal = document.querySelector('.yt-loop-pedal');
            if (!pedal) return {error: 'No pedal found'};

            return {
                transform: pedal.style.transform,
                hasHamburger: !!document.getElementById('hamburgerMenu'),
                hasSettings: !!document.getElementById('settingsPanel'),
                width: pedal.style.width,
                innerHTML: pedal.innerHTML.substring(0, 1000)
            };
        }
    """)

    print("\n" + "="*60)
    print("DOM CHECK:")
    print(f"Transform: {result.get('transform')}")
    print(f"Has Hamburger: {result.get('hasHamburger')}")
    print(f"Has Settings: {result.get('hasSettings')}")
    print("="*60)

    input("\nPress ENTER to close browser...")
    context.close()
