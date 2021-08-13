from os import remove
import sys
import json
import jieba

origin = sys.argv[1]

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
result = {
    'text': seg_list,
}
'''
#print(output)
json = json.dumps(output)
print(str(json)) #origin is (json)


sys.stdout.flush()