# concurrent-streams-detector

## Task description:
Build a service in Node.js that exposes an API which can be consumed from any client.
This service must check how many video streams a given user is watching and prevent a user from watching more than 3 video streams concurrently.

This API will be involved every time a new user wants to watch new content, so it should be able to know exactly how many videos a user is watching.

### Requirements:

The repository MUST contain:
- Source code
- Automated tests
- It should be buildable/viewable
- In case you need to use external libraries, please add them
- Any installation and deployment instructions for apps and components
- README file with a brief explanation on the scalability strategy
- Error handling (extra points for handling and logging edge-cases and critical paths)