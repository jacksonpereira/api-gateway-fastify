const Fastify = require("fastify");
const server = Fastify();

const proxyUsers = require("fastify-http-proxy");
const proxyProjects = require("fastify-http-proxy");

const accessGroup = require('./accessGroup')();


// Hook para verificar se o hostname é do grupo de acesso autorizado
server.addHook('preHandler', async (request, reply, next) => {
  // Some code
  console.log("Hostname: "+request.hostname);
  if(!(accessGroup.group.indexOf(request.hostname) >= 0)){
    console.log("Hostname invalid");
    return reply.status(200).send({message: "Hostname invalid"});
  }
  next();
})

// Proxy de usuários
server.register(proxyUsers, {
  upstream: "http://localhost:3001",
  prefix: "/users", // optional
  http2: false, // optional
  preHandler: (req, res, next)=>{
    // console.time("Autenticacao");
    return autorizacao(req, res, next)
  }
});

server.register(proxyProjects, {
  upstream: "http://localhost:3002",
  prefix: "/products", // optional
  http2: false // optional
});

server.register(require('fastify-http-client'))

// Funções auxiliares
function autorizacao(req, res, next) {
  if(!req.headers.authorization){ // Se não houver autorização
    console.timeEnd("Autenticacao");
    res.code(300).redirect("https://google.com")
  }

  var options = {
    method: "POST",
    data: {},
    headers: {
      'Authorization': req.headers.authorization,
      'Content-Type': 'application/json'
    }
  }
  server.httpclient.request('http://localhost:3001/createUser', options)
    .then((response)=>{
      console.log("Token: "+response.data);
      next();
    })
    .catch((err)=>{
      res.code(403).send({message:err.message})
    })
}

server.listen(3000);
