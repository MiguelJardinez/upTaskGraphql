const mongoose = require('mongoose'); 

const url = 'mongodb://localhost:27017/uptask'; 
const port = process.env.PORT || url;

const conectarDB = async () => {
  try {
    await mongoose.connect( port, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    
    console.log('Base de datos conectada'); 
  } catch (error) {
    console.log('Hubo un error'); 
    console.log(error);
    process.exit(1);
  }
}

module.exports = conectarDB;