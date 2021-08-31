const Redis = require("ioredis");
const redis = new Redis({
    port: 6379,
    host: "redis",
});

// ioredis supports all Redis commands:
redis.set("foo", "bar"); // returns promise which resolves to string, "OK"

// ioredis supports the node.js callback style
redis.get("foo", function (err, result) {
    if (err) {
        console.error(err);
    } else {
        console.log(result); // Promise resolves to "bar"
    }
});
