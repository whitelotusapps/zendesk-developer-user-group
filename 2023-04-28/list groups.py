import requests
import json
import time
import yaml
from dateutil import parser

# Open the YAML file that contains our Zendesk instance config info
with open('.<YOUR YAML FILE NAME>.yaml', encoding="utf-8") as config_data:
    config = yaml.load(config_data, Loader=yaml.FullLoader)

# Define which Zendesk instance to connect to
instance = '<THE INSTANCE YOU WANT TO CONNECT TO, AS DEFINED IN YOUR YAML FILE>'

# Define the domain and auth variables for making requests
domain = config[instance]['domain']
auth = config[instance]['auth']

# Define the API endpoint URL that you are making calls to
url = f"https://{domain}.zendesk.com/api/v2/groups"

# Define the payload, and since we're only performing GET request, there is no payload to define
payload = {}

# Define the authorization token to be used to authenticate this API request
headers = {
    "Authorization": f"{auth}"
}

# Execute the API request and store the results into the variable named "response".
response = requests.request("GET", url, headers=headers, data=payload)

# The below code will print the JSON response in an easy, human readable fashion
print(json.dumps(json.loads(response.text), indent=4))

# Once we verify that the above contains the data we are looking for, we proceed to define the "groups" variable.
# The below loads the JSON from the response that we received earlier and stores that JSON object into the variable "groups".
groups = json.loads(response.text)

# Now that we have the JSON object stored into the variable "groups", we are able to loop through the "groups" object
# Each item in the "groups" object is an object that contains the details about a specific "group".
# One thing to note here is that the object is nested, and we have to specify groups["groups"].
# This would be different for different API endpoints. For example, the ticket API endpoint would be:
# for ticket in tickets["tickets"]:

for group in groups["groups"]:
    # We define variables to store values from specific keys that we want from the group object
    # You can find what keys each group object has by making an API call.
    # Below is an example of what a group JSON object looks like:
    '''
        {
            "url": "https://d3v-kairosnature.zendesk.com/api/v2/groups/6882693203341.json",
            "id": 6882693203341,
            "is_public": true,
            "name": "Admin and Agent",
            "description": "",
            "default": false,
            "deleted": false,
            "created_at": "2022-06-13T17:44:09Z",
            "updated_at": "2022-06-13T17:44:09Z"
        },
    '''   
    
    # Given the above, if we just needed to extract the ID and Name of each group, then we would define those variables as below:
    id = group["id"]
    name = group["name"]

    # Now that we have that data stored in a variable, we can print it to our terminal screen to verify that we have the data we are looking for
    print(f"ID: {id}")
    print(f"NAME: {name}\n")

    # Technically speaking, you could just print the data directly without storing the values into variables.
    # Although storing data into variables alows you to work with that specific information in an easier way, and provides you flexibility
    # depending on what you may need to do. Below is how you can print the data without storing it into variables:
    
    print(f'ID: {group["id"]}')
    print(f'NAME: {group["name"]}\n')
    
    # NOTE: There is a caveate to be aware of. Notice how I switched from double quotes to single quotes above. That is because the inner item that is quoted,
    # In this case the "id" and "name" are in double quotes. If the whole string is double quoted, this would result in early termination of the string.
    # This is a way of saying that the string would be interpreted as "ID: {group[" instead of 'ID: {group["id"]}' (because of the other double quote). Whereas with the single quote
    # encapsulating the entire string, the double quotes are treated properly.