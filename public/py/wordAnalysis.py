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

tags = jieba.analyse.extract_tags(origin, topK=20, withWeight=True ,allowPOS=('n')) 
i=0
for tag in tags:
    if(tag[1] >= 0.5):
      output.append(tag)


result = {}
i=1
for keyword in output:
    result.update({str(i) : keyword[0]})
    i+=1


#print(output)
json = json.dumps(result)
print(str(json)) #origin is (json)


sys.stdout.flush()