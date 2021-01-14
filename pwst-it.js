// ----------------------------------------------------------------------------------
// Settings
// ----------------------------------------------------------------------------------

// Board size
var board = { 
    width: 3600,                        // Board width
    height: 2600                        // Board height
}

// Note size (default)
var note = {
    width: 260,                         // Note width by default
    height: 260                         // Note height by default
}

// Various settings
var settings = {
    speed: 300,                         // Default speed of UX stuff (animations, fades, etc.) (ms).
    margin: 20,                         // Default margin of things.
    maxDeg: 2,                          // Maximum degrees to rotate notes on board.
    saveDelay: 200,                     // Delay between performed action and saving changes (ms). Will prevent weird stuff of various kind.
    saveIconDuration: 300,              // How long "saving" icon id displayed upon save.
    extendLongNotesTo: 300,             // If note content is long (scrollable), extend note height to a maximum of this many pixels.
    rightClick: false,                  // Show new note creation box instead of context menu on right click.
    allowRichPaste: true,               // Allow pasting rich text.
    allowImagePaste: true,              // Allow pasting images but not rich text.
    allowEmbed: true,                   // Allow turning pasted links to embeds and human-readable hyperlinks.
    sidebar: true,                      // Display sidebar buttons.

    // Experimental settings that will likely fuck up your board.
    // You should not touch these unless your up for some development work.
    sliders: false,                     // Some sliders for adjusting background. These sliders have no layout.
    allowRichText: false                // Allow rich text in notes.
}

// Keyboard shortcuts
var keys = {
    cancel: 'Escape',                   // Close activated things (new note, editing, settings).
    drag: 'Shift',                      // Hold to enable grabbing from anything while dragging board.
    xray: 'x',                          // Hold to see through notes.
    zoomIn: 'w',                        // Zoom in to the same view where you zoomed out from.
    zoomOut: 's',                       // Zoom out to overview.
    settings: 'a',                      // Open settings bar.
    createNew: 'd',                     // Create new note wherever your cursor is.
    fullScreen: 'z',                    // Toggle full screen.

    sidebarItem1: '1',                  // Sidebar item #1
    sidebarItem2: '2',                  // etc.
    sidebarItem3: '3',
    sidebarItem4: '4',
    sidebarItem5: '5',
    sidebarItem6: '6',
}

// Sidebar items. Button icon, iframe url, iframe width
var sidebar = [
    {   
        icon: '<i class="fa fa-bus"></i>', 
        url: '/hsl',
        width: 600
    }, {   
        icon: '<i class="fa fa-line-chart"></i>', 
        url: '/finnstonks',
        width: 600
    }
]


// Elements
var npel = {
    container: '.board-container',      // Container in which board is located
    board: '.board',                    // Board
    old: '.old_notes',                  // Element containing notes
    note: '.old_notes .note',           // Individual note
    new: '.new_note',                   // New note box
    edit: '.edit_note',                 // Edit note box (added to .note in edit mode)
    messageContainer: '.top-right',     // Container for messages
    message: '.loader',                 // Element to display messages in
    loader: '.loader',                  // Element for a spinner while things are being saved or loaded
    savebtn: '.save_note',              // Save note button
    deletebtn: '.delete_note',
    settingsIcon: '.settings-container .icon',// Settings icon
    settings: '.settings-container',    // Settings container
    settingsContent: '.settings-content',// Settings
    disabler: '.disabler',              // Disabler overlay
    bin: '.recycle-bin',                // Recycle bin
    mobile: '.mobile',                  // Container for mobile view
    sidebar: '.sidebar-wrapper',        // Sidebar
    embedElements: 'embed-image, embed-audio, embed-video, embed-youtube, embed-soundcloud',
    nullel: false
}

// Cookies
var npcookie = {
    state: 'np_state',                  // Board open state
    bg: 'np_bg',                        // Board background image
    position: 'np_pos',                 // Board position
    defcolor: 'np_defcolor',            // Default color of note
    lastcolor: 'np_lastcolor',          // Last color of note
    font: 'np_font',                     // Font
    bghue: 'np_bghue',
    bgsat: 'np_bgsaturation',
    bgsize: 'np_bgsize'
}


// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------

// var inputSimpleBar;

var saveNoteTask, msgTimeout, x, y, originalTop, originalLeft, originalRight, soTop, caret;
var dragging = false;
var cursorMoved = false;
var newVisible = false;
var settingsVisible = false;
var shifted = false;
var outlined = false;
var zoomed = false;
var zoomFactor = 1;
var xfull = false;
var binVisible = false;
var newNoteResized = false;
var editing = false;
var wind = {
    width: 0,
    height: 0
}

degs = new Array();
for(i=0; i < 10; i++){
    var rnd = settings.maxDeg+Math.floor(Math.random()*(settings.maxDeg*2))-settings.maxDeg*2;
    degs.push(rnd);
}

function detectMob() {
    return ((window.innerWidth <= 800 ) && (window.innerHeight <= 600));
  }

function changeCursor(el, cur=false, color='#000'){
    $('.cursor').remove();
    if(cur && $(el).css('cursor') != cur){
        $(el).awesomeCursor(cur, {
            color: color
        });
    } else {
        $(el).css('cursor', '');
    }
}

function randomInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ( (node = el.firstChild) ) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        document.selection.createRange().pasteHTML(html);
    }
}

// ----------------------------------------------------------------------------------
// Reset note UX
// ----------------------------------------------------------------------------------
function resetNoteUX(noteel){
    var that = noteel;
    var nLeft = noteel.css('left');
    var nTop = noteel.css('top');
    if(Number(parseInt(nLeft)) > $(npel.board).width()){
        nLeft = $(npel.board).width() - note.width + 'px';

    }
    if(Number(parseInt(nTop)) > $(npel.board).height()){
        nTop = $(npel.board).height() - note.height + 'px';
    }
    if(!shifted){
        noteel.mouseenter(function(){
            $(this).resizable({
                cancel: false,
                zIndex: 60000,
                start: function(event, ui){
                    clearTimeout(saveNoteTask);
                    unbindKeyboard();
                    if($(this).hasClass(npel.new)){
                        newNoteResized = true;
                    }
                    dragging = true;
                },
                stop: function(event, ui) {
                    bindKeyboard();
                    resetUX(npel.board);
                    dragging = false;
                }
            })
            .draggable({
                containment: npel.board,
                cancel: false,
                start: function() {
                    clearTimeout(saveNoteTask);
                    unbindKeyboard();
                    if(zoomed){
                        zDef += 1;
                        noteel.css('z-index', zDef);
                    }
                    dragging = true;
                },
                stop: function() {
                    bindKeyboard();
                    var coords = $(this).position();
                }
            });
            changeCursor(this, 'arrows');
        }).mouseleave(function(){
            if($(this).data('resizable')){
                $(this).resizable('destroy');
            }
            if($(this).data('draggable')){
                $(this).draggable('destroy');
            }
        }).mousedown(function(){
            if(!zoomed){
                zDef += 1;
                noteel.css('z-index', zDef);
            }
        }).mouseup(function(e){
            clearTimeout(saveNoteTask);
            if($(this).hasClass('new_note')){
                var mode = 'new_note';
            } else  {
                var mode = 'edit_note';
            }
            if(!editing){
                saveNoteTask = setTimeout(function(){
                    save_note(that, mode, false);
                }, settings.saveDelay);
            }

            if(dragging){
                dragging = false;
            }

        }).click(function(e){

        }).dblclick(function(e){
            if( !$(e.target).hasClass('ui-icon') ){
                enableEdit($(this));
            }
        }).css({
            'left': nLeft,
            'top': nTop
        });
        noteel.find('.content-input').on('mouseup keyup', function(){
            caret = window.getSelection().anchorOffset;
            var noteContent = $(this).parents('.note-content');
            noteContent.css('height', noteContent.height()+'px');
            var simpleBar = SimpleBar.instances.get( noteContent[0] );
            if(simpleBar){ 
                simpleBar.recalculate(); 
            }
        });
        noteel.find(npel.savebtn).click(function(e){
            e.stopPropagation();
            var nParent = $(this).parents('.noted');
            save_note(nParent);
            $(npel.disabler).addClass('dpn');
            bindKeyboard();
            newNoteResized = false;
        });
        noteel.find(npel.deletebtn).click(function(e){
            e.stopPropagation();
            clearTimeout(saveNoteTask);
            var nParent = $(this).parents('.noted');
            var id = nParent.attr('id');
            $.ajax({
                type: 'POST',
                url: '.',
                data: {
                    'action': 'delete',
                    'id': id
                },
                fail: function(resp){
                    console.log('Failed to move note to recycle bin.', resp);
                },
                success: function(resp){
                    if(resp=='removed'){
                        nParent.remove();
                    }
                }
            });

        });
        noteel.find('.content-input').on('mousedown mouseup click', function(e){
            e.stopPropagation();
        });
        noteel.find('pre, code').on('mouseenter mousedown mouseup', function(e){
            e.stopPropagation();
        });

    }

}
// ----------------------------------------------------------------------------------
// End of Reset note UX
// ----------------------------------------------------------------------------------


// ----------------------------------------------------------------------------------
// Reset UX
// ----------------------------------------------------------------------------------
function resetUX(el){
    // Reset board UX
    if(el == npel.board){
        $(npel.board).draggable({
            snap: false,
            cancel: false,
            start: function() {
                dragging = true;
                unbindKeyboard();
            },
            drag: function(e, ui) {
                var speed = 1.0;
                var newLeft = ui.position.left * speed;
                var newTop = ui.position.top * speed;
                newLeft = Math.min(0, newLeft);
                newLeft = Math.max(-Math.abs(board.width)+wind.width, newLeft);
                newTop = Math.min(0, newTop);
                newTop = Math.max(-Math.abs(board.height)+wind.height, newTop);
                ui.position.left = newLeft;
                ui.position.top = newTop;
            },
            stop: function() {
                var coords = $(npel.board).offset().left+'x'+$(npel.board).offset().top;
                $.cookie(npcookie.position, coords);
                bindKeyboard();
            }
        }).mousemove(function(){
            changeCursor(this, 'arrows-alt', '#088');
        }).mouseup(function(e){
            if(dragging){
                setTimeout(function(){
                    dragging = false;
                }, 200);
                dragging = false;
            }
            if(!dragging){
                changeCursor(this, 'plus-square');
            }
            if(zoomed){
                var newLeft = wind.width - x - wind.width/2;
                var newTop = wind.height - y - wind.height/2;
                newLeft = Math.min(0, newLeft);
                newLeft = Math.max(-Math.abs(board.width)+wind.width, newLeft);
                newTop = Math.min(0, newTop);
                newTop = Math.max(-Math.abs(board.width)+wind.height, newTop);
                zoomIn(newTop, newLeft);
            }
        }).dblclick(function(e){
            var isNote = $(e.target).hasClass('note') || $(e.target).parents('.note').length > 0;
            if(!isNote){
                create_note($(this));
            }
        }).contextmenu(function(e){
            if(settings.rightClick){
                e.preventDefault();
                var isNote = $(e.target).hasClass('note') || $(e.target).parents('.note').length > 0;
                if(!isNote){
                    create_note($(this));
                }
            }
        });
    }
    // Reset all notes UX
    if(el == npel.note){
        $(npel.note).each(function(i){
            resetNoteUX($(this));
        });
    }
    // Reset new/edit note UX
    if(el == npel.new || el == npel.edit){
        $(el).each(function(i){
            var that = $(this);
            if(!settings.allowRichText){
                $(this).find('.content-input').attr('contenteditable', 'plaintext-only')
            }
            $(this).find('.content-input').on('click mousedown', function(e){
                e.stopPropagation();
            });
            $(this)
            .resizable({
                resize: function(event, ui){
                    that.find('.note-content').height( 150 + (ui.size.height - ui.originalSize.height) );
                },
                stop: function(event, ui) {
                    resetUX(npel.board);
                    resetUX(npel.note);
                }
            })
            .draggable({
                containment: npel.board
            });
            $(this).find('.checkmark').click(function(){
                $(el).removeClass (function (index, className) {
                    return (className.match (/(^|\s)bg-\S+/g) || []).join(' ');
                }).addClass('bg-'+$(this).data('color'));
                $(el).find('.color').val($(this).data('color'));
                $.cookie(npcookie.lastcolor, $(this).data('color'));
                setTimeout(function(){
                    that.find('.content-input').focus();
                    $(el).find('.content-input').focus();
                }, 20);
            });

        });
    }

    // Restore note size to default by double-clicking corner handle
    $('.note .ui-resizable-handle.ui-icon').dblclick(function(e){
        $(this).parents('.note').css({
            'width': note.width,
            'height': note.height
        });
        save_note($(this).parents('.note'))
    });
}
// ----------------------------------------------------------------------------------
// End of Reset UX
// ----------------------------------------------------------------------------------

function checkColor(el){
    if($.cookie(npcookie.defcolor)=='lastused'){
        $('span.'+$.cookie(npcookie.lastcolor)).click();
        el.find('input.'+$.cookie(npcookie.lastcolor)).prop('checked', true);
    } else {
        $('span.'+$.cookie(npcookie.defcolor)).click();
        el.find('input.'+$.cookie(npcookie.defcolor)).prop('checked', true);
    }
}

function enableEdit(el){
    unbindKeyboard();
    clearTimeout(saveNoteTask);
    $(npel.note).find('.read').removeClass('dpn');
    $(npel.note).find('.edit').addClass('dpn');
    el.find('.read, .edit').toggleClass('dpn');
    el.find('.color-selection span.'+el.data('color')).click();
    el.find('.color-selection input.'+el.data('color')).prop('checked', true);
    el.toggleClass('edit_note');
    el.find('.note-content').height( 150 + parseInt(el.css('height')) - note.height );
    el.find('.content-input').focus();
    resetUX(npel.edit);
    $(npel.disabler).removeClass('dpn');
    editing = true;
}

function disableEdit(el){
    el.find('.read, .edit').toggleClass('dpn');
    el.toggleClass('edit_note');
    $(npel.disabler).addClass('dpn');
    bindKeyboard();
    editing = false;
}

function create_note(el){
    if(el.data('dblclick')==0) return;
    xnLeft = x - parseInt($(npel.board).css('left'));
    xnTop = y - parseInt($(npel.board).css('top'));
    $(npel.new).css({
        'left': xnLeft,
        'top': xnTop
    });
    $(npel.new).removeClass('dpn');
    $(npel.disabler).removeClass('dpn');
    checkColor($(npel.new));
    $(npel.new).find('.content-input').focus();
    unbindKeyboard();
    newVisible = true;
}

function show_loader(){
    $(npel.loader).removeClass('hidden');
}

function hide_loader(){
    $(npel.loader).addClass('hidden');
}

function show_message(msg){
    clearTimeout(msgTimeout);
    // $(npel.message).html(msg);
    $(npel.settingsIcon).addClass('hidden');
    $(npel.message).removeClass('hidden');
    msgTimeout = setTimeout(function(){
        $(npel.message).addClass('hidden');
        setTimeout(function(){
            $(npel.settingsIcon).removeClass('hidden');
        }, settings.speed);
    },  settings.saveIconDuration);
}


// ----------------------------------------------------------------------------------
// Save note
// ----------------------------------------------------------------------------------
function save_note(el, action='new_note', printBack=true){
    clearTimeout(saveNoteTask);
    if(!el.hasClass(npel.new.replace('.',''))){
        action = 'update_note';
    }
    show_loader();
    note_id = el.attr('id');
    note_top = parseInt(el.css('top'));
    note_left = parseInt(el.css('left'));
    note_width = parseInt(el.css('width'));
    note_height = parseInt(el.css('height'));
    if(newNoteResized){
        note_width = el.width();
        note_height = el.height();
    }
    note_color = el.find('input.color').val();
    el.find('.content-input').find('br.br').remove();
    el.find('.content-input').find('div.line-break').remove();
    note_txt = el.find('.content-input').html();
    zDef += 1;
    $.ajax({
        type: 'POST',
        url: '.',
        data: {
            'action': action,
            'id': note_id,
            'top': note_top,
            'left': note_left,
            'height': note_height,
            'width': note_width,
            'zindex': zDef,
            'color': note_color,
            'content': note_txt
        },
        fail: function(resp){
            console.log('Failed to save note.', resp);
        },
        success: function(resp){
            $(npel.new).addClass('dpn');
            disableEdit(el);
            $(npel.new).find('.content-input').html('');
            if(action=='new_note'){
                $(npel.old).append(resp);
            } else {
                el.remove()
                $(npel.old).append(resp);
            }
            noteId = $(resp).attr('id') || note_id;
            ironNoteContent($('#'+noteId));
            show_message('Note saved.');
            resetNoteUX($('#'+noteId));
            if($(npel.note).length){
                $('.empty-board').remove();
            }
            editing = false;
            newVisible = false;
        }
    });
}
// ----------------------------------------------------------------------------------
// End of Save note
// ----------------------------------------------------------------------------------


function zoomOut(hard=false){
    zoomFactor = wind.width / board.width;
    originalTop = $(npel.board).css('top');
    originalLeft = $(npel.board).css('left');
    if(hard==false){
        $(npel.embedElements).find('img, video, audio, iframe').css('visibility', 'hidden');
        $(npel.board).animate({
            'zoom': zoomFactor,
            'top': 0,
            'left': 0
        }, settings.speed, function(){
            $(npel.embedElements).find('img, video, audio, iframe').css('visibility', 'visible');
        });
    } else {
        $(npel.board).css({
            'zoom': zoomFactor,
            'top': 0,
            'left': 0
        });
    }
    changeCursor($(npel.disabler), 'search-plus');
    $(npel.board).draggable('disable');
    $(npel.board).data('dblclick', 0);
    setTimeout(function(){
        $(npel.disabler).removeClass('dpn');
    }, 300);
    zoomed = true;
}

function zoomIn(top, left){
    $(npel.embedElements).find('img, video, audio, iframe').css('visibility', 'hidden');
    $(npel.board).animate({
        'zoom': 1,
        'top': top,
        'left': left
    }, settings.speed, function(){
        $(npel.embedElements).find('img, video, audio, iframe').css('visibility', 'visible');
    });
    $(npel.board).draggable('enable');
    $(npel.board).data('dblclick', 1);
    changeCursor($(npel.disabler), '');
    setTimeout(function(){
        $(npel.disabler).addClass('dpn');
    }, 300);
    zoomed = false;
}

function openSettings(){
    soTop = $(npel.settingsContent).css('top');
    soRight = $(npel.settingsContent).css('right');
    $(npel.settingsContent).animate({'top': 0, 'right': '-20px'}, settings.speed);
    $(npel.settingsIcon).addClass('fullopa');
    toggleIcon($(npel.settingsIcon).find('.fa'));
    settingsVisible = true;
}

function closeSettings(){
    $(npel.settingsContent).animate({'top': soTop, 'right': soRight}, settings.speed);
    $(npel.settingsIcon).removeClass('fullopa');
    toggleIcon($(npel.settingsIcon).find('.fa'));
    if(binVisible){
        $(npel.bin).animate({
            'right': '-360px'
        }, settings.speed);
        binVisible = false;
    }
    settingsVisible = false;
}

var outlineOut;
var strokeCount = 0;
function bindKeyboard(){
    $(document).unbind('keyup keydown');
    $(document).bind('keydown', function(e){
        if(e.key == keys.drag){
            $(npel.disabler).removeClass('dpn');
            shifted = true;
        }
        if(e.key == keys.xray){
            $(npel.note).addClass('outlined');
        }
    }).bind('keyup', function(e){
        if(e.key == keys.drag){
            $(npel.disabler).addClass('dpn');
            shifted = false;
        }
        if(e.key == keys.settings){
            if(settingsVisible){
                closeSettings();
            } else {
                openSettings();
            }   
        }
        if(e.key == keys.cancel){
            if(settingsVisible){
                closeSettings();
            }
            if(editing){
                disableEdit($(npel.edit));
            }
        }
        if(e.key == keys.zoomOut && zoomed == false){
            zoomOut();
        }
        if(e.key == keys.zoomIn && zoomed == true){
            zoomIn(originalTop, originalLeft);
        }
        if((e.key == keys.createNew) && zoomed == false){
            $(npel.board).dblclick();
        }
        if(e.key == keys.fullScreen){
            $('button.fullscreen').click();
        }
        if(e.key == keys.xray){
            $(npel.note).removeClass('outlined');
        }
        if(settings.sidebar == true && e.key == keys.sidebarItem1){ $(npel.sidebar).find('.item:nth-child(1)').click(); }
        if(settings.sidebar == true && e.key == keys.sidebarItem2){ $(npel.sidebar).find('.item:nth-child(2)').click(); }
        if(settings.sidebar == true && e.key == keys.sidebarItem3){ $(npel.sidebar).find('.item:nth-child(3)').click(); }
        if(settings.sidebar == true && e.key == keys.sidebarItem4){ $(npel.sidebar).find('.item:nth-child(4)').click(); }
        if(settings.sidebar == true && e.key == keys.sidebarItem5){ $(npel.sidebar).find('.item:nth-child(5)').click(); }
        if(settings.sidebar == true && e.key == keys.sidebarItem6){ $(npel.sidebar).find('.item:nth-child(6)').click(); }
    });
}

function unbindKeyboard(){
    $(document).unbind('keyup keydown');
    $(document).bind('keyup keydown', function(e){
        shifted = e.shiftKey;
        if(!editing && !newVisible){
            if(shifted){
                $(npel.disabler).removeClass('dpn');
            } else {
                $(npel.disabler).addClass('dpn');
            }
        }
        if(e.key == keys.cancel){
            if(newVisible){
                $(npel.new).addClass('dpn');
                $(npel.disabler).addClass('dpn');
                newVisible = false;
                bindKeyboard();
            }
            if(editing){
                disableEdit($(npel.edit));
            }
        }
    });
}

function toggleIcon(el) {
    el.toggleClass('dpn');
    var angle = 0;
    $({deg: -90}).animate({deg: angle}, {
        duration: settings.speed/2,
        step: function(now) {
            el.css({
                transform: 'rotate(' + now + 'deg)',
            });
        }
    });
}

function createDropdown(el){
    var title = '<div class="title">'+el.data('title')+'</div>';
    var cook = el.data('cook');
    var that = el;
    var selected = el.find('.selected');
    selected.html(title+selected.html());
    el.find('.menu .item').each(function(){
        var selectedTxt = selected.html().replace(title, '');
        var cookTxt = '';
        if($.cookie(cook)){
            cookTxt = $.cookie(cook);
        }
        if($(this).data('val') == cookTxt || $(this).html() == selectedTxt){
            $(this).addClass('dpn');
            if($.cookie(cook)){
                selected.html(title+$(this).html());
            }
        } else {
            $(this).removeClass('dpn');
        }
    })
    el.click(function(){
        el.find('.menu').slideToggle(settings.speed/2);
    });
    el.find('.menu .item').click(function(){
        that.find('.menu .item').removeClass('dpn');
        $(this).addClass('dpn');
        var txt = $(this).html();
        var val = $(this).data('val');
        that.find('.selected').html(title+txt);
        $.cookie(cook, val);
        show_message('Settings saved.');
    });
}

function postItIt(el){
    el.css({
        'transform': 'rotate('+degs[Math.floor(Math.random() * degs.length)]+'deg)',
        'border-bottom-right-radius': randomInt(0, 70)+'px '+randomInt(0, 6)+'px',
        'border-bottom-left-radius': randomInt(0, 70)+'px '+randomInt(0, 6)+'px'
    });
}

function mdHtml(raw){
    raw = '<div class="temp">'+raw+'</div>';
    raw = raw.replace(/\*\*(.*?)\*\*/gm, '<strong>$1</strong>');
    raw = raw.replace(/\*(.*?)\*/gm, '<strong>$1</strong>');
    raw = raw.replace(/\_(.*?)\_/gm, '<i>$1</i>');
    raw = raw.replace(/\~~(.*?)\~~/gm, '<strike>$1</strike>');
    raw = raw.replace(/\```(.*?)\```/gm, '<pre>$1</pre>');
    if($('pre',  $(raw)).length){
        var pre = $('pre', $(raw)).html();
        pre = pre.replace('<br>', '');
        pre = pre.replace(/<br>/gi, '\n');
        raw = raw.replace(/\<pre>(.*?)\<\/pre>/gm, '<pre>'+pre+'</pre>');
    }
    raw = raw.replace(/\`(.*?)\`/gm, '<code>$1</code>');
    var innerHtml = $(raw).filter('.temp').html();
    return innerHtml;
}

function ironNoteContent(el) {
    postItIt(el);
    var mdhtml = mdHtml( el.find('.content').html() );
    if(mdhtml.indexOf('<pre>') > -1){
        el.addClass('includes-code');
    }
    el.find('.content').html(mdhtml + '<br><br>');
    el.find('.content .embed-link').each(function(){
        $(this).attr('target', '_blank');
    });
    el.find('.content embed-youtube').each(function(){
        that = $(this);
        var eurl = $(this).html();
        var tubeId = getYoutubeId(eurl);
        if(tubeId){
            that.html('<iframe width="100%" src="https://www.youtube.com/embed/'+tubeId+'" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>');
        }
    });
    el.find('.content embed-soundcloud').each(function(){
        var eurl = $(this).html();
        $(this).html('<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=' + eurl + '&show_artwork=false"></iframe>');
    });
    el.find('.content embed-audio').each(function(){
        var eurl = $(this).html();
        $(this).html('<audio controls src="'+eurl+'"></audio>');
    });
    el.find('.content embed-video').each(function(){
        var eurl = $(this).html();
        $(this).html('<video controls src="'+eurl+'"></video>');
    });
    if(!settings.allowRichText){
        el.find('.content-input').attr('contenteditable', 'plaintext-only')
    }
}

function isYoutubeLink(url){
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
        ? true
        : false;
}

function getYoutubeId(url){
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
        ? match[2]
        : null;
}

function isAudio(url){
    const regExp = /\.(?:wav|mp3|flac|m4a|aac|ogg|wma)$/i;
    const match = url.match(regExp);
    return (match && url.match(regExp))
}

function isVideo(url){
    const regExp = /\.(?:avi|mp4|wmv|mov|flv|mkv)$/i;
    const match = url.match(regExp);
    return (match && url.match(regExp))
}

function isSoundcloudLink(url){
    const regExp = /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/;
    return url.match(regExp) && url.match(regExp)[2]
}

function imgAsBase64(pasteEvent, callback, imageFormat){
    if(pasteEvent.clipboardData == false){
        if(typeof(callback) == "function"){
            callback(undefined);
        }
    };
    var items = pasteEvent.clipboardData.items;
    if(items == undefined){
        if(typeof(callback) == "function"){
            callback(undefined);
        }
    };
    for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") == -1) continue;
        var blob = items[i].getAsFile();
        var mycanvas = document.createElement("canvas");
        var ctx = mycanvas.getContext('2d');
        var img = new Image();
        img.onload = function(){
            mycanvas.width = this.width;
            mycanvas.height = this.height;
            ctx.drawImage(img, 0, 0);
            if(typeof(callback) == "function"){
                callback(mycanvas.toDataURL(
                    "image/jpeg", 1.0
                ));
            }
        };
        var URLObj = window.URL || window.webkitURL;
        img.src = URLObj.createObjectURL(blob);
    }
}

function isValidUrl(url) {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

// ----------------------------------------------------------------------------------
// Clipboard paste handler
// ----------------------------------------------------------------------------------
window.addEventListener('paste', function(e){
    if(settings.allowRichPaste || settings.allowImagePaste || settings.allowEmbed){
        e.stopPropagation();
        e.preventDefault();
        var el;
        var clipboardData = e.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData('Text');
        var isText = false;
        var isRichText = false;
        var isCode = false;
        var isImage = false;
        var isUrl = false;
        var waitForLoad = false;
        var pastedPlainText, pastedRichText, pastedCode, pastedImage, pastedUrl, finalPaste;
        if(settings.allowEmbed){
            if(isValidUrl(pastedData)){
                pastedUrl = pastedData;
                isUrl = true;
            }
        }

        if(!isUrl){
            $.each(clipboardData.items, function (i, item) {
                if(item.type === 'text/plain'){
                    pastedPlainText = clipboardData.getData('Text');
                    isText = true;
                }
                if(item.type == 'text/html'){
                    pastedRichText = clipboardData.getData('text/html');
                    isRichText = true;
                }
                if (item.type.indexOf('image') !== -1) {
                    imgAsBase64(e, function(imageDataBase64){
                        if(imageDataBase64){
                            contentType = 'image';
                            id = imageDataBase64;
                            iu = '';
                            $.ajax({
                                type: 'POST',
                                url: '.',
                                async: false,
                                data: {
                                    'action': 'upload',
                                    'data': imageDataBase64
                                },
                                fail: function(resp){
                                    console.log('Failed to upload image', resp);
                                },
                                success: function(resp){
                                    var pasteImage = '<embed-image><img src="' + resp + '"></embed-image>';
                                    pasteHtmlAtCaret(pasteImage);
                                }
                            });
                        }
                    });
                    isImage = true;
                }
                else if (item.type === 'vscode-editor-data'){
                    pastedCode = clipboardData.getData('text/html');
                    isCode = true;
                }
            });
        }
        if(newVisible){
            el = $(npel.new).find('.content-input');
        } else if (editing){
            el = $(npel.edit).find('.content-input');
        }
        if(isUrl && settings.allowEmbed){
            if(isYoutubeLink(pastedUrl)){
                pastedUrl = '<embed-youtube>'+pastedUrl.trim().replace(/(\r\n|\n|\r)/gm,"")+'</embed-youtube> \n';
            } else if (isSoundcloudLink(pastedUrl)) {
                pastedUrl = '<embed-soundcloud>'+pastedUrl.trim().replace(/(\r\n|\n|\r)/gm,"")+'</embed-soundcloud> \n';
            } else if (isAudio(pastedUrl)) {
                pastedUrl = '<embed-audio>'+pastedUrl.trim().replace(/(\r\n|\n|\r)/gm,"")+'</embed-audio> \n';
            } else if (isVideo(pastedUrl)) {
                pastedUrl = '<embed-video>'+pastedUrl.trim().replace(/(\r\n|\n|\r)/gm,"")+'</embed-video> \n';
            } else {
                pastedUrl = '<embed-link>'+pastedUrl.trim().replace(/(\r\n|\n|\r)/gm,"")+'</embed-link> \n';
            }
            pasteHtmlAtCaret(pastedUrl);
        }
        if(!isImage && !isUrl){
            if(isRichText && settings.allowRichPaste){
                finalPaste = pastedRichText;
            } else if (isCode && settings.allowRichPaste){
                finalPaste = pastedCode;
            } else {
                finalPaste = pastedPlainText;
            }
            if(settings.allowRichPaste){
                finalPaste = '<rich-paste>'+finalPaste+'</rich-paste> \n';
            }
            pasteHtmlAtCaret(finalPaste);
        }
    }
}, false);
// ----------------------------------------------------------------------------------
// End of Clipboard paste handler
// ----------------------------------------------------------------------------------


// -------------------------------------------------------------------------------------
// Initialize
// -------------------------------------------------------------------------------------
function havoc(){
    wind.width = $(window).width();
    wind.height = $(window).height();

    if(settings.sidebar){
        var sbContainer = 'body';
        var sbWrapper = npel.sidebar.replace('.', '');
        var defaultFrameWidth = 600;
        var opn = false;


        $(sbContainer).append('<div class="'+sbWrapper+' custom-buttons"></div>');
        $(sbContainer).append('<iframe class="'+sbWrapper+'-iframe sidebar" src="" allowtransparency="true"></iframe>');

        sidebar.forEach(function(item){
            $('.'+sbWrapper).append('<div class="icon item" data-width="'+item.width+'" data-href="'+item.url+'">'+item.icon+'<i class="fa fa-close dpn" aria-hidden="true"></i></div>');
        });
        
        $('.'+sbWrapper+'-iframe').css({
            'top': $('.'+sbWrapper).height()+'px'
        });
        $('.'+sbWrapper).find('.item').click(function(){
            toggleIcon($(this).find('.fa'));
            if(opn==false){
                $('.'+sbWrapper+'-iframe').css({
                    'top': $('.'+sbWrapper).height()+'px',
                    'left': -Math.abs($(this).data('width'))+'px',
                    'width': $(this).data('width')+'px'
                });
                $('.'+sbWrapper+'-iframe').attr('src', $(this).data('href'));
                var that = $(this);
                setTimeout(function(){
                    $('.'+sbWrapper+'-iframe').animate({'left': 0}, 300);
                    that.addClass('open');
                    opn = true;
                }, 500);
            } else {
                if($(this).hasClass('open')){
                    $('.'+sbWrapper+'-iframe').animate({'left': -Math.abs($(this).data('width'))+'px' }, 300, function(){
                        $('.'+sbWrapper+-'iframe').attr('src', '');
                    });
                    opn = false;
                } else {
                    $('.'+sbWrapper).find('.item').removeClass('open');
                    $('.'+sbWrapper+'-iframe').attr('src', $(this).data('href'));
                    $(this).addClass('open');
                }
            }
        });
    }

    // Board
    $(npel.container).css({
        'width': board.width+'px',
        'height': board.height+'px'
    });
    $(npel.board).css({
        'width': board.width+'px',
        'height': board.height+'px',
        'top': pTop,
        'left': pLeft
    }).mouseover(function(){
        changeCursor(this, 'arrows-alt', '#088');
    });
    $(npel.board).mousemove(function(event) {
        if(zoomed == true){
            xo = event.pageX;
            yo = event.pageY;
            x = xo/wind.width * $(npel.board).width();
            y = yo/wind.height * $(npel.board).height();
        } else {
            x = event.pageX;
            y = event.pageY;
        }
    });
    resetUX(npel.board);

    // Old notes
    $.ajax({
        type: 'POST',
        url: '.',
        data: {
            'action': 'list_notes'
        },
        fail: function(resp){
            console.log('Failed to retrieve notes', resp);
        },
        success: function(resp){
            $(npel.old).append(resp);
            $(npel.note).each(function(){
                ironNoteContent($(this));
            });
            $(npel.old).removeClass('hidden');
            resetUX(npel.note);
        }
    });
    $(npel.new).mouseover(function(){
        changeCursor(this, 'arrows');
    });
    resetUX(npel.new);

    // Save
    $(npel.savebtn).click(function(e){
        e.stopPropagation();
        nParent = $(this).parents('.noted');
        save_note(nParent);
        $(npel.disabler).addClass('dpn');
        bindKeyboard();
        newNoteResized = false;
    });
    $(npel.disabler).click(function(){
        if(!shifted){
            $(npel.disabler).addClass('dpn');
            $(npel.new).addClass('dpn');
            newVisible = false;
            bindKeyboard();
        }
        if(editing){
            disableEdit($(npel.edit));
        }
    });
    // Settings
    $(npel.settingsIcon).click(function(){
        if(!settingsVisible){
            openSettings();
        } else {
            closeSettings();
        }
    });

    // Dropdowns
    $(npel.settings).find('.dropdown').each(function(){
        createDropdown($(this));
    }).mouseleave(function(){
        $(this).find('.menu').slideUp(settings.speed/2);
    });
    // Dropdown: background image
    $(npel.settings).find('.boardbg .menu .item').click(function(){
        // var txt = $(this).html();
        var newBg = 'settings/backgrounds/'+$(this).data('val');
        $(npel.board).find('.bg').css({
            'background': 'url('+newBg+')'
        });
    });
    // Dropdown: font
    $(npel.settings).find('.font .menu .item').click(function(){
        $(npel.settings).find('.font .menu .item').each(function(){
            $(npel.board).removeClass($(this).data('val'));
        });
        $(npel.board).addClass($(this).data('val'));
    });
    // Dropdown: end sessions
    $(npel.settings).find('.dropdown.sessions .menu .item').unbind('click');
    if($(npel.settings).find('.dropdown.sessions .menu .old.item').length < 2){
        $(npel.settings).find('.dropdown.sessions .subtitle').hide();
    }
    $(npel.settings).find('.dropdown.sessions .menu .item').click(function(e){
        e.stopPropagation();
        var logoutId = $(this).data('val');
        $.ajax({
            type: 'POST',
            url: '.',
            data: {
                'action': 'logout',
                'id': logoutId
            },
            fail: function(resp){
                console.log('Failed to end session', resp);
            },
            success: function(resp){
                if(resp=='logout'){
                    location.reload();
                }
                if(resp=='update'){
                    $(npel.settings).find('.sessions .menu .old.item').each(function(){
                        if($(this).data('val') == logoutId){
                            $(this).remove();
                            if($(npel.settings).find('.dropdown.sessions .menu .old.item').length < 2){
                                $(npel.settings).find('.dropdown.sessions .subtitle').hide();
                            }
                        }
                    });
                }
            }
        });
    });
    // Button: overview
    $(npel.settings).find('.overview').click(function(){
        if(zoomed==false){
            zoomOut();
        } else {
            zoomIn(originalTop, originalLeft);
        }
        $(this).find('.fa').toggleClass('dpn');
    });
    // Button: see through
    $('button.transparency').mousedown(function(){
        $(npel.note).addClass('outlined');
        outlined = true;
    }).on('mouseup mouseout', function(){
        $(npel.note).removeClass('outlined');
        outlined = false;
    });
    // Button: full screen
    $('button.fullscreen').click(function(){
        if (xfull == false) {
            document.documentElement.requestFullscreen();
            setTimeout(function(){
                wind.width = $(window).width();
                wind.height = $(window).height();
            }, 500);
            xfull = true;
        } else {
            document.exitFullscreen();
            xfull = false;
        }
        $(this).find('.fa').toggleClass('dpn');
    });
    // Recycle bin
    $(npel.settings).find('.bin').click(function(){
        if(binVisible==false){
            $.ajax({
                type: 'POST',
                url: '.',
                data: {
                    'action': 'list_notes',
                    'list': 'bin'
                },
                fail: function(resp){
                    console.log('Failed to retrieve recycle bin.', resp);
                },
                success: function(resp){
                    $(npel.bin).find('.bin-content').html(resp);
                    $(npel.bin).find('.note').each(function(){
                        $(this).attr('style', '');
                        $(this).append('<button class="restore"><i class="fa fa-undo"></i></button>');
                        $(this).append('<button class="perma-delete"><i class="fa fa-trash"></i></button>');
                    });
                    $(npel.bin).animate({
                        'right': 0
                    }, settings.speed);
                    $(npel.bin).find('button.perma-delete').click(function(){
                        $.ajax({
                            type: 'POST',
                            url: '.',
                            data: {
                                'action': 'permadelete',
                                'id': $(this).parents('.noted').attr('id')
                            },
                            fail: function(resp){
                                console.log('Failed to perma-delete note:', resp);
                            },
                            success: function(resp){
                                $('#'+resp).slideUp(settings.speed, function(){
                                    $(this).remove();
                                });
                            }
                        });
                    });
                    $(npel.bin).find('button.restore').click(function(){
                        $.ajax({
                            type: 'POST',
                            url: '.',
                            data: {
                                'action': 'restore',
                                'id': $(this).parents('.noted').attr('id')
                            },
                            fail: function(resp){
                                console.log('Failed to restore note:', resp);
                            },
                            success: function(resp){
                                $('#'+resp).slideUp(settings.speed, function(){
                                    $(this).remove();
                                });
                            }
                        });
                    });
                }
            });
            binVisible = true;
        } else {
            $(npel.bin).animate({
                'right': '-360px'
            }, settings.speed);
            binVisible = false;
        }
    });
    // Sliders
    if(settings.sliders){
        $('.slider.size').slider({
            min: 10, value: $.cookie(npcookie.bgsize), max: 50,
            slide: function( event, ui ) {
                $(npel.board).find('.bg').css('background-size', ui.value+'%');
            }
        });
        $('.slider.hue').slider({
            min: 0, value: $.cookie(npcookie.bghue), max: 360,
            slide: function( event, ui ) {
                $(npel.board).find('.bg').css('filter', 'saturate('+$.cookie(npcookie.bgsat)+'%) hue-rotate('+ui.value+'deg)');
            }
        });
        $('.slider.saturation').slider({
            min: 0, value: $.cookie(npcookie.bgsat), max: 200,
            slide: function( event, ui ) {
                $(npel.board).find('.bg').css('filter', 'saturate('+ui.value+'%) hue-rotate('+$.cookie(npcookie.bghue)+'deg)');
            }
        });
        $(npel.settings).find('.sliders').removeClass('dpn');
    }

    $('textarea, input').click(function(){
        $(this).focus();
    });
    if($.cookie(npcookie.state) && $.cookie(npcookie.state) == 'start-overview'){
        zoomOut(true);
    }
    bindKeyboard();
}
// -------------------------------------------------------------------------------------
// End of Initialize
// -------------------------------------------------------------------------------------


// -------------------------------------------------------------------------------------
// Document ready
// -------------------------------------------------------------------------------------
$(document).ready(function(){

    // Set defaults
    if(!$.cookie(npcookie.state)){      $.cookie(npcookie.state,    'start-leftoff'); }
    if(!$.cookie(npcookie.bg)){         $.cookie(npcookie.bg,       'wood.jpg'); }
    if(!$.cookie(npcookie.position)){   $.cookie(npcookie.position, '0x0'); }
    if(!$.cookie(npcookie.defcolor)){   $.cookie(npcookie.defcolor, 'lastused'); }
    if(!$.cookie(npcookie.lastcolor)){  $.cookie(npcookie.lastcolor,'yellow'); }
    if(!$.cookie(npcookie.font)){       $.cookie(npcookie.font,     'annie-use-your-telescope'); }

    if(!$.cookie(npcookie.bghue)){      $.cookie(npcookie.bghue,    '0'); }
    if(!$.cookie(npcookie.bgsat)){      $.cookie(npcookie.bgsat,    '100'); }
    if(!$.cookie(npcookie.bgsize)){     $.cookie(npcookie.bgsize,   '100'); }
    
    if(typeof window.orientation !== 'undefined'){

        // Mobile
        settings = {
            allowRichText: false,
            allowRichPaste: false,
            allowImagePaste: false,
            allowEmbed: false
        }
        $.ajax({
            type: 'POST',
            url: '.',
            data: {
                'action': 'list_notes',
            },
            fail: function(resp){
                console.log('Failed to retrieve notes.', resp);
            },
            success: function(resp){
                $(npel.mobile).find('.old').append(resp);
                $(npel.mobile).find('.note').attr('style', '');
                $(npel.mobile).removeClass('dpn');
                $(npel.settings).addClass('dpn');
                $('.top-right').addClass('dpn');

                $(npel.mobile).find('.new_mobile .checkmark').click(function(){
                    $('.new_mobile textarea').removeClass (function (index, className) {
                        return (className.match (/(^|\s)bg-\S+/g) || []).join(' ');
                    }).addClass('bg-'+$(this).data('color'));
                    $('.new_mobile').find('.color').val($(this).data('color'));
                    $.cookie(npcookie.lastcolor, $(this).data('color'));
                });

                $(npel.mobile).find('button').click(function(){
                    zDef += 1;
                    $.ajax({
                        type: 'POST',
                        url: '.',
                        data: {
                            'action': 'new_note',
                            'id': 'new_note',
                            'top': randomInt(0, 900),
                            'left': randomInt(0, 900),
                            'height': 260,
                            'width': 260,
                            'zindex': zDef,
                            'color': $(npel.mobile).find('.color').val(),
                            'content': $(npel.mobile).find('textarea').val()
                        },
                        fail: function(resp){
                            console.log('Failed to save note.', resp);
                        },
                        success: function(resp){
                            $(npel.mobile).find('textarea').val('');
                            $(npel.mobile).find('.old').prepend(resp);
                            $(npel.mobile).find('.note').attr('style', '');
                        }
                    });
                });
            }
        });
    } else {
        // Initialize Desktop board.
        havoc();
    }

    // Disable drag inflicted scrolling.
    $(document).on('scroll', function() {
        $(document).scrollLeft(0);
        $(document).scrollTop(0);
      });
});
