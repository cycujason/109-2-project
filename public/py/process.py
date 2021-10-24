import sys 
import json

result = {
    'Name': sys.argv[1],
    'From': sys.argv[2]
  }
test = [1,2]
json = json.dumps(result)

print(str(test)) #origin is (json)
print("success")
sys.stdout.flush()