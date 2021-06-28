var canvas = document.getElementById('layer_draw');
var cvs = canvas.getContext('2d');
var ctx = document.getElementById('layer_pict').getContext('2d');
var drawing =false;
var img = new Image();
var str_link = 'https://cdn.discordapp.com/attachments/791521808985358367/848939833762381934/Screenshot_20210524-182109928_1.jpg'
img.src = str_link ;

var img_width = img.width;
var img_height = img.height;

document.getElementById( 'layer_pict' ).width = img_width;
document.getElementById( 'layer_pict' ).height = img_height;
document.getElementById( 'layer_draw' ).width = img_width;
document.getElementById( 'layer_draw' ).height = img_height;

// console.log(img_width,img_height);

img.onload = function(){     // 載入圖片
   ctx.drawImage(img,0,0);
};


document.getElementById('0').style.display = "none";
document.getElementById('10').style.display = "none";
document.getElementById('20').style.display = "none";
document.getElementById('30').style.display = "none";
document.getElementById('40').style.display = "none";


function checkpen(width){ //設置筆的粗細
	cvs.lineWidth = width;
}

function changecolor(pencolor){ //設置顏色
	cvs.strokeStyle =pencolor;
}

function mode(Operation){    // 選畫筆or橡皮擦
  cvs.globalCompositeOperation = Operation ;
}

var count = 0 ;
function DisplayAndHiddenBtn() {
    var currentBtn1 = document.getElementById('0');
    var currentBtn2 = document.getElementById('10');
    var currentBtn3 = document.getElementById('20');
    var currentBtn4 = document.getElementById('30');
    var currentBtn5 = document.getElementById('40');
    count = count + 1 ;
    if (count%2 == 1) {
        currentBtn1.style.display = "block"; 
        currentBtn2.style.display = "block";
        currentBtn3.style.display = "block"; 
        currentBtn4.style.display = "block"; 
        currentBtn5.style.display = "block"; 
    }
    else if (count%2 == 0) {
        currentBtn1.style.display = "none";
        currentBtn2.style.display = "none";
        currentBtn3.style.display = "none";
        currentBtn4.style.display = "none";
        currentBtn5.style.display = "none";
    }
}



function clearb (){  //清除畫布功能

    cvs.clearRect(0,0,img_width,img_height);

}

//保存圖片

window.onload = function(){

  var penWeight = 0; //畫筆粗細

  var penColor = ''; //畫筆顏色

  function getBoundingClientRect(x,y){

    var box = canvas.getBoundingClientRect(); //獲取canvas的距離瀏覽器視窗的上下左右距離

    return {x:x-box.left,

    y:y-box.top

    }

  }

  canvas.onmousedown = function(e){

    /*找到滑鼠（畫筆）的坐標*/
    var first = getBoundingClientRect(e.clientX,e.clientY);


    cvs.beginPath(); //開始本次繪畫
    cvs.moveTo(first.x,first.y);  //畫筆起始點

    /*設置畫筆屬性*/

    cvs.lineCap = 'round';

    cvs.lineJoin ="round";
    penColor = document.getElementById("colorful") ; //畫筆顏色

    cvs.strokeStyle = penColor.value ; 

    cvs.lineWidth = penWeight; //畫筆粗細

    canvas.onmousemove = function(e){

      /*找到滑鼠（畫筆）的坐標*/
      var first = getBoundingClientRect(e.clientX,e.clientY);

      cvs.lineTo(first.x,first.y); //根據滑鼠路徑繪畫

      cvs.stroke(); //立即渲染

    }

    canvas.onmouseup = function(e){

      cvs.closePath(); //結束本次繪畫

      canvas.onmousemove = null;

      canvas.onmouseup = null;

    }

    canvas.onmouseleave = function(){

      cvs.closePath();

      canvas.onmousemove = null;

      canvas.onmouseup = null;

    }

  }

  var dlButton = document.getElementById("downloadImageBtn");

  bindButtonEvent(dlButton,"click",saveAsLocalImage)

}

function bindButtonEvent(element, type, handler){

  if(element.addEventListener) {

    element.addEventListener(type, handler, false);

  } else {

    element.attachEvent('on'+type, handler);

  }

}

function saveAsLocalImage () {

  var myCanvas = document.getElementById("canvas");

  var image = myCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

  window.location.href=image;

}
