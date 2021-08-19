from os import remove
import sys
import json
import jieba
import jieba.analyse

origin = sys.argv[1]
output=[]
'''
seg_list = jieba.cut_for_search(origin)

output =[]
for word in seg_list:
    output.append(word)

i = 0
for word in output:
    if word ==" " or word == "\\n" or word == "(" or word ==")" or word=="<" or word == ")" or word == "#"or word == ">" or word ==":" or word == ".":
        output.pop(i)
    i+=1
'''
'''
result = {
    'text': seg_list,
}
'''
#tags =  jieba.analyse.textrank(origin , topK=5, withWeight=False, allowPOS=('ns','n','vn','v'))

tags = jieba.analyse.extract_tags(origin, topK=5) 
i=0
for tag in tags:
  output.append(tag)
  i+=1
  if i ==5:
      break

i = len(tags)
while i < 5:
    output.append(output[len(tags)-1])
    i+=1

result ={
    'key1':output[0],
    'key2':output[1],
    'key3':output[2],
    'key4':output[3],
    'key5':output[4]

}
#print(output)
json = json.dumps(result)
print(str(json)) #origin is (json)


sys.stdout.flush()