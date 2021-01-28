# 老師留言
- Try to rename the repository name and add more material, such as your project goal.
- Ref to the repository at https://github.com/FelixWuYH/BSprojectICE
- 基於防疫不便到校，改以預約線上討論(週三除外)，相關資訊(如網址)或檔案可備份於倉庫或雲端資料夾，以便查閱。1/26
# 寒假進度
目前討論先更改專題方向，改以電影或影視作品的推薦，依舊以neo4j做知識庫後進行推薦

一樣照neo4j對電影資料做分析與關係建圖，建立知識庫後進行推薦，推薦的手法會用content-based

持續每日討論

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
