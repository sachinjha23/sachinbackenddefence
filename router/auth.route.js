const router = require("express");
const bcrypt = require("bcryptjs");
const authroute = router();
const jwt = require("jsonwebtoken");
const User = require("../models/user.models");
const query = require("../models/query.model");
const AWS = require("aws-sdk");
const nodemailer = require('nodemailer');
// const { nanoid } = require("nanoid");
const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
};

const SES = new AWS.SES(awsConfig);
authroute.post("/signup", async (req, res) => {
    try {
        const {
            fullname,
            email,
            password,
            contactnumber,
            classstandard,
            stream,
            state,
            course
        } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
            fullname,
            email,
            password: hashedPassword,
            contactnumber,
            classstandard,
            stream,
            state,
            course
        });
        await user.save()

        res.status(201).json({ message: "User created" });
    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

authroute.post("/login", async (req, res) => {
    try {
        const { email, password, contactnumber } = req.body;

        // Find the user by the email
        let user = await User.findOne({
            $or: [{ email: email }, { contactnumber: contactnumber }],
        });
        if (!user) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        // Compare the provided password with the hashed password stored in the database
        const isMatch = bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id, email: email, role: user.role }, process.env.JWT_SECRET);

        return res.status(200).json({
            message: "Login Successfully",
            token,
            role: user.role
        });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_FROM_PASSWORD,
    },
});
authroute.post('/feedback', async (req, res) => {
    try {
        const { name, email, querydetails } = req.body;
        await sendEmail(email, name, email, querydetails);
        res.status(200).json({
            message: 'Email sent successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const sendEmail = async (emailto, name, email, querydetails) => {
    const emailfrom = process.env.EMAIL_FROM;

    try {
        // Prepare email to send
        const mailOptions = {
            from: emailfrom,
            to: emailto,
            subject: 'Feedback Confirmation',
            html: `
        <html>
          <body>
            <h1>Feedback Confirmation</h1>
            <p>Dear ${name},</p>
            <p>Thank you for your feedback. Here are the details:</p>
            <p>Email: ${email}</p>
            <p>Query: ${querydetails}</p>
            <p>We appreciate your time and feedback.</p>
          </body>
        </html>
      `,
        };

        const emailSent = await transporter.sendMail(mailOptions);
        console.log(emailSent);
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    authroute,
};
