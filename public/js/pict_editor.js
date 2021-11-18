


var canvas = document.getElementById('layer_draw');
var cvs = canvas.getContext('2d');
var ctx = document.getElementById('layer_pict').getContext('2d');
var drawing = false;
//var img = new Image();
var str_link = ''



// console.log(img_width,img_height);



function myGeeks() {
  var img = new Image();
  let str_link = document.getElementById("input_url").value;
//let str_link = "https://i.imgur.com/4fMp4ft.jpg";

  downloadedImg = new Image();
  downloadedImg.crossOrigin = "Anonymous";
  downloadedImg.addEventListener("load", imageReceived, false);
  downloadedImg.src = str_link;
  console.log(downloadedImg.src);
  console.log(downloadedImg.width);

}


function imageReceived() {
  let canvas = document.getElementById("layer_pict");
  let canvas2 = document.getElementById("layer_draw");
  let context = canvas.getContext("2d");

  canvas.width = downloadedImg.width;
  canvas.height = downloadedImg.height;
  canvas2.width = downloadedImg.width;
  canvas2.height = downloadedImg.height;

  context.drawImage(downloadedImg, 0, 0);

  document.getElementById('input_url').style.display = "none";
  document.getElementById('send_button').style.display = "none";

  document.getElementById('downloadImageBtn').style.display = "block";
  document.getElementById('save').style.display = "block";
  document.getElementById('ok2').style.display = "block";
  document.getElementById('download').style.display = "block";
  //imageBox.appendChild(canvas);

  /*try {
  console.log("jj");
    localStorage.setItem("saved-image-example", canvas.toDataURL("image/png"));
    var uy=canvas.toDataURL("image/png");
    console.log(uy);
    window.location.href = uy;
  }
  catch(err) {
    console.log("Error: " + err);
  }*/
}

document.getElementById('downloadImageBtn').style.display = "none";
document.getElementById('save').style.display = "none";
//document.getElementById('downloadimg').style.display = "none";
document.getElementById('ok2').style.display = "none";

document.getElementById('0').style.display = "none";
document.getElementById('10').style.display = "none";
document.getElementById('20').style.display = "none";
document.getElementById('30').style.display = "none";
document.getElementById('40').style.display = "none";


function checkpen(width) { //設置筆的粗細
  cvs.lineWidth = width;
}

function changecolor(pencolor) { //設置顏色
  cvs.strokeStyle = pencolor;
}

function mode(Operation) { // 選畫筆or橡皮擦
  cvs.globalCompositeOperation = Operation;
}

var count = 0;

function DisplayAndHiddenBtn() {
  var currentBtn1 = document.getElementById('0');
  var currentBtn2 = document.getElementById('10');
  var currentBtn3 = document.getElementById('20');
  var currentBtn4 = document.getElementById('30');
  var currentBtn5 = document.getElementById('40');
  count = count + 1;
  if (count % 2 == 1) {
    currentBtn1.style.display = "block";
    currentBtn2.style.display = "block";
    currentBtn3.style.display = "block";
    currentBtn4.style.display = "block";
    currentBtn5.style.display = "block";
  } else if (count % 2 == 0) {
    currentBtn1.style.display = "none";
    currentBtn2.style.display = "none";
    currentBtn3.style.display = "none";
    currentBtn4.style.display = "none";
    currentBtn5.style.display = "none";
  }
}



function clearb() { //清除畫布功能

  cvs.clearRect(0, 0, document.getElementById('layer_pict').width, document.getElementById('layer_pict').height);

}

//保存圖片

window.onload = function() {

  var penWeight = 0; //畫筆粗細

  var penColor = ''; //畫筆顏色

  function getBoundingClientRect(x, y) {

    var box = canvas.getBoundingClientRect(); //獲取canvas的距離瀏覽器視窗的上下左右距離

    return {
      x: x - box.left,

      y: y - box.top

    }

  }

  canvas.onmousedown = function(e) {

    /*找到滑鼠（畫筆）的坐標*/
    var first = getBoundingClientRect(e.clientX, e.clientY);


    cvs.beginPath(); //開始本次繪畫
    cvs.moveTo(first.x, first.y); //畫筆起始點

    /*設置畫筆屬性*/

    cvs.lineCap = 'round';

    cvs.lineJoin = "round";

    penColor = document.getElementById("colorful"); //畫筆顏色
    cvs.strokeStyle = penColor.value;

    cvs.lineWidth = penWeight; //畫筆粗細

    canvas.onmousemove = function(e) {

      /*找到滑鼠（畫筆）的坐標*/
      var first = getBoundingClientRect(e.clientX, e.clientY);

      cvs.lineTo(first.x, first.y); //根據滑鼠路徑繪畫

      cvs.stroke(); //立即渲染

    }

    canvas.onmouseup = function(e) {

      cvs.closePath(); //結束本次繪畫

      canvas.onmousemove = null;

      canvas.onmouseup = null;

    }

    canvas.onmouseleave = function() {

      cvs.closePath();

      canvas.onmousemove = null;

      canvas.onmouseup = null;

    }

  }

  var dlButton = document.getElementById("downloadImageBtn");

  bindButtonEvent(dlButton, "click", saveAsLocalImage)

}

function bindButtonEvent(element, type, handler) {

  if (element.addEventListener) {

    element.addEventListener(type, handler, false);

  } else {

    element.attachEvent('on' + type, handler);

  }

}

function saveAsLocalImage() {
  let canvas = document.getElementById("layer_pict");
  var url  = document.getElementById("url");
  
  try {
    var data_url=canvas.toDataURL("image/png");
    console.log(data_url);
    url.innerText = data_url ;
  }
  catch(err) {
    console.log("Error: " + err);
  }

}

function save() {

  var myCanvas = document.getElementById("layer_draw");

  // causes new drawings to be drawn behind existing drawings 
  ctx.globalCompositeOperation='source-over'; 

  // draw the img to the canvas (behind existing lines) 
  ctx.drawImage(myCanvas,0,0); 
  ctx.save();
}

function back() {
  ctx.restore();


}

function imageHandler3() {

 console.log("restore"); 
cvs.restore();

}