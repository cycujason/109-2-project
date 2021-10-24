/*var img = document.getElementsByTagName('img')
                
    // 顯示 2
    alert(img.length);
    console.log(img.length);
*/
// 用 createElement 增加一個 DOM 節點
var link = document.createElement('img');
// 先用 JS 寫好要增加的內容
link.textContent = '1234';
// 動態掛一個 class 屬性
link.setAttribute('src','https://i.imgur.com/4fMp4ft.jpg');
// 用 appendChild() 把上面寫好的子節點掛在既有的 h1 下面，新增的內容會依序排列在後面，不會被洗掉
//document.querySelector('.title').appendChild(link);
var img = document.getElementsByTagName('img');
console.log(img.length);

//console.log(document.getElementById('preview').nextSibling.p.src)

//console.log(document.getElementById('preview').parentNode)
console.log(document.getElementById('preview').lastChild)
//document.querySelector('.navbar-brand').appendChild(link);
console.log(img.src);

function openwin(){
    console.log("yes")
    window.open("/users/pict_editor",
    "WindowName","width=1500,height=800,top=90,left=90,right=90,bottom=90" )
}



