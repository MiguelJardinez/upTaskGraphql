const Usuario = require('../models/UsuarioSchema'); 
const Proyecto = require('../models/ProyectoSchema'); 
const Tarea = require('../models/TareasSchema');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

//Palabra secreta 
const secreta = process.env.SECRETA || 'palabraSecreta';

//Crear y firman un JWT 
const crearToken = ( usuario, secreta, expiresIn ) => {
  const { id, email } = usuario;

  return jwt.sign( { id, email, }, secreta, { expiresIn })
}


const resolvers = {
  Query: {
    obtenerProyectos: async (_, {}, ctx) => {
      const proyectos = await Proyecto.find({ creador: ctx.usuario.id });

      return proyectos
    },
    obtenerTareas: async( _, {input}, ctx ) => {

      const tareas = await Tarea
                          .find({ creador: ctx.usuario.id })
                          .where('proyecto')
                          .equals(input.proyecto); 
      return tareas;
    }
  },
  Mutation: {
    crearUsuario: async ( _, {input} ) => {
      //Obtener los datos necesarios para crear al usuario 
      const { password, email } = input; 

      //Comprobamos que no exista el email en nuestra base de datos 
      const existeUsuario = await Usuario.findOne({ email }); 
      if( existeUsuario ) { 
        throw new Error('El usuario ya esta registrado'); 
      }

      try {
        //Hasheamos el password del usuario
        const salt = await bcrypt.genSalt(10); 
        input.password = await bcrypt.hash( password, salt ); 

        //Creamos un nuevo usuario en nuestra base de datos
        const nuevoUsuario = new Usuario(input); 
        nuevoUsuario.save();
        return 'Usuario Creado Correctamente'

      } catch (error) {
        console.log(error);
        console.log('Hubo un error');
      }

    },
    autenticarUsuario: async( _, {input}, ctx ) => {
      const { email, password } = input; 

      //Si el usuario existe
      const existeUsuario = await Usuario.findOne({email})
      if( !existeUsuario ){
        throw new Error('El usuario no esta resgistrado')
      }

      //Si es correcta la contraseña
      const passwordCorrecto = await bcrypt.compare( password, existeUsuario.password ); 
      
      if( !passwordCorrecto ) {
        throw new Error('La contraseña es incorrecta'); 
      }

      //Dar acceso a la aplicación 
      return {
        token: crearToken( existeUsuario, secreta, '1hr' )
      }

    },
    nuevoProyecto: async ( _, { input }, ctx ) => {

      try {
        //Pasamos la informacion del input a una nueva instancia de proyecto
        const proyecto = new Proyecto(input); 

        //Asociar el proyecto con el creador
        proyecto.creador = ctx.usuario.id;

        //Almacenamos la informacion en nuestra base de datos
        const resultado = await proyecto.save();

        return resultado;

      } catch (error) {
        console.log(error);
        console.log('Hubo un error');
      }

    },
    actualizarProyecto: async ( _, { id, input }, ctx ) => {

      //Revisar que el proyecto existe
      let proyecto = await Proyecto.findById(id); 

      if( !proyecto ) {
        throw new Error('Proyecto no encontrado')
      }

      //Revisar que el usuario creo el proyecto 
      if( proyecto.creador.toString() !== ctx.usuario.id ) {
        throw new Error('No tienes las credenciales para editar este proyecto')
      }

      //Guardar proyecto ya actualizado
      proyecto = await Proyecto.findOneAndUpdate({ _id: id  }, input, { new: true }); 
      return proyecto
    },
    eliminarProyecto: async ( _, { id }, ctx ) => {

      let proyecto = await Proyecto.findById(id); 

      //Revisar si la persona que trata de eliminar el proyexto tiene las credenciales 
      if( proyecto.creador.toString() !== ctx.usuario.id ){
        throw new Error('No tienes las credenciales para eliminar esteproyecto')
      }

      //Eliminar el proyecto

      await Proyecto.findOneAndDelete({ _id: id })
      return 'Proyecto eliminado correctamente'
    },
    nuevaTarea: async ( _, {input}, ctx ) => {
      try {
        //estanciar el objeto de la nueva tarea 
        const tarea = new Tarea(input)

        //Asociamos las tareas con el proyexto y el creador 
        tarea.creador = ctx.usuario.id

        //Almacenamos la nueva tarea a la base de datos 
        const nuevaTarea = await tarea.save()
        return nuevaTarea
        
      } catch (error) {
        if(error) {
          console.log(error);
          console.log('Hubo un error al crear una nueva tarea');
        }
      }
    },
    actualizarTarea: async ( _, { id, input, estado }, ctx ) => {
      //Revisar que la tarea existe
      let tarea = await Tarea.findById(id);

      if(!tarea) {
        throw new Error('Tarea no encontrada'); 
      }

      //Revisar que la persona que lo edita es el propietario
      if(tarea.creador.toString() !== ctx.usuario.id){
        throw new Error('No tienes las credenciales para actualizar esta tarea')
      }

      //Asignamos la tarea 
      input.estado = estado; 

      //Guardar y retornar tarea acutalizada
      tarea = await Tarea.findByIdAndUpdate({ _id: id}, input, {new: true});
      return tarea; 
    },
    eliminarTarea: async ( _, { id }, ctx ) => {

      let tarea = await Tarea.findById(id);

      if( tarea.creador.toString() !== ctx.usuario.id){
        throw new Error('No tienes las credenciales para eliminar la tarea'); 
      }

      //Eliminar la tarea existente
      await Tarea.findOneAndDelete({ _id: id })
      return 'La tarea a sido eliminada correctamente'

    }
  }
};

module.exports = resolvers;