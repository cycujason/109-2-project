# 老師留言
- Try to rename the repository name and add more material, such as your project goal.
- Ref to the repository at https://github.com/FelixWuYH/BSprojectICE
- 基於防疫不便到校，改以預約線上討論(週三除外)，相關資訊(如網址)或檔案可備份於倉庫或雲端資料夾，以便查閱。1/26
# 寒假進度
目前討論先更改專題方向，改以電影或影視作品的推薦，依舊以neo4j做知識庫後進行推薦

一樣照neo4j對電影資料做分析與關係建圖，建立知識庫後進行推薦，推薦的手法會用content-based


110/1/23  22:20

參考資料:

https://grouplens.org/datasets/movielens/latest/

https://codertw.com/%E7%A8%8B%E5%BC%8F%E8%AA%9E%E8%A8%80/751750/

先從網路抓資料集，嘗試建立知識庫，先對各項資料抽取屬性建圖，考慮是否需要另外爬蟲抓取其他資料，如IMDB等

先抓movielens or kaggle dataset 的資料

尋找評分方式，計量方法，推薦的用法

考慮是否增加其他視覺化統計資料

110/1/24  17:34


決定點與點關係，整理movielens的資料，用程式的辦法整理匯入資料(資料量大，先大略瀏覽資料屬性)

嘗試使用其他資料庫看看其效能或結果是否會比neo4j更合適(試驗)

110/1/25  22:30


建立初步嘗試雛形

因為資料量大，先改用small資料

討論查詢後相關資料給使用者看(EX:網址，供使用者自由選擇是否前往查看更多資訊)

110/1/27 16:10


TMDB 網站有API https://www.themoviedb.org/documentation/api/wrappers-libraries

先嘗試mysql和python的連接和把圖建完，找尋合適的使用方式與應用

110/1/28 17:38


MySQL
遇到的問題：MySQL的建置，發生無法匯入CSV的問題。
解決辨法：
先改ProgramData\MySQL\MySQL Server 8.0\my.ini中的參數。
加上secure_file_priv=''
後將CSV放入同目錄下的Data\test\ test為資料庫的名稱，即可解決。

問題：MySQL沒有建立連線。
解法：打開服務，找到MySQL80，右鍵打開就可以建立連線。

01/29/2021 02:12

Netflix部分的研究:
官方API已下架

https://partnerhelp.netflixstudios.com/hc/en-us/sections/205641408-API-Developer-s-Toolkit
有另外找到一個有netflix影視較大量且有較新的資料的網站:
https://unogs.com/
內容各個影視的id parameter如:
絕命毒師(Breaking Bad)
在netflix url為--->https://www.netflix.com/tw/title/70143836
在unogs為---->https://unogs.com/title/70143836
可見一組parameter對應一部影視，不過在netflix上可能會有國家地區的限制，能看到的不同。
unogs有一個官方API
https://rapidapi.com/unogs/api/unogs
有免費的方法，不過一天只能推100個request，超過即要每一次request付費一次，且要先綁定繳費信用卡才能使用API。
其他的python package有:
https://pypi.org/project/netflix/(github:https://github.com/efe/netflix)
https://pypi.org/project/pyflix2/
都有嘗試寫來抓抓看資料，但前者一直回傳noneType的物件，可能遭到netflix方面的封禁
後者因為他要有啟動碼但取得啟動碼的網站已消失(status code :404)
有想過直接用爬蟲對unogs.com來取的資訊，也有真的去試著爬回來，但unogs的服務條款有寫:
You must not conduct any systematic or automated data collection activities on or in relation to this website without unogs.com's express written consent.
This includes:

scraping
data mining
data extraction
data harvesting.....
目前還能抓影視資料回來，有可能之後會被封禁也不一定。

有搜尋到一些整理好的parameter資料集，但內容經實驗查詢後多數連結不適用或可能早已下架
-->利用wiki來獲取資料

維基部分的研究:
我們簡單試過api，主要是以網址後面加上action、format等參數來得到相關資訊。弄得跟爬蟲有點像
https://ithelp.ithome.com.tw/articles/10196319
https://www.mediawiki.org/wiki/API:Search


spotify部分的研究:
官方有developer的社群，在使用過程中感覺比起netflix友善許多
目前嘗試使用的是python的方式:
https://spotipy.readthedocs.io/en/2.16.1/#api-reference(github:https://github.com/plamere/spotipy)
利用其套件加上官方developer社群中dashboard可建立一個應用資料庫，取得api的key，進而使用spotipy
能透過設定scope設定存取權
https://developer.spotify.com/documentation/general/guides/scopes/
其中也有參考:
https://medium.com/%E6%B5%B7%E5%A4%A7-ios-app-%E7%A8%8B%E5%BC%8F%E8%A8%AD%E8%A8%88/%E4%B8%B2%E6%8E%A5%E5%A4%9A%E7%A8%AE-api-%E8%A3%BD%E4%BD%9Clady-gaga-app-spotify%E7%AF%87-2d39c52da7e4

2021/2/10 22:11
