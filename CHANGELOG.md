# Changelog

## 2020-12-25 v0.1.1
### Bug fixes:
- Hide embeds during zooming, due to zooming/animations getting laggy with content heavy on multimedia embeds.
- Checkmark position in colour selection.
- Check default colour in colour selection.
- Ignore `.hidden` files, e.g. `.gitignore` and possible `.htaccess`.
### Improvements:
- Save images as files to `media` directory, instead of base64 strings in the note to enable lazy loading of images in notes.
- Open all links in notes with `target="_blank"`
