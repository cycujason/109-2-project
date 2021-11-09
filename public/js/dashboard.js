

const socket = io();
socket.on("connect",()=>{
    console.log('in dashboard\'s output');
})

function createClass(){
    let name = prompt("請輸入新分類");
    let user = document.getElementById("username").innerText;
    if (name == null || name == "") {
      text = "請輸入合格分類名";
      document.getElementById("demo").innerHTML = text;
    } else {
      socket.emit("classification",name,user);
    }
}//createclass

function addcard(classify){
  var link = "/users/dashboard/"+classify;
  var user = document.getElementById("username").innerText;
  return "<div class=\"overview-card-2\" onclick=\"location.href='"+link+"';\">"+classify+
   "<button id=\"delete\" type=\"button\" onclick=\"event.stopPropagation();deleteClass('"+classify+"','"+user+"');\" ><img src=\"/images/trash-solid-24.png\"></button> </div>";
}//addcard


socket.on("newClassDone",(signal,name)=>{
  if(signal == true){
    text = "成功創建"+name+"分類" ;
    origin = document.getElementById("showarea").innerHTML;
    document.getElementById("showarea").innerHTML = origin + addcard(name);
    document.getElementById("demo").innerHTML = text; 
  }//if
  else{
    text = name+"分類已存在" ;
    document.getElementById("demo").innerHTML = text;
  }//else
})

socket.on("deleteClassDone",(signal,name)=>{
  if(signal == true){
    text = "成功刪除"+name+"分類" ;
    document.getElementById("demo").innerHTML = text;
    location.reload();
  }//if
  else{
    text = "刪除失敗，請重試一次" ;
    document.getElementById("demo").innerHTML = text;
  }//else
})

function deleteClass(id,user){
  var checkdel = confirm('你確定要刪除'+id+'分類嗎?這會刪除所有屬於此分類的筆記和此分類本身');
  if(checkdel){
    socket.emit("deleteClass",id,user,false);
  }//if checkdel
}//deleteuser




