const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
const { authentication } = require("./middlewares/authentication");
const { authroute } = require("./router/auth.route");
const { userrouter } = require("./router/user.route");
const { adminroute } = require("./router/admin.route");
const { authorization } = require("./middlewares/authrisation");
const path = require('path');
const app = express();
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();
app.use(express.json());
app.use(cors());
PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
    res.send("Home page");
});

app.use("/api/auth", authroute);
app.use("/api/user", userrouter);
app.use(authentication);
app.use("/api/admin", authorization(["admin"]), adminroute)
app.get('/download/:filename', function (req, res) {
    const fileName = req.params.filename.toString();
    const filePath = path.join(__dirname, 'uploads', fileName);
    console.log(filePath)
    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    res.setHeader('Content-Type', 'application/pdf');

    res.sendFile(filePath, function (err) {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading file');
        }
    });
});
app.listen(PORT, async (req, res) => {
    try {
        await connection;
        console.log("connect to mongodb");
    } catch {
        console.log(" error connect to mongodb");
    }

    console.log(`server is start at ${PORT}`);
});

// "mongodb+srv://sahu86744:rohitsahu54321@cluster0.ciixm9b.mongodb.net/?retryWrites=true&w=majority"