# Changelog

## 2020-12-25 v0.1.1
### Bug fixes:
1. Hide embeds during zooming, due to zooming/animations getting laggy with content heavy on multimedia embeds.
2. Checkmark position in colour selection.
3. Check default colour in colour selection.
4. Ignore `.hidden` files, e.g. `.gitignore` and possible `.htaccess`.
### Improvements:
1. Save images as files to `media` directory, instead of base64 strings in the note to enable lazy loading of images in notes.
