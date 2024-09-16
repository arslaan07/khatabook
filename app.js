require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const db = require('./config/mongoose-connection')
const userModel = require('./models/user-model')
const khataModel = require('./models/khata-model')
const register = require('./validations/user/register')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')


app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded( {extended: true}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
 

app.get("/", isLoggedIn, async (req, res) => {
    let user = await req.user.populate('khatas');
    res.render("index", { khatas: user.khatas, showSearchBar: true })
});

// app.get("/register", isLoggedIn, (req, res) => {
//     req.user? res.redirect('/') : res.render("register")
// })
app.get("/register", (req, res) => {
    res.render("register")
})
app.post("/register", async (req, res) => {
    try {
        let { email, password } = req.body
        const { error, value } = register.validate(req.body)
        if(error) {
            console.log(`Validation error : ${error.message}`)
            return res.status(400).send(error.details[0].message)
        }
        let user = await userModel.findOne({email})
        if(user) {
            return res.status(409).send("email already exists")
        }
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                let user = await userModel.create({
                    email, 
                    password: hash
                })
                let token = jwt.sign({id: user._id }, process.env.JWT_KEY, { expiresIn: '1h' })
                res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production'})
                res.status(201).send("user created successfully")
            })
        })
    } catch (error) {
        console.log(`Error: ${error.message}`)
    }
})

// app.get("/login", isLoggedIn, (req, res) => {
//     req.user? res.redirect('/') : res.render("login")
// })
app.get("/login", (req, res) => {
    res.render("login")
})
app.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;
        let user = await userModel.findOne({email});
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    let token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '1h' });
                    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production'});
                    res.status(200).redirect('/');
                } else {
                    return res.status(401).send("Email or password incorrect");
                }
            })
        } else {
            return res.status(401).send("Email or password incorrect");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("An internal error occurred");
    }
    
});

    
 
app.get("/create", isLoggedIn, (req, res) => {
    res.render("createhisaab")
})
app.post("/create", isLoggedIn, async (req, res) => {
    try {
        let user = req.user
        let { title, details, encrypted, passcode, shareable, editable } = req.body
        const today = new Date()
        const date = String(today.getDate()).padStart(2, '0')
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const year = today.getFullYear()
        const fn = `${date}-${month}-${year}`
        let khata = await khataModel.create({
        user: user._id, 
        filename: fn, 
        title,
        details,
        encrypted: encrypted === "on"? true : false,
        passcode,
        shareable: shareable === "on"? true : false,
        editable: editable === "on"? true : false
    })
    console.log(khata)
    user.khatas.push(khata._id)
    await user.save()
    res.status(201).redirect("/")
    } catch (error) {
        console.error(error)
    }  
})
app.get("/hisaab/:id", isLoggedIn, async (req, res) => {
    let khata = await khataModel.findOne({_id: req.params.id})
    if(khata.encrypted) {
        return res.render("decrypthisaab", { khata }) 
    }
    res.render("showhisaab", {khata})    
})
app.post("/verify-passcode/:id", isLoggedIn, async (req, res) => {
    let khata = await khataModel.findOne({_id: req.params.id})
    if(khata && khata.passcode === req.body.password) {
        return res.render("showhisaab", {khata})
    }
    res.status(401).send("Invalid passcode")
})
app.get("/delete/:id", isLoggedIn, async (req, res) => {
    let khata = await khataModel.findOneAndDelete({_id: req.params.id})
    let user = req.user
    user.khatas.pull(khata._id)
    await user.save()
    res.status(200).redirect("/")
})
app.get("/edit/:id", isLoggedIn, async (req, res) => {
    let khata = await khataModel.findOne({_id: req.params.id})
    res.render("edithisaab", {khata})
})
app.post("/update/:id", isLoggedIn, async (req, res) => {
    let { title, details, encrypted, passcode, shareable, editable } = req.body
    let khata = await khataModel.findOneAndUpdate({ _id: req.params.id }, 
        {
            title,
            details,
            encrypted: encrypted === "on"? true : false,
            passcode,
            shareable: shareable === "on"? true : false,
            editable: editable === "on"? true : false 
        },
        { new: true })
    res.redirect(`/hisaab/${khata._id}`)
})

app.post("/generate-share-link/:id", isLoggedIn, async (req, res) => {
    try {
        let khata = await khataModel.findOne({_id: req.params.id})
        if(khata && khata.shareable) {
            const shareableLink = `${req.protocol}://${req.get('host')}/shared/${khata._id}`
            return res.json({ shareableLink })
        }
        res.status(403).send("Khata is not shareable")
    } catch (error) {
        console.error(error)
        res.status(500).send("An internal error occured")
    }
})
app.get("/shared/:id", async (req, res) => {
    try {
        const khata = await khataModel.findOne({ _id: req.params.id });
        if (khata && khata.shareable) {
            res.render("showhisaab", { khata});
        } else {
            res.status(403).send("This khata is not shareable.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching the khata");
    }
});

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
})

async function isLoggedIn(req, res, next) {
    if (req.cookies.token) {
        try {
            const decoded = await jwt.verify(req.cookies.token, process.env.JWT_KEY);
            const user = await userModel.findOne({_id: decoded.id});
            if (!user) {
                res.locals.isLoggedIn = false; // Ensure flag is set even when redirecting
                return res.redirect("/login");
            }
            req.user = user;
            res.locals.isLoggedIn = true; // User is logged in
            next();
        } catch (err) {
            console.error(err);
            res.locals.isLoggedIn = false; // Ensure flag is set even when redirecting
            return res.redirect("/login");
        }
    } else {
        res.locals.isLoggedIn = false; // No token found, user is not logged in
        return res.redirect("/login");
    }
}



const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})