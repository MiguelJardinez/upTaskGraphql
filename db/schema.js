const { gql } = require('apollo-server'); 

const typeDefs = gql`

  type Curso {
    nombre: String
    tecnologia: String
  }
  
  type Token {
    token: String
  }

  type Proyecto {
    nombre: String
    id: ID
  }

  type Tarea {
    nombre: String
    id: ID
    proyecto: String
    estado: Boolean
  }
  
  type Query {
    obtenerProyectos: [Proyecto]
    obtenerTareas(input: ProyectoIDInput): [Tarea]
  }

  input ProyectoIDInput {
    proyecto: String!
  }

  input UsuarioInput {
    nombre: String!
    email: String!
    password: String!
  }

  input autenticarInput {
    email: String!
    password: String!
  }

  input proyectoInput {
    nombre: String!
  }

  input tareaInput {
    nombre: String!
    proyecto: String!
  }

  type Mutation {
    #Usuario
    crearUsuario(input: UsuarioInput): String
    autenticarUsuario(input: autenticarInput ): Token

    #Proyectos
    nuevoProyecto( input: proyectoInput ): Proyecto
    actualizarProyecto( id: ID!, input: proyectoInput ): Proyecto
    eliminarProyecto( id: ID! ): String
    
    #Tareas
    nuevaTarea(input: tareaInput): Tarea
    actualizarTarea( id: ID, input: tareaInput, estado: Boolean ): Tarea
    eliminarTarea( id: ID! ): String
  }

`; 

module.exports = typeDefs;