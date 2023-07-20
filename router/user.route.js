const router = require("express");
const studyMaterial = require("../models/studymaterial.model");
const userrouter = router();
const Course = require("../models/course.model");
const contactModel = require("../models/contact.model");
const nodemailer = require('nodemailer');
const AWS = require("aws-sdk");
AWS.config.update({
    region: process.env.region
});

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
// userrouter.post('/contacts', (req, res) => {
//     const { name, email, phoneNumber, course } = req.body;

//     // Create a new contact document
//     const contact = new contactModel({
//         name,
//         email,
//         phoneNumber,
//         course,
//     });

//     // Save the contact to the database
//     contact.save((err) => {
//         if (err) {
//             console.error(err);
//             res.status(500).json({ error: 'Failed to save contact' });
//         } else {

//             sendEmailNotification(name, email, phoneNumber, course);

//             res.status(201).json({ message: 'Contact created successfully' });
//         }
//     });
// });

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

// Send email notification using AWS SES
function sendEmailNotification(name, email, phoneNumber, course) {
    const ses = new AWS.SES({ apiVersion: "2010-12-01" });

    const params = {
        Destination: {
            ToAddresses: [process.env.EMAIL_FROM], // Replace with the recipient email address
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `
                        <h3>New Contact Form Submission</h3>
                        <p>Name: ${name}</p>
                        <p>Email: ${email}</p>
                        <p>Phone Number: ${phoneNumber}</p>
                        <p>Course: ${course}</p>
                    `,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: "New Contact Form Submission",
            },
        },
        Source: process.env.EMAIL_FROM, // Replace with the email address from which you want to send the email
    };

    return ses.sendEmail(params).promise()
        .then(() => {
            console.log('Email sent successfully');
            return "Email sent successfully";
        })
        .catch(error => {
            console.error('Error sending email:', error);
            throw error;
        });
}

// Create a new contact
userrouter.post('/contacts', async (req, res) => {
    const { name, email, phoneNumber, course } = req.body;

    // Create a new contact document
    const contact = new contactModel({
        name,
        email,
        phoneNumber,
        course,
    });

    // Save the contact to the database
    try {
        await contact.save();
        await sendEmailNotification(name, email, phoneNumber, course);
        res.status(201).json({ message: 'Contact created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save contact or send email' });
    }
});


module.exports = {
    userrouter,
};
