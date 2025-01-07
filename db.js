const mongoose = require('mongoose')
function Connection() {
    const mongoURI = "mongodb+srv://webserv:webserv@irs-serveur.r5zte.mongodb.net/IRC-Data/message"
    mongoose.connect(mongoURI)
        .then(() => console.log("db connected"))
        .catch(err => console.log(err))
}

module.exports = Connection