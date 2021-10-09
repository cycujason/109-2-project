
function createClass(){
    let name = prompt("請輸入新分類");
    if (name == null || name == "") {
      text = "請輸入合格分類名";
    } else {
      text = "已創建" + name + "分類" ;
      origin = document.getElementById("showarea").innerHTML;
      document.getElementById("showarea").innerHTML = origin + addcard(name);
    }
    document.getElementById("demo").innerHTML = text;
}//createclass

function addcard(classify){
  return "<div class=\"overview-card-2\">"+classify+"</div>";
}//addcard


