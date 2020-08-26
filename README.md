# Open Terpmatch

[![CircleCI](https://img.shields.io/circleci/build/github/jasmaa/open-terpmatch)](https://app.circleci.com/pipelines/github/jasmaa/open-terpmatch)
[![Codecov](https://img.shields.io/codecov/c/github/jasmaa/open-terpmatch)](https://codecov.io/gh/jasmaa/open-terpmatch)

Open-source anonymous UMD crushing

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
