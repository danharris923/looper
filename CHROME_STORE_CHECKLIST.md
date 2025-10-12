# Chrome Web Store Submission Checklist

## Pre-Submission Requirements

### Extension Package (dist folder)
- [x] manifest.json (version 1.0.2, Manifest V3)
- [x] background.js (service worker)
- [x] content.js (main extension logic)
- [x] icon16.png (16x16)
- [x] icon32.png (32x32)
- [x] icon48.png (48x48)
- [x] icon128.png (128x128)
- [x] loop-station-text.png (web accessible resource)

### Package Preparation
1. Verify all files are in the `dist` folder
2. Create ZIP file of the `dist` folder contents (NOT the dist folder itself)
   - Command: Navigate to `dist` folder and select all files, then compress
   - File name: `yt-loop-station-v1.0.2.zip`
   - Size: Should be under 10MB (actual size will be ~50-100KB)

### Store Listing Information (from CHROME_STORE_DESCRIPTION.md)

#### Required Text Content
- [x] Extension name: YT Loop Station
- [x] Tagline (132 chars max): Professional loop station for YouTube videos with 30ms crossfade technology for seamless, gapless audio looping.
- [x] Detailed description: See CHROME_STORE_DESCRIPTION.md
- [x] Category: Productivity
- [x] Language: English

#### Privacy & Permissions
- [x] Privacy policy: Included in CHROME_STORE_DESCRIPTION.md
- [x] Permission justification (activeTab): Documented
- [x] No data collection or external requests

#### Required Images

**Extension Icons** (Already created)
- [x] 16x16: icon16.png
- [x] 32x32: icon32.png
- [x] 48x48: icon48.png
- [x] 128x128: icon128.png

**Store Listing Screenshots** (NEED TO CREATE - 3 to 5 required)
- [ ] Screenshot 1: 1280x800 - Loop station interface on YouTube video (overview)
- [ ] Screenshot 2: 1280x800 - Controls close-up showing knobs and toggles
- [ ] Screenshot 3: 1280x800 - Active loop with green PLAY state
- [ ] Screenshot 4: 1280x800 - Parameter adjustment demonstration (optional)
- [ ] Screenshot 5: 1280x800 - Draggable positioning demonstration (optional)

**Promotional Images** (OPTIONAL - recommended for better visibility)
- [ ] Marquee: 1400x560px - Promotional banner
- [ ] Small tile: 440x280px - Tile image for store

## Submission Steps

### Developer Account
1. [ ] Access Chrome Web Store Developer Dashboard at https://chrome.google.com/webstore/devconsole
2. [ ] Pay one-time $5 developer registration fee (if not already registered)
3. [ ] Verify email address

### Upload Extension
1. [ ] Click "New Item" in Developer Dashboard
2. [ ] Upload `yt-loop-station-v1.0.2.zip`
3. [ ] Wait for automated security and policy analysis

### Complete Store Listing
1. [ ] Add extension name: YT Loop Station
2. [ ] Add tagline from CHROME_STORE_DESCRIPTION.md
3. [ ] Add detailed description from CHROME_STORE_DESCRIPTION.md
4. [ ] Select category: Productivity
5. [ ] Select language: English
6. [ ] Upload 3-5 screenshots (1280x800 each)
7. [ ] Upload promotional images (optional)
8. [ ] Add privacy policy text from CHROME_STORE_DESCRIPTION.md
9. [ ] Justify permissions (activeTab): From CHROME_STORE_DESCRIPTION.md

### Pricing & Distribution
1. [ ] Set pricing: Free
2. [ ] Select countries/regions: All countries (or specific regions)
3. [ ] Set visibility: Public

### Additional Information
1. [ ] Mature content: No
2. [ ] Official URL: (optional - could be GitHub repository)
3. [ ] Support email: (required)

### Final Review
1. [ ] Preview listing in dashboard
2. [ ] Verify all text appears correctly
3. [ ] Check all images display properly
4. [ ] Review permissions list
5. [ ] Submit for review

## Post-Submission

### Review Process
- Google typically reviews within 1-3 business days
- Check email for approval or feedback
- Address any issues raised by reviewers

### If Approved
- Extension goes live on Chrome Web Store
- Monitor reviews and ratings
- Respond to user feedback

### If Rejected
- Review rejection reason
- Make necessary changes
- Resubmit updated package

## Version Updates (for future releases)

1. Update version number in both manifest.json files
2. Update README.md version history
3. Create new ZIP package from dist folder
4. Upload as update to existing listing (NOT new item)
5. Update "What's new in this version" section
6. Submit for review

## Notes

- Maximum ZIP size: 10MB (current package is well under)
- Screenshots must be exactly 1280x800 or 640x400
- Description maximum: 16,000 characters
- Tagline maximum: 132 characters
- Extension name: No character limit but keep concise
- Review time: 1-3 business days typical
- Support email is required and will be public

## Current Status

**Ready for submission:** YES (pending screenshot creation)

**Files prepared:**
- Extension package ready in dist folder
- manifest.json updated to v1.0.2
- README.md rewritten with detailed technical information
- CHROME_STORE_DESCRIPTION.md created with all listing content
- Permissions restricted to YouTube only (security best practice)

**Still needed:**
- Create 3-5 screenshots at 1280x800 resolution
- Provide support email address
- Optional: Create promotional images (marquee and small tile)
