require('dotenv').config()
const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded( {extended: true}))
app.use(express.static(path.join(__dirname, 'public')))

app.get("/api/files", (req, res) => {
    fs.readdir("./files", (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Unable to scan directory" });
        }
        res.json({ files });
    });
});

app.get("/", (req, res) => {
    fs.readdir("./files", (err, files) => {
        res.render("index", {files})
    })
})
const today = new Date()
const date = String(today.getDate()).padStart(2, '0')
const month = String(today.getMonth() + 1).padStart(2, '0')
const year = today.getFullYear()

const fn = `${date}-${month}-${year}.txt`

app.get("/create", (req, res) => {
    res.render("createhisaab")
})
app.post("/create", (req, res) => {
    let { title, details } = req.body
    const content = `Title: ${title}\nDetails: ${details}`
    fs.writeFile(`./files/${fn}`, content, (err) => {
        if(err) return console.error(err.message)
    })
    res.redirect("/")
})
app.get("/edit/:filename", (req, res) => {
    const date = req.params.filename.split(".")[0]
    fs.readFile(`./files/${req.params.filename}`, 'utf-8' ,(err, data) => {
        const [titleLine, ...detailsLines] = data.split("\n")
        const title = titleLine.replace("Title: ", "")
        const details = detailsLines.join("\n").replace("Details: ", "")
        res.render("edit", { filename: req.params.filename, date, title, details })
    })
})
app.post("/update/:filename", (req, res) => {
    let { title, details } = req.body
    const content = `Title: ${title}\nDetails: ${details}`
    fs.writeFile(`./files/${req.params.filename}`, content, (err) => {
        res.redirect("/")
    })
})
app.get("/hisaab/:filename", (req, res) => {
    const date = req.params.filename.split(".")[0]
    fs.readFile(`./files/${req.params.filename}`, 'utf-8' ,(err, data) => {
        const [titleLine, ...detailsLines] = data.split("\n")
        const title = titleLine.replace("Title: ", "")
        const details = detailsLines.join("\n").replace("Details: ", "")
        res.render("show", { filename: req.params.filename, date, title, details })
    })
    })
app.get("/delete/:filename", (req, res) => {
    fs.unlink(`./files/${req.params.filename}`, (err) => {
        if(err) return console.error(err.message)
        res.redirect("/")
    })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})