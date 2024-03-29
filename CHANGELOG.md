# Changelog

## 2021-01-14 v0.2.0
### Improvements:
- Sidebar: add custom buttons to top-left that open any URLs in a sidebar for quick access.

## 2020-12-25 v0.1.1
### Bug fixes:
- Hide embeds during zooming, due to zooming/animations getting laggy with content heavy on multimedia embeds.
- Checkmark position in colour selection.
- Check default colour in colour selection.
- Ignore `.hidden` files, e.g. `.gitignore` and possible `.htaccess`.
- Use Link URL as hyperlink text if `<title>` is unavailable.
### Improvements:
- Save images as separate files to `media` directory (instead of base64 strings in the notes) to enable eager loading of notes but lazy loading containing images.
- Open all links in notes with `target="_blank"`
