let { PythonShell } = require('python-shell');
var app = require('./app');
var debug = require('debug')('TESTING-PROJECT-FUCK:server');
var http = require('http');
var socketIO = require('socket.io')  // socket.io server
var { pool } = require('./config');
require('dotenv').config();

/**
 * Get port from environment and store in Express.
 */

 var port = normalizePort(process.env.PORT || '3000');
 app.set('port', port);
 
 /**
  * Create HTTP server.
  */
 
 var server = http.createServer(app);
/**
 * socket io config and setup
 */

 const io  =socketIO(server);
 //io.adapter(createAdapter(pool));
 io.on("connection",socket => {
   console.log("connected:"+socket.id);
   socket.on("getdoc", async (textid,user,multiuser, group_name)=>{
     const data = await findDocumentOrCreate(textid,user,multiuser, group_name);
     socket.join(textid);
     socket.emit("loadin",data);
     socket.on("note-text",(editorData)=>{
      socket.broadcast.to(textid).emit("recieve-note", editorData);
      console.log(editorData);
    });
    socket.on("save-document", async (data,text,user,title,tags) => {
      if(typeof tags === 'undefined'){
        await pool.query(`UPDATE note_content 
        SET note_paragraph= $1, note_delta_content= $2 , update_at= $3 , update_user=$4, note_title= $6
        WHERE note_id=$5`,[text,data,new Date(Date.now()),user,textid,title]);
      }//if //if user have not set the tags imformation
      else{
        await pool.query(`UPDATE note_content 
        SET note_paragraph= $1, note_delta_content= $2 , update_at= $3 , update_user=$4, note_title= $6, user_tags = $7
        WHERE note_id=$5`,[text,data,new Date(Date.now()),user,textid,title,tags]);
      }//else user have set user own tags imformation
    });
    socket.on("Tagscompute", async (text, id) => {
       TagsAnalyse(text,id);
    });
   });
 });
 

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


function normalizePort(val) {
    var port = parseInt(val, 10);
  
    if (isNaN(port)) {
      // named pipe
      return val;
    }
  
    if (port >= 0) {
      // port number
      return port;
    }
  
    return false;
  }
  
  /**
   * Event listener for HTTP server "error" event.
   */
  
  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
  
    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;
  
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
  
  /**
   * Event listener for HTTP server "listening" event.
   */
  
  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    debug('Listening on ' + bind);
  }


  async function findDocumentOrCreate(id,user,multiuser, group_name){
    if(id == null)return
    const {rows} = await pool.query(`SELECT note_delta_content,create_user FROM note_content
    WHERE note_id = $1`,[id]);
    var multi = false;
    if(multiuser == 'true')
      multi = true;
    const data_num= rows.length;
    if(data_num > 0  ) { // && rows[0].create_user == user
        return rows[0].note_delta_content;
    }//if
    else{
      if(multiuser == false){
        await pool.query( `INSERT INTO note_content (note_id,multi_user,created_at,update_at,create_user,note_title)
        VALUES ($1, $2, $3, $4, $5, $6)`,[id,multi,new Date(Date.now()),new Date(Date.now()),user,'Untitled'])
        return "";
      }//if
      else{
        await pool.query( `INSERT INTO note_content (note_id,multi_user,created_at,update_at,create_user,note_title,group_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,[id,multi,new Date(Date.now()),new Date(Date.now()),user,'Untitled',group_name])
        return "";
      }//else
    }//else
  }


  function TagsAnalyse(textContent,id) {           //分析tags的server端呼叫程式
   
    //pool.query(`SELECT note_paragraph FROM note_content WHERE note_id=$1`,[id],(err,result)=>{
     //var textContent = result.rows[0].note_paragraph;
     let options = {
      mode:'text',
      encoding:'utf-8',
      pythonPath:'C:\\Users\\kikoflame\\anaconda3\\envs\\grad_project\\python.exe', // if heroku then this config no need to set
      args:
        [
          textContent,
        ]
      }
    
      PythonShell.run('./public/py/wordAnalysis.py', options, (err, data) => {
        if (err) return//res.send(err)
        const parsedString = JSON.parse(data);
        var objArray = [];
        var count = Object.keys(parsedString).length;
        for(var k =0;k<count;k++){
          objArray.push(Object.values(parsedString)[k]);
        }//for
        //console.log(`first: ${parsedString.key1}, second: ${parsedString.key2}, third: ${parsedString.key3}, fourth: ${parsedString.key4}, fifth: ${parsedString.key5}`)
        console.log(objArray);
        console.log("finish Tag compute");
        pool.query(`UPDATE note_content SET tags= $1  WHERE note_id=$2`,[objArray,id]);
      })
    //})
    
  
  }//pythonprocess

  

