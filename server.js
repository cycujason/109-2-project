
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
   socket.on("getdoc", async (textid,user)=>{
     const data = await findDocumentOrCreate(textid,user);
     socket.join(textid);
     socket.emit("loadin",data);
     socket.on("note-text",(editorData)=>{
      socket.broadcast.to(textid).emit("recieve-note", editorData);
      console.log(editorData);
    });
    socket.on("save-document", async (data,text,user,title) => {
      await pool.query(`UPDATE note_content 
      SET note_paragraph= $1, note_delta_content= $2 , update_at= $3 , update_user=$4, note_title= $6
      WHERE note_id=$5`,[text,data,new Date(Date.now()),user,textid,title]);
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


  async function findDocumentOrCreate(id,user){
    if(id == null)return
    const {rows} = await pool.query(`SELECT note_delta_content FROM note_content
    WHERE note_id = $1`,[id]);
    //console.log(rows.length);
    //console.log(rows[0]);
    const data_num= rows.length;
    if(data_num > 0 ) {
        return rows[0].note_delta_content;
    }//if
    else{
      await pool.query( `INSERT INTO note_content (note_id, multi_user,created_at,update_at,create_user,note_title)
      VALUES ($1, $2, $3, $4, $5, $6)`,[id,false,new Date(Date.now()),new Date(Date.now()),user,'Untitled'])
      return "";
    }//else


  }

  