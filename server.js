
var app = require('./app');
var debug = require('debug')('TESTING-PROJECT-FUCK:server');
var http = require('http');
var socketIO = require('socket.io')  // socket.io server
var { pool } = require('../config');
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
 io.on("connection",socket => {
   console.log("connected:"+socket.id);
   socket.on("getdoc", textid=>{
     const data = "";
     socket.join(textid);
     socket.emit("loadin",data);
     socket.on("note-text",(editorData)=>{
      socket.broadcast.to(textid).emit("recieve-note", editorData);
      console.log(editorData);
      console.log("send :"+socket.id);
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


  async function findDocumentOrCreate(id){
    if(id == null)return

  }