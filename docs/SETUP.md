# Setup

Documentation for setting up and deploying Open Terpmatch


## Setting Up Twilio

### Pre-requisites
  - Register for a Twilio account if you do not already have one

### Instructions
  - Retrieve your Twilio account's SID. This will be `TWILIO_ACCOUNT_SID`.
  - Retieve your Twilio account's authentication token. This will be `TWILIO_AUTH_TOKEN`.
  - Create a Twilio Verify service and retrieve the service id. This will be `TWILIO_VERIFY_SERVICE`.
  - Register for a phone number to verify users via SMS. This number will be `TWILIO_NUMBER`.
    - The phone number will be formated as `+1XXXXXXXXXX` (assuming US phone number)


## Setting Up SendGrid

### Pre-requisites
  - Register for a SendGrid account if you do not already have one
  - Twilio setup

### Instructions
  - Retrieve your SendGrid API key. This will be `SENDGRID_API_KEY`.
  - Create and authenticate a sender either through domain or single-sender authentication
    - For a domain authenticated sender, decide on a sender email address such as `noreply@example.com`. This will be `SENDGRID_SENDER`.
    - For a single-sender, the selected email will be `SENDGRID_SENDER`.
  - Create a new dynamic template for verification and copy-paste the contents of `docs/verifyTemplate.html` into it
    - **NOTE**: The domain name listed in the HTML template will need to be changed to your site's domain name
  - Add an email integration from the Settings page of your Twilio Verify service and fill out the form with your credentials. This will allow
    you to use SendGrid to verify your users via email.


## Setting Up MongoDB

### Pre-requisites
  - Access to a MongoDB service

### Instructions
  - Retrieve your MongoDB configuration
    - If database is local, `MONGO_HOST` will be `localhost`.
    - If database is production, `MONGO_HOST` will be the host specified by your provider. You will also need to
      provide your database's user and password in the `MONGO_USER` and `MONGO_PASSWORD` environment variables respectively.
  - Once MongoDB has been configured for your environment, create a database for Open Terpmatch. This will be `MONGO_DATABASE`.

**NOTE**: The example deployment uses MongoDB Atlas as a convenient and cost-free production database.

## Local Development

### Pre-requisites
  - Node and Yarn
  - MongoDB setup
  - Twilio setup
  - SendGrid setup

### Instructions
Copy and rename `docs/example.env` to `.env` at the repo root.
Replace all the environment variables with your configuration.

Run the following to install all packages and start the server:

    yarn install
    yarn start

For rapid development, it may be more practical to run the server with hot-reload using nodemon:

    nodemon src/server.js

## Deployment to Heroku

### Pre-requisites
  - Production MongoDB setup
  - Twilio setup
  - SendGrid setup

### Instructions
  - Create a Heroku account if you do not already have one
  - Create an app with name `<APP_NAME>`
  - Copy-paste all variables from `.env` into the app's config on the Settings page

The repository can be linked and deployed by running the following at the repo root:

    heroku git:remote <APP_NAME>
    git push heroku master