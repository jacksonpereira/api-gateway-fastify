const Fastify = require("fastify");
const axios = require("axios");
const server = Fastify();

const proxyUsers = require("fastify-http-proxy");
const proxyProjects = require("fastify-http-proxy");

const accessGroup = require("./accessGroup")();

server.use(require("cors")());

// Hook para verificar se o hostname é do grupo de acesso autorizado
server.addHook("preHandler", async (request, reply, next) => {
  if (!(accessGroup.group.indexOf(request.hostname) >= 0)) {
    console.log(`Hostname ${request.hostname} is invalid`);
    return reply.status(200).send({
      message: "Hostname invalid"
    });
  }
  console.log(`Hostname ${request.hostname} is valid`);
  next();
});

server.addHook("preHandler", async (req, res, next) => {
  if (!req.headers.authorization) {
    // Se não houver autorização
    // console.timeEnd("Autenticacao");
    console.log("Autorização error: 300");
    return res.redirect(300, "https://igti.instructure.com/login/canvas");
  }

  var options = {
    method: "GET",
    // data: {},
    headers: {
      Authorization: req.headers["authorization"],
      "Content-Type": "application/json"
    }
  };

  axios
    .get("http://localhost:3009/verify", options)
    .then(response => {
      console.log("then");
      console.log(response);
      next();
    })
    .catch(err => {
      console.log(err);
      res.code(500).send({ message: err });
    });
});

// Proxy de usuários
server.register(proxyUsers, {
  upstream: "http://localhost:3001",
  prefix: "/users", // optional
  http2: false // optional
  // preHandler: (req, res, next) => {

  // }
});

server.register(proxyProjects, {
  upstream: "http://localhost:3002",
  prefix: "/products", // optional
  http2: false // optional
});

console.log(`API gateway listen on 3000 port`);
server.listen(3000);
