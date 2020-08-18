# Open Terpmatch

Open-source anonymous UMD matching

![Landing page screenshot](docs/screenshot_01.png)

## What is this?
Open Terpmatch is an open-source re-creation of Brandon Ferrell's original University of Maryland matching site,
[Terpmatch](https://terpmatch.com). The main goal of the project is to keep Terpmatch as a platform accessible and open by
allowing anyone in the future to re-deploy this site as well as contribute to its development.

## Setup

### Local Development
    yarn install
    yarn start

### Deploy to Heroku
    heroku git:remote <APP_NAME>
    git push heroku master
