//editor block for standard not preview
let userIn;  //markdown preview module, preview will use
//var converter = new showdown.Converter();  markdown preview module, preview will use
const socket = io();
socket.on("connect",()=>{})

socket.on("recieve-note", editorData=>{
    setTimeout(()=>{
        userIn.setData(editorData);
        document.getElementById("preview").innerHTML = showdown(editorData);
    },150);
})


ClassicEditor
    .create( document.querySelector( '#test2' ) ,{language:'zh'})
    //for the inner data catch use , preview version will use
    .then( editor => {
        userIn = editor;
        editor.model.change( writer => {writer.setSelection( editor.model.document.getRoot(), 'end' );} );
        editor.editing.view.document.on( 'keyup', () => {
            const editorData = userIn.getData();
            document.getElementById("preview").innerHTML = showdown(editorData);
            socket.emit("note-text", editorData);
        } );
        editor.editing.view.document.on( 'paste', () => {
            setTimeout(()=>{
                const editorData = userIn.getData();
                document.getElementById("preview").innerHTML = showdown(editorData);
                socket.emit("note-text", editorData);
            },200);
        } ) ;
        editor.editing.view.document.on( 'mouseup', () => {
            setTimeout(()=>{
                const editorData = userIn.getData();
                document.getElementById("preview").innerHTML = showdown(editorData);
                socket.emit("note-text", editorData);
            },200);
        } ) ;
        console.log( editor );
    } )
    .catch( error => {
        console.error( error );
    } );


    /*  set interval method
    timer = setInterval(showText,100);

    function showText(){
    const editorData = userIn.getData();
    document.getElementById("preview").innerHTML= converter.makeHtml(editorData); 
    }
    */    

    /*   outer preview code below
    document.querySelector( '#userIn' ).addEventListener( 'input', () => {
    const editorData = userIn.getData();
    document.getElementById("preview").innerHTML= editorData; 
    })
    */
                    