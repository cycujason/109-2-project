const socket = io();
socket.on("connect",()=>{
    console.log('in dashboard\'s output');
})

function createClass(){
    let name = prompt("請輸入新分類");
    let id = parseInt(document.getElementById("ID").innerText,10);
    if (name == null || name == "") {
      text = "請輸入合格分類名";
      document.getElementById("demo").innerHTML = text;
    } else {
      socket.emit("classification",name,id);
    }
}//createclass

function addcard(classify){
  return "<div class=\"overview-card-2\">"+classify+"</div>";
}//addcard


socket.on("newClassDone",(signal,name)=>{
  if(signal == true){
    text = "成功創建"+name+"分類" ;
    origin = document.getElementById("showarea").innerHTML;
    document.getElementById("showarea").innerHTML = origin + addcard(name);
    document.getElementById("demo").innerHTML = text; 
  }//if
  else{
    text = "創建分類失敗" ;
    document.getElementById("demo").innerHTML = text;
  }//else
})




