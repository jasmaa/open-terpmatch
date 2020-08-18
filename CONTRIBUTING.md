# How to Contribute

We appreciate pull requests from everyone.

## Getting Started

  - Make sure you have a GitHub account
  - Fork the repository on GitHub
  - Add this repo as upstream with `git remote add upstream <REPO_URI>`
  - Follow the instructions in the [README](/README.md) to setup your local development environment
    - This will include downloading Node, Yarn, and MongoDB and setting up and configuring services on
      Twilio and SendGrid

## Making Changes

  - Create a topic branch from master
  - Make well-documented commits in a logical manner
  - Write tests for your changes and ensure that your branch passes our tests
  - Commits that address an issue should reference the issue number in the commit message
    - ex. `Fix #42: Patch XSS vulnerability in submission page`

## Submitting Changes

  - Sync your topic branch with our master branch using `git pull upstream master`
  - Submit a pull request of your topic branch to master

## Receiving Feedback

Acceptable pull requests will go through a code review process from which we may
request changes or additions to your contribution. You can make additional changes
by continuing to push to your topic branch. If you disagree with any of the requested
changes, please address your concerns to the reviewer for further discussion.