const router = require("express");
const studyMaterial = require("../models/studymaterial.model");
const userrouter = router();
const Course = require("../models/course.model");
const contactModel = require("../models/contact.model");
const nodemailer = require('nodemailer');

userrouter.get("/getcourse", async (req, res) => {
    try {
        const coursedetails = await Course.find().sort({ create_at: -1 });

        res.status(200).json({ coursedetails });
    } catch (error) {
        console.error("Error in getcourse:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

userrouter.get("/getMaterial", async (req, res) => {
    try {
        const studymaterials = await studyMaterial.find().sort({ create_at: -1 });;

        res.status(200).json({ studymaterials });
    } catch (error) {
        console.error("Error in getMaterial:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Create a new contact
userrouter.post('/contacts', (req, res) => {
    const { name, email, phoneNumber, course } = req.body;

    // Create a new contact document
    const contact = new contactModel({
        name,
        email,
        phoneNumber,
        course,
    });

    // Save the contact to the database
    contact.save((err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to save contact' });
        } else {

            sendEmailNotification(name, email, phoneNumber, course);

            res.status(201).json({ message: 'Contact created successfully' });
        }
    });
});

// Get all contacts
userrouter.get('/contacts', (req, res) => {
    contactModel.find({}, (err, contacts) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch contacts' });
        } else {
            res.status(200).json(contacts);
        }
    });
});

// Send email notification
function sendEmailNotification(name, email, phoneNumber, course) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_FROM,
            pass: process.env.EMAIL_FROM_PASSWORD,
        },
    });

    const message = {
        from: email,
        to: process.env.EMAIL_FROM,
        subject: 'New Contact Form Submission',
        html: `
      <h3>New Contact Form Submission</h3>
      <p>Name: ${name}</p>
      <p>Email: ${email}</p>
      <p>Phone Number: ${phoneNumber}</p>
      <p>Course: ${course}</p>
    `,
    };

    // Send the email
    new Promise((resolve, reject) => {
        transporter.sendMail(message, (error, response) => {
            if (error) {
                console.error('Error sending email:', error);
                reject(error);
            } else {
                console.log('Email sent:', response.response);
                resolve("Email sent successfully");
            }
        })
    });
}


module.exports = {
    userrouter,
};
