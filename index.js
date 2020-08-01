const { ApolloServer } = require('apollo-server'); 
const jwt = require('jsonwebtoken')
const typeDefs = require('./db/schema'); 
const resolvers = require('./db/resolvers');
const conectarDB = require('./config/configDB'); 

//Palabra secreta 
const secreta = process.env.SECRETA || 'palabraSecreta';


const server = new ApolloServer({ 
  typeDefs, 
  resolvers,
  context: ({ req }) => {
    const token = req.headers['authorization'] || ''; 
    if( token ) {
      const usuario = jwt.verify(token, secreta); 
      return {
        usuario
      }
    }
  } 
});
conectarDB(); 

server.listen().then( ({url}) => {
  console.log(`Servidor listo en el servidor ${url}`);
});