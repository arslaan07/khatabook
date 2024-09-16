const mongoose = require('mongoose')

let khataSchema = mongoose.Schema({ 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    filename: String,
    title: String,
    details: String,
    encrypted: {
        type: Boolean,
        default: false
    },
    passcode: String,
    shareable: {
        type: Boolean,
        default: false
    },
    editable: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("khata", khataSchema)