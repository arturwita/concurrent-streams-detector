# concurrent-streams-detector


## Task description
Build a service in Node.js that exposes an API which can be consumed from any client.
This service must check how many video streams a given user is watching and prevent a user from watching more than 3 video streams concurrently.

This API will be involved every time a new user wants to watch new content, so it should be able to know exactly how many videos a user is watching.


## Installation
The application can be run in two ways. There are some common steps to take before running the application with docker or manually:
1. Create a `.env` file in the project's root directory and set all required environment variables there.
    An example file can be found [here](.env.example).
   
2. Install project's dependencies:
```   
npm install
```

### a) Docker approach
3. Open two terminals in the project's root directory

4. In the first terminal, run the application:
```
docker-compose up --build
```

3. In the second terminal, run integration tests to check if the application works properly:
```
npm run test:integration
```

### b) Manual approach

3. Start the application:
```
npm run start
```

Complete API documentation can be found in the [/docs](docs/docs.md) directory.
