
const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const User = require("../models/user");
const Device = require("../models/device");


//get all Devices by user 

exports.getAllDevicesByUser = async (req, res) => {
    try {
        const populateQuery = [
            {
                path: "Devices",
                populate: [
                    {
                        path: "Device",
                    },
                ],
            },
        ];
        let userId = req.user.id;
        let user = await User.findById({ _id: userId }).populate(populateQuery); // Check if user exist
        if (!user) return res.status(400).send(response(STRINGS.ERRORS.userNotFound));
        return res
            .status(200)
            .send(response(STRINGS.TEXTS.adFetched, user));
    } catch (error) {
        res.status(400).send(response(error.message));
  
    }
  }