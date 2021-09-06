# Service functionality

According to a fragment of the task description:
> This API will be involved every time a new user wants to watch new content,
> so it should be able to know exactly how many videos a user is watching.

the flow was based on creating a **guard** whenever a user wants to watch a stream.

### What is a guard?
A guard contains information about the expiration time, until which it should be refreshed if the user continues to watch a stream.
The expiration time is calculated by adding a given interval to the timestamp of the guard’s creation time. (by default set to `60 seconds`)

### Are users able to watch only 60 seconds of a stream?
To allow the user to watch the whole stream, the guard has to be periodically refreshed.
This approach helps to ensure that the user keeps watching a stream and thanks to that we can determine,
whether he does not watch more streams than he is allowed to.

### Okay, so how can they get rid of their guards?
A guard can be removed in two ways:
1. By removing it manually
2. Automatically, after a given interval has passed (by default set to `90 seconds`)

### Why is that?
Manual removal can be helpful in certain cases e.g. after a stream is finished.
Automatic removal, on the other hand, not only helps to save database memory, but also allows us to handle situations,
when a manual removal could not be performed (e.g. user closed a tab with a stream, lost Internet connection etc.)

### Aren't 90 seconds too little? Streams are usually much longer.
That's right, but this thing was also taken care of. 
Refreshing a guard not only refreshes the expiration time stored in it, **but also refreshes its living time**.
Thanks to that we save memory in the database and make sure that we store only the necessary guards

You might have noticed an extra interval of 30 seconds between
the default 60 seconds of stream's accessibility stored in a guard, and its time to live set to 90 seconds. 
It was designed to ensure that a guard can be refreshed, even when a user experiences some network issues, latencies etc. 

## Endpoints

The server consists of 3 endpoints:

| Method     |       URI       | Functionality     |
|:----------:|:---------------:|:-----------------:|
| **POST**   |    */guards*    | Creating guards   |
| **PATCH**  | */guards/`:id`* | Refreshing guards |
| **DELETE** | */guards/`:id`* | Deleting guards   |

A detailed documentation can be found [here](endpoints.md). 

--- 

## Tech stack

Speed is one of the most crucial things in terms of video streaming. 
That is why I decided to use the fastest suitable technologies.

- **Server:** *Fastify*
- **Database:** *Redis*


## Scalability

Scalability is also an important factor. As the number of users would grow,
this service could be scaled in the following ways:

### Application
The easiest way to scale the application itself is to apply horizontal scaling. 
That means using multiple instances and orchestrating the load with a Load Balancer. 

### Redis
There are a few ways to scale the database layer:

1. #### Vertical scaling
Vertical scaling is probably the easiest way to scale Redis.
It means adding more memory and CPU but the more additional memory we need, the more expensive this method gets.
Despite costs, there is also one serious drawback - at some point, we would get to an end, when we can't add more memory. 

2. #### Sharding
Another simple, but powerful idea would be database sharding. 
It's a horizontal scaling solution to manage the load by managing reads and writes to the database.
The solution could be creating read-only and write-only Redis instances.

3. #### Adding more Redis instances*
Speaking of horizontal scaling, this approach is marked with an asterisk due to its complexity. 
There are some problems to be aware of (e.g. orchestrating database reads & writes in a way that would ensure
that we don't lose information about any existing user guards).


## Logging
The more users an application has, the more important application monitoring becomes.
In that case, logs could be improved by:
- structuring them,
- adding request ID to a log (especially helpful in microservices architecture)
- setting log level dynamically


## Monitoring
There are 2 major things to monitor: application and Redis.

### Application
Useful application metrics:
- Status code and response time per each endpoint
- RPS (Requests Per Second)
- CPU & memory usage

### Redis
Useful application metrics:

- CPU & memory usage
- Read/Write count
