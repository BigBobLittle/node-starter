# NODEJS STARTER TEMPLATE

## DESCRIPTION

a nodejs quick starter templates for express base projects. It uses MongoDb for database  
it has a basic user schema, with role Authorization and authentication using jwt and image upload    

It implements basic user auth flow [signup, login, forgot-password, change-password]  
It implements a basic SMS notification using hubtel, please, you'll have to provide your own API Keys for it to work  
It also provides an endpoint for web push notification (browser) using web push   
i've added a sample test in the test folder 



## How to use

clone this repo and run `npm install`

## how to start

all api endpoints are served with the `nameOfHost/starter/v1`  
@example use
`http://localhost:300/starter/v1/auth/login`
