/*
using module markdown-it to-markdown jquery  quill socket.io
*/
//var converter = new showdown.Converter();  //markdown preview module, preview will use
const fileUploader = document.querySelector('#file-uploader');
const Save_Interval = 2500;
var textid = document.getElementById('textid').innerText;
var user = document.getElementById('user').innerText;
var multiuser = document.getElementById('multi').innerText;
var Uclass = document.getElementById('Uclass').innerText;
var group_name = null;

document.getElementById("paste_url_button").style.display = "none";  // 進入筆記先隱藏
document.getElementById("paste_instr").style.display = "none";

if(multiuser === 'true'){
  group_name = document.getElementById('group_name').innerText;
}//if

if(multiuser === 'true'){
    group_name = document.getElementById('group_name').innerText;
}//if

var md = window.markdownit();
md.set({
  html: true
});

const socket = io();
socket.on("connect",()=>{
    console.log('in editor\'s output'+socket.id);
})

class LineNumber {                      // 行數顯示code
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
     
    [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],               // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    //[{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    //[{ 'direction': 'rtl' }],                         // text direction

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    //[{ 'font': [] }],
    [{ 'align': [] }],

    //['clean'],                                         // remove formatting button
    ['image' , 'link']                          // 我把'video'移除
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
        this.quill.insertText(range.index, '?[] '+value , 'user' ); // 插入影片連結 
    }
}//videoHandler

function imageHandler() {
    var range = this.quill.getSelection();
    document.getElementById('file-uploader').click();
    fileUploader.addEventListener("change", ev => {
        const formdata = new FormData()
        formdata.append("image", ev.target.files[0]) // 上傳圖片資料
        fetch("https://api.imgur.com/3/image/", {
            method: "post",
            headers: {
                Authorization: "Client-ID abbb71f0b656d3c"
            },
            body: formdata
        }).then(data => data.json()).then(data => {
           this.quill.insertText(range.index, `![](${data.data.link})`, 'user' );  // 插入圖片連結回編輯器
        })
    })
}//imageHandler

function openwin(){
    var range = this.quill.getSelection();
    var r_i = range.index ;  // 存油標位置
    document.getElementById("range_store").innerText = r_i ;
    //window.open("/users/pict_editor",
    //"WindowName","width=750,height=400,top=90,left=90,right=90,bottom=90" )
}

function imageHandler2() {   // 圖像編輯後 上傳到imgur

    //var testurl= "" ;
    //opener.document.getElementById("paste_url").innerText = testurl ;

                    
    console.log("imageHandler2");
    var url  = document.getElementById("url");
    var str = url.innerText;
    str = str.slice(22);
    console.log(str);
    const formdata = new FormData()
    formdata.append("image", str)
    fetch("https://api.imgur.com/3/image/", {
        method: "post",
        headers: {
            Authorization: "Client-ID 718b4512df0d2f5"
        },
        body: formdata
    }).then(data => data.json()).then(data => {
        //this.quill.insertText(content,`![](${data.data.link})`, 'user' );
        console.log(data.data.link);
        document.getElementById("url_new").innerText = '請回去筆記頁，在左方游標點選圖片要貼回的位置\n並按貼上按紐' ;
        opener.document.getElementById("paste_url").innerText = '![]('+ data.data.link +')' ;
        opener.document.getElementById("paste_url").style.display = "none";
        opener.document.getElementById("paste_url_button").style.display = "block";
        opener.document.getElementById("paste_instr").innerText = "游標點選圖片要加到哪個位置" ;
        opener.document.getElementById("paste_instr").style.display = "block";
        //alert(`'![](${data.data.link})`);
    })
    
    //alert('請貼回筆記頁\n'+'![]('+ data.data.link +')');
    //window.close();
}//imageHandler

function paste(){
    var range = this.quill.getSelection();
    console.log(range) ;

    var input = document.getElementById("paste_url").innerText ;

    var s = false ;
    
    try {
        this.quill.insertText(range.index, input, 'user' );
        console.log(range.index) ;
        document.getElementById("paste_url").innerText = "" ;
        document.getElementById("paste_url_button").style.display = "none";
        document.getElementById("paste_instr").innerText = "新圖片已加到筆記" ;
    }
    catch(err) {
        alert("請游標點選要貼入的位置") ;
        console.log("Error: " + err);
    }
            
        


    



    

    
}

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
        socket.emit("note-text", delta)               // 船同步資訊給server
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
        $("#preview").html(rendered_markdown);
    }
    socket.on("recieve-note", handler)             // 接收同步資並更新編輯器

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
       quill.enable();                                 // 起初登入畫面時載入筆記資訊和開啟使用者編輯權限
    });
    socket.emit("getdoc",textid,user,multiuser,group_name,Uclass);
}//SocketRoom

function saveContent(){
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents(), quill.getText(0,quill.getLength()) , 
      user, getTitle(),getTags());
    }, Save_Interval)

    return () => {
      clearInterval(interval)                   // 每隔Save_interval時間就將筆記資訊傳上DB做同步更新(目前是2.5秒)
    }
}//saveContent  save the content to server (json data type)

function computeTag(){
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
      socket.emit("Tagscompute", quill.getText(0,quill.getLength()) , textid);
    }, 10000)

    return () => { 
      clearInterval(interval)              // 每隔10秒將筆記傳給python分析tag資訊
    }

}//computeTag


function getTitle(){
    if (socket == null || quill == null) return

    const title = document.getElementsByTagName('h1');
    if(typeof title[0] === 'undefined'){
        return 'Untitled';
    }//if
    else{
        return title[0].innerText;          // 分析筆記的header(標題)
    }//else

}//getTitle

function getTags(){
    if (socket == null || quill == null) return

    const tags = document.getElementsByTagName('h6');
    if(typeof tags[0] === 'undefined'){
        return undefined;
    }//if
    else{
        var output = [];
        for(i=0;i<tags.length;i++){
           console.log(tags[i].innerText);
           output.push(tags[i].innerText);
        }//for
        return output;          // 分析筆記的tags 使用者自定義的標籤
    }//else

}//getTitle


send();
recieve();
socketRoom();
saveContent();
computeTag();

