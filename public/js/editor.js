/*
using module markdown-it to-markdown jquery  quill socket.io
*/
//var converter = new showdown.Converter();  //markdown preview module, preview will use
const fileUploader = document.querySelector('#file-uploader');

var textid = document.getElementById('textid').innerText;

var md = window.markdownit();
md.set({
  html: true
});

const socket = io();
socket.on("connect",()=>{
    console.log(socket.id);
})

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
];

var quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: {
            container: toolbarOptions,
            handlers: {
                image: imageHandler,
                video: videoHandler
            }
        }
    },
});

function videoHandler() {
    var range = this.quill.getSelection();
    var value = prompt('影片連結: ');
    if(value){
        this.quill.insertText(range.index, '?[] '+value , 'user' );
    }
}

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
           this.quill.insertText(range.index, '![] '+ data.data.link, 'user' );
        })
    })
};


quill.disable();
quill.setText("loading............");


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
};

function recieve(){
    if (socket == null || quill == null) return
    const handler = delta => {
        quill.updateContents(delta)
        var html = quill.container.firstChild.innerHTML;
        var markdown = toMarkdown(html);
        var rendered_markdown = md.render(markdown);
        $("#preview").html(rendered_markdown);
    }
    socket.on("recieve-note", handler)

    return () => {
        socket.off("recieve-note", handler)
    }
};

function socketRoom(){
    if (socket == null || quill == null) return
    socket.once("loadin", document=>{
       quill.setContents(document);
       quill.enable();
    });
    socket.emit("getdoc",textid);
};


send();
recieve();
socketRoom();