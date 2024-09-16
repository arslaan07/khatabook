const mongoose = require('mongoose')

let userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    khatas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'khata'
        }
    ]
});

module.exports = mongoose.model("user", userSchema)