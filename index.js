const Fastify = require("fastify");
const server = Fastify();
const proxy = require("fastify-http-proxy");

server.register(proxy, {
  upstream: "http://localhost:3001",
  prefix: "/users", // optional
  http2: false // optional
});

server.register(proxy, {
  upstream: "http://localhost:3002",
  prefix: "/products", // optional
  http2: false // optional
});

server.listen(3000);
