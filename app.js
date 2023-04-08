console.log('%cApp.js loaded', 'color: lime; font-weight: bold;');

const boldBtn = document.getElementById('bold');
const italicBtn = document.getElementById('italic');
const underlineBtn = document.getElementById('underline');
const strikeBtn = document.getElementById('strike');
const subscriptBtn = document.getElementById('subscript');
const superscriptBtn = document.getElementById('superscript');
const fontsizeSelect = document.getElementById('fontsize');
const fontfamilySelect = document.getElementById('fontfamily');
const editor = document.getElementById('editor');
const download = document.getElementById('download');
const save = document.getElementById('save');
const openfile = document.getElementById('open');
const close = document.getElementById('close');

let openedfile = '';

boldBtn.addEventListener('click', function() {
	document.execCommand('bold', false, null);
});

italicBtn.addEventListener('click', function() {
	document.execCommand('italic', false, null);
});

underlineBtn.addEventListener('click', function() {
	document.execCommand('underline', false, null);
});

strikeBtn.addEventListener('click', function() {
    document.execCommand('strikeThrough', false, null);
});

subscriptBtn.addEventListener('click', function() {
    document.execCommand('subscript', false, null);
});

superscriptBtn.addEventListener('click', function() {
    document.execCommand('superscript', false, null);
});

fontsizeSelect.addEventListener('change', function() {
    const size = this.value;
    document.execCommand('fontSize', false, '7');
    const selection = window.getSelection();
    if (selection.focusNode.nodeName === '#text') {
      const span = document.createElement('span');
      span.style.fontSize = size;
      const range = selection.getRangeAt(0);
      range.surroundContents(span);
    }
    console.log(`Font size changed to ${size}`);
});
  
  
fontfamilySelect.addEventListener('change', function() {
	document.execCommand('fontname', false, this.value);
});

close.addEventListener('click', function() {
    //close the file
    editor.innerHTML = '';
    openedfile = '';
    localStorage.removeItem('openedfile');
});

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
window.requestFileSystem(window.PERSISTENT, 1024*1024, function(fs) {
    console.log('Opened file system: ' + fs.name);
    if (localStorage.getItem('openedfile')) {
        openedfile = localStorage.getItem('openedfile');
        console.log('Opening last unsaved file: ' + openedfile);
        fs.root.getFile(openedfile, {}, function(fileEntry) {
            fileEntry.file(function(file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    editor.innerHTML = e.target.result;
                };
                reader.readAsText(file);
            }, errorHandler);
        }, errorHandler);
    }
}, errorHandler);

function errorHandler(e) {
    console.log('Error: ' + e);
}

openfile.addEventListener('change', function() {
    const file = this.files[0];
    openedfile = file.name;
    localStorage.setItem('openedfile', openedfile);
    const reader = new FileReader();
    reader.onload = function(e) {
        editor.innerHTML = e.target.result;
    };
    reader.readAsText(file);
});

save.addEventListener('click', function() {
    //save
    const text = editor.innerHTML;
    //save the text
    const filename = openedfile || 'Document.ptb';
    localStorage.setItem('openedfile', filename);
    //use the File System API to save the file
    window.requestFileSystem(window.PERSISTENT, 1024*1024, function(fs) {
        fs.root.getFile(filename, {create: true}, function(fileEntry) {
            //clear the file
            fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function(e) {
                    console.log('File cleared');
                };
                fileWriter.truncate(0);
            }, errorHandler);
            //write the file
            fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function(e) {
                    console.log('File saved');
                };
                fileWriter.onerror = function(e) {
                    console.log('Error: ' + e.toString());
                };
                const blob = new Blob([text], {type: 'text/plain'});
                fileWriter.write(blob);
            }, errorHandler);
        }, errorHandler);
    }, errorHandler);

});

download.addEventListener('click', function() {
    //download
    const text = editor.innerHTML;
    //download the text
    const filename = openedfile;
    const blob = new Blob([text], {type: 'text/plain'});
    saveAs(blob, filename);
});

function saveAs(blob, filename) {
    const link = document.createElement('a');
    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

//on ctrl+s
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        save.click();
    }
});