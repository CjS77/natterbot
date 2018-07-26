# Running

## Set environment

MATTERMOST_TOKEN: The personal access token you've created on your mattermost account
SECURITY_TOKEN: A random token for authenticating requests to _this_ server

GITHUB_TOKEN: The secret used in github webhooks

## Running

    node natterbot
    
# API endpoints

All requests use POST

# /apps

List all registered apps. These apps can be used to send webhooks to, i.e.

`my.natterbot.com/:app`

# /github

Set your github webhooks to point to https://mynatterbotserver.com/github and natterbot will format and relay
github push events to Mattermost


    