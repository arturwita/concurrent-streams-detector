# concurrent-streams-detector

## Task description:
Build a service in Node.js that exposes an API which can be consumed from any client.
This service must check how many video streams a given user is watching and prevent a user from watching more than 3 video streams concurrently.

This API will be involved every time a new user wants to watch new content, so it should be able to know exactly how many videos a user is watching.

## Installation:

### a) Docker approach:
1. Open two terminals in project's root directory
2. In the first terminal, run the application:
    > `docker-compose up --build`
3. In the second terminal, run integration tests to check if the application works properly:
    > `npm run test:integration`

### b) Manual approach:
1. Create `.env` file in project's root directory and set all required environment variables there.
    An example file can be found [here](.env.example).
2. Install project's dependencies:
    > `npm install`
3. Start Redis:
    > `docker-compose up --build`
4. Start the application:
    > `npm run start`


API documentation can be found in the /docs directory ([link](docs/docs.md)).
