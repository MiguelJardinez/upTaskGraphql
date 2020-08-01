const mongoose = require('mongoose'); 

const TareaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    trim: true,
    require: true
  },
  creador: {
    //Relacion con la coleccion de usuarios para relacionarlas
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
  },
  proyecto: {
    //Relacion con la coleccion de proyectos para relacionarlas
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proyecto',
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
  estado: {
    type: Boolean,
    default: false,
  }
}); 


module.exports = mongoose.model('Tarea', TareaSchema); 