# Pwst-it® Personal Notes Board

Do you just hate how some pencil necks decide how to categorize, organize and sort out your NOTES neatly making sure you never find any of them? Are you dying to get your own, organized chaos online? Look no further, for Pwst-it® Personal Notes Board is here to help. 

Pwst-it® has a large board where you can stick small (or big) sticky notes of different colours in. You can add and read notes on mobile devices (very stripped down user interface), but it's designed for desktop use,as this board interface is not very convenient at all for small screens.

![Some basic notes on Pwst-it](https://storage.googleapis.com/olaviinha/github/pwst-it/simple.jpg)
Some basic notes on Pwst-it®

## Some features

- Large draggable board. May be many times larger than your viewport. Board position is instantly saved upon 
  dragging.
- All notes are freely draggable and resizable. Positions and sizes are instantly saved upon dragging or 
  resizing.
- Quickly zoom out to view the entire board and back in wherever you click.
- Quick x-ray vision to see if you've e.g. accidentally hidden small notes behind some bigger ones.
- Background, font (few built-in) and some other settings are changeable in the fly as you go.
- Keyboard shortcuts!
- Password-protected. Cookie keeps you logged in forever. You should note, however, that the security of this 
  webapp is not exactly state of the art. If your board is located on a public server and you make notes about 
  national security or corporate secrets, it is recommended that you review and up the security game of this app.
- Log out (close active sessions on other devices) remotely.
- Saves everything in flat files (and some settings in cookies); no database required.
- Supports some basic text formattings in markdown language.
- Auto-embed youtube, soundcloud, video and audio URLs.
- Auto-hyperlink website URLs to human-readable form using the page <title>.
- Paste rich text and images.
- Want plain text notes instead? No problem, just set all the rich content settings to `false`.
- Recycle bin for notes you want off the board but not to the ether just yet.

![Some rich content notes on Pwst-it](https://storage.googleapis.com/olaviinha/github/pwst-it/richcontent-settings-bin2.jpg)
Some notes rich in content. Settings bar and recycle bin opened.

![X-ray vision](https://storage.googleapis.com/olaviinha/github/pwst-it/xray.jpg)
X-ray vision.

![Overview](https://storage.googleapis.com/olaviinha/github/pwst-it/overview.jpg)
Overview of board.

## Prerequisites
- PHP
- PHP cURL

#### ...included in the solution from CDNs:
- Font Awesome
- jQuery
- jQuery UI
- [jquery.cookie](https://github.com/carhartl/jquery-cookie), courtesy of Klaus Hartl.

#### ...included in in the repository:
- [simplebar](https://github.com/Grsmto/simplebar), courtesy of Jonathan Nicol.
- [jQuery Awesome Cursor](https://github.com/jwarby/jquery-awesome-cursor), courtesy of James Warwood.

## Setup
1. Download or clone this repository.
2. Edit `index.php` in a text editor and change the default password: `$pw = "AveSatanas666";`.
3. Edit `pwst-it.js` in a text editor, read through and change any of the settings.
4. Upload all files to a web server.
5. Grant PHP write permissions to subdirectories `notes`, `settings` `sessions` and `recyclebin`. On Debian based apache2 setups
this will probably do:
```
cd /wherever-it-is/located/pwst-it/
sudo chown -R www-data:www-data notes settings sessions recyclebin
```
6. Done.

## How to use

There are no tips or other descriptive texts in the UI. You should read this through.

- There is a bunch of settings in the beginning of `pwst-it.js`, some of which may actually interest you, such as:
```
allowRichPaste: true,               // Allow pasting rich text.
allowImagePaste: true,              // Allow pasting images but not rich text.
allowEmbed: true,                   // Allow turning pasted links to embeds and human-readable hyperlinks.
```
```
cancel: 'Escape',                   // Close activated things (new note, editing, settings).
drag: 'Shift',                      // Hold to enable grabbing from anything while dragging board.
xray: 'x',                          // Hold to see through notes.
zoomIn: 'w',                        // Zoom in to the same view where you zoomed out from.
zoomOut: 's',                       // Zoom out to overview.
settings: 'a',                      // Open settings bar.
createNew: 'd',                     // Create new note wherever your cursor is.
fullScreen: 'z'                     // Toggle full screen.
```
- Double-click anywhere on board to create a new note on that point.
- Double click on a note to edit it or delete it from the board.
- There is a faint gear icon in top right corner. Click to open Settings bar.
- All settings changed in the Settings bar are saved on **device** (browser cookies).
- To drag the board in your viewport, grab anywhere on the site background -or- hold down shift key while dragging (see keyboard bindings). 
- To drag a note around the board, grab the note from anywhere but the very bottom/right edges or bottom-right corner.
- To resize a note on the board, grab the note from its bottom/right edges or bottom-right corner.
- To bring a note to front, simply click it. There is no other functionality regarding the z-order of notes. If you want multiple notes to overlap in certain order, you need to click each one in back-to-front order.
- To cancel creating a new note or editing a note, click anywhere on the page outside the new note creation box. If you wrote something in the text area before cancelling, the text will remain as a draft for a new note until you reload the page or clear the text area manually.
- All deleted notes are actually moved to Recycle Bin, which is accessible from the Settings bar (recycle icon).
- In the Recycle Bin list, you can read, perma-delete and restore notes.
- To restore a note, click the Undo icon over that note in the Recycle Bin. Note will be restored to where it last was on the board. If you have newer notes on where that note used to be, the restored note will be behind them.
- To perma-delete a note (gone forever) click the trash can icon over that note on Recycle Bin.
- To empty Recycle Bin, you need to empty the `pwst-it/recyclebin` folder on your server.

## Keyboard shortcut bindings
This lists what keyboard shortcuts are available, and what are the default keys.
- Hold to drag (default: Shift). Hold down while dragging the board to enable grabbing from anything, including notes (which otherwise are draggable by themselves). This is mostly for situations where your board is so full of notes you have too little background visible to grab on to.
- X-ray vision (default: X). Hold down to see through all notes. This is mostly for situations where you may have lost
a note by e.g. leaving it behind some larger notes.
- Zoom out (default: A). Zoom out to view the entire board and all notes in it.
- Zoom in (default: Q). Zooms back in from the view where you zoomed out from. Note that clicking anywhere on the screen is probably more convenient, as it will zoom in to the point where you clicked.
- Create note (default: N). Create new note wherever your cursor is located. Double click (and right-click if enabled) do the exact same thing.
- Settings (default: A). Open/close the settings bar.
- Full screen (default: D). Open/exit full screen mode.
- Cancel (default: Esc). Closes/cancels different things on screen, depending on what's happening.

