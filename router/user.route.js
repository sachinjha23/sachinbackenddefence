const router = require("express");
const studyMaterial = require("../models/studymaterial.model");
const userrouter = router();
const Course = require("../models/course.model");


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




module.exports = {
    userrouter,
};
