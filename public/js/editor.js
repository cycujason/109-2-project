/*
using module markdown-it to-markdown jquery  quill socket.io
*/
//var converter = new showdown.Converter();  //markdown preview module, preview will use
const fileUploader = document.querySelector('#file-uploader');
const Save_Interval = 2500;
var textid = document.getElementById('textid').innerText;
var user = document.getElementById('user').innerText;

var md = window.markdownit();
md.set({
  html: true
});

const socket = io();
socket.on("connect",()=>{
    console.log('in editor\'s output'+socket.id);
})

class LineNumber {
	constructor(quill, options) {
		this.quill = quill;   
		this.options = options;
		this.container = document.querySelector(options.container);
		quill.on('text-change', this.update.bind(this));
		this.update(); // Account for initial contents
	}

	update() {    
		// Clear old nodes
		while (this.container.firstChild) {
			this.container.removeChild(this.container.firstChild);
		}
    
    const lines = this.quill.getLines();
    
		// Add new nodes
		for (let i = 1; i < lines.length +1; i++) {
			const height = lines[i - 1].domNode.offsetHeight;
      
			const node = document.createElement('div');

      // showcase - empty lines
      if(lines[i - 1].domNode.innerHTML == '<br>')
      node.style.color = 'red';
      
      node.style.lineHeight = `${height}px`;
			node.innerHTML = i;
			this.container.appendChild(node);
		}
	}
}

Quill.register('modules/lineNumber', LineNumber, true);

var toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
     
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
     
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean'],                                         // remove formatting button
    ['image' , 'video', 'link']
]; //quill toolbar set

var quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        
        toolbar: {
            container: toolbarOptions,
            handlers: {
                image: imageHandler,
                video: videoHandler
            }
        },
        
        lineNumber: {
            container: '#lineNumber',
        },
    },
    placeholder:'The great start from here....!',
})//quillsets

function videoHandler() {
    var range = this.quill.getSelection();
    var value = prompt('影片連結: ');
    if(value){
        this.quill.insertText(range.index, '?[] '+value , 'user' );
    }
}//videoHandler

function imageHandler() {
    var range = this.quill.getSelection();
    document.getElementById('file-uploader').click();
    fileUploader.addEventListener("change", ev => {
        const formdata = new FormData()
        formdata.append("image", ev.target.files[0])
        fetch("https://api.imgur.com/3/image/", {
            method: "post",
            headers: {
                Authorization: "Client-ID 718b4512df0d2f5"
            },
            body: formdata
        }).then(data => data.json()).then(data => {
           this.quill.insertText(range.index, `![](${data.data.link})`, 'user' );
        })
    })
}//imageHandler


quill.disable();
quill.setText("Loading............");


function send(){
    if (socket == null || quill == null) return
    const handler = (delta, oldDelta, source) => {
        if(source !== 'user') return
        var html = quill.container.firstChild.innerHTML;
        var markdown = toMarkdown(html);
        var rendered_markdown = md.render(markdown);
        $("#preview").html(rendered_markdown);
        socket.emit("note-text", delta)
    }

    quill.on("text-change", handler)

    return () => {
        quill.off("text-change", handler)
    }
}//send

function recieve(){
    if (socket == null || quill == null) return
    const handler = delta => {
        quill.updateContents(delta)
        var html = quill.container.firstChild.innerHTML;
        var markdown = toMarkdown(html);
        var rendered_markdown = md.render(markdown);
        console.log(rendered_markdown);
        $("#preview").html(rendered_markdown);
    }
    socket.on("recieve-note", handler)

    return () => {
        socket.off("recieve-note", handler)
    }
}//recieve

function socketRoom(){
    if (socket == null || quill == null) return
    socket.once("loadin", document=>{
       quill.setContents(document);
       var html = quill.container.firstChild.innerHTML;
       var markdown = toMarkdown(html);
       var rendered_markdown = md.render(markdown);
       $("#preview").html(rendered_markdown);
       quill.enable();
    });
    socket.emit("getdoc",textid,user);
}//SocketRoom

function saveContent(){
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents(), quill.getText(0,quill.getLength()) , 
      user, getTitle());
    }, Save_Interval)

    return () => {
      clearInterval(interval)
    }
}//saveContent


function getTitle(){
    if (socket == null || quill == null) return

    const title = document.getElementsByTagName('h1')[0].innerText;
    if(title === undefined){
        return 'Untitled';
    }//if
    else{
        return title;
    }//else

}//getTitle


send();
recieve();
socketRoom();
saveContent();