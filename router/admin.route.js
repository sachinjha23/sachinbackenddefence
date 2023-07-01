const adminroute = require("express").Router();
const multer = require("multer");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const Course = require("../models/course.model");
const StudyMaterial = require("../models/studymaterial.model");
const User = require("../models/user.models");

dotenv.config();
const bucketName = process.env.bucketName;
const awsConfig = {
    accessKeyId: process.env.AccessKey,
    secretAccessKey: process.env.SecretKey,
    region: process.env.region,
};
const S3 = new AWS.S3(awsConfig);

// Multer storage configuration
const storage = multer.memoryStorage();
const uploadImage = multer({ storage }).single("file");
const uploadPDF = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("File type is incorrect"));
        }
    },
}).single("file");

// Helper function to upload a file to S3
const uploadToS3 = (fileData, fileExtension) => {
    const params = {
        Bucket: bucketName,
        Key: `${Date.now().toString()}.${fileExtension}`,
        Body: fileData,
    };

    return S3.upload(params).promise();
};

// Course routes
adminroute.post("/uploadcourse", uploadImage, async (req, res) => {
    try {
        let image_url = null;

        if (req.file) {
            const uploadResult = await uploadToS3(req.file.buffer, "png");
            image_url = uploadResult.Location;
        }

        const { title, description, video_url } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: "Please provide title and description" });
        }

        const course = new Course({
            title,
            thumbnail: image_url,
            description,
            video_url,
        });

        await course.save();

        res.status(201).json({ message: "Course successfully uploaded" });
    } catch (error) {
        console.error("Error in uploadcourse:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

adminroute.patch("/updatecourse", uploadImage, async (req, res) => {
    try {
        let image_url = null;

        if (req.file) {
            const uploadResult = await uploadToS3(req.file.buffer, "png");
            image_url = uploadResult.Location;
        }

        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: "Please provide title and description" });
        }

        const payload = {
            title,
            thumbnail: image_url,
            description,
        };

        const updatedCourse = await Course.findByIdAndUpdate(req.query.id, payload);

        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ message: "Course updated" });
    } catch (error) {
        console.error("Error in updatecourse:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

adminroute.delete("/deletecourse", async (req, res) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.query.id);

        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ message: "Course successfully deleted" });
    } catch (error) {
        console.error("Error in deletecourse:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Study Material routes
adminroute.post("/uploadmaterial", uploadPDF, async (req, res) => {
    try {
        let pdf_url = null;

        if (req.file) {
            const uploadResult = await uploadToS3(req.file.buffer, "pdf");
            pdf_url = uploadResult.Location;
        }
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: "Please provide title and description" });
        }

        const material = new StudyMaterial({
            title,
            description,
            pdf_link: pdf_url,
        });

        await material.save();

        res.status(201).json({ message: "Material successfully uploaded" });
    } catch (error) {
        console.error("Error in uploadmaterial:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

adminroute.patch("/updatematerials", async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: "Please provide title and description" });
        }

        const updatedMaterial = await StudyMaterial.findByIdAndUpdate(req.query.id, { title, description });

        if (!updatedMaterial) {
            return res.status(404).json({ message: "Study material not found" });
        }

        res.status(200).json({ message: "Study material updated" });
    } catch (error) {
        console.error("Error in updatematerial:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

adminroute.delete("/deletematerial", async (req, res) => {
    try {
        const deletedMaterial = await StudyMaterial.findByIdAndDelete(req.query.id);

        if (!deletedMaterial) {
            return res.status(404).json({ message: "Study material not found" });
        }

        res.status(200).json({ message: "Study material successfully deleted" });
    } catch (error) {
        console.error("Error in deletematerial:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// User routes
adminroute.get("/getuserlist", async (req, res) => {
    try {
        const userList = await User.find();

        res.status(200).json({ userList });
    } catch (error) {
        console.error("Error in getuserlist:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = { adminroute };
