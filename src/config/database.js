const mongoose = require('mongoose');

const connectDB = async()=>{
  await mongoose.connect('mongodb+srv://nagarjunababunaiduadapa_db_user:OzFgl9ntDdWn4mUJ@firstnode-project.ungplvn.mongodb.net/devTinder?appName=FirstNode-Project');
}

module.exports = connectDB;