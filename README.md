# The mtg-cube.de tournament vault

## About

### Introduction

This is the code for the web application we use to run Magic: the Gathering cube tournaments on [our website](https://mtg-cube.de).
It is entirely maintained by me and a friend who is responsible for the design side. I am not a web developer.
This means I use this project as a learning ground and that I will make mistakes.

### Initial problem

We run a yearly multi-day [cube tournament](https://mtg-cube.de). Players play three swiss drafts where they never draft the same cube twice.
From a TO perspective, this is unusual because of the no-duplication requirement and because we only have one physical copy of each cube.
Due to this, we cannot use traditional TO software like the now-defunct Wizards Event Reporter or [melee](https://melee.gg).

### Scope

The app needs the following core functionality:

- Admins:
  - create tournaments and drafts inside them
  - assign players to drafts beforehand (see [above](#initial-problem))
  - randomly seat drafts
  - pair rounds according to standings in that draft
- Users:
  - create an account
  - enroll for tournaments
  - upload an image of their drafted cards before drafting and after playing with them (check-in/check-out)
  - see their currently active draft and match with opponent name and table number
  - report and confirm match results
  - see tournament and draft standings

## Technologies

[Originally](https://github.com/g0dnerd/mtgcube.git), this project was 100% written in [Django](https://djangoproject.com).  
I made the decision towards to a more modular architecture using

- [NestJS](https://nestjs.com) and [Prisma](https://prisma.io) for the backend
- [Angular](https://angular.dev) for the frontend
  because I am not a fan of how Django templates work and because I am a sucker for strongly typed languages.
