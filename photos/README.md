# Photography Portfolio Photos

This folder contains the photos for the Photography Portfolio section of the personal website.

## How to Add Photos

1. **Prepare Your Photos**:
   - Optimize your photos for web use (recommended size: 800px-1200px on the longest side)
   - Use JPEG format for photographs
   - Name your files with numbers (e.g., `1.jpeg`, `2.jpeg`, etc.)

2. **Add Photos to This Folder**:
   - Place your photos directly in this folder
   - The website will automatically load all photos from this directory

3. **Update Photo Information**:
   - Open `pages/photography.html`
   - Find the `photos` array in the JavaScript section
   - Add or update entries for your photos with the following information:
     ```javascript
     { 
       src: '../photos/your-photo-number.jpeg', 
       alt: 'Photo X', 
       title: '', // Leave empty for now
       description: '' // Leave empty for now
     }
     ```

## Captions

Captions are currently disabled but the feature is preserved for future use. When you're ready to add captions:

1. Update the photo information in the JavaScript section of `photography.html`
2. Remove the `overlay.style.display = 'none';` line in the JavaScript to show the captions

## Tips for Best Results

- Use a mix of portrait and landscape orientations for visual interest
- Ensure good quality and composition for all photos
- Consider the overall color palette for a cohesive look
- Photos will be displayed in a random collage layout with varying sizes 