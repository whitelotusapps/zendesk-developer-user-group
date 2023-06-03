import requests
import json
import time
import yaml
from dateutil import parser

with open('.<YOUR YAML FILE NAME>.yaml', encoding="utf-8") as config_data:
    config = yaml.load(config_data, Loader=yaml.FullLoader)

instance = '<THE INSTANCE YOU WANT TO CONNECT TO, AS DEFINED IN YOUR YAML FILE>'

domain = config[instance]['domain']
auth = config[instance]['auth']

url = f"https://{domain}.zendesk.com/api/v2/groups"

payload = {}

headers = {
    "Authorization": f"{auth}"
}

response = requests.request("GET", url, headers=headers, data=payload)

print(json.dumps(json.loads(response.text), indent=4))

groups = json.loads(response.text)

for group in groups["groups"]:

    id = group["id"]
    name = group["name"]

    print(f"ID: {id}")
    print(f"NAME: {name}\n")