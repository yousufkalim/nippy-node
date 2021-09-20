const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const Ad = require("../models/ad");
const User = require("../models/user");
const Device = require("../models/device");
const populateQuery = [
    {
      path: "Devices",
      populate: [
        {
          path: "Device",
        },
      ],
  
    },
    {
      path: "Ads",
      populate: [
        {
          path: "Ad",
        },
      ],
    }
  ];
//create createAd 

exports.createAd = async (req, res) => {
    try {
        let userId = req.user.id;

        let newAd = await Ad.create(req.body) //create new Ad
        await User.findOneAndUpdate( //update user
            {
                _id: userId,
            },
            {
                $push: {
                    Ads: newAd._id,
                },
            },
            {
                new: true
            }
        ).populate(populateQuery);
        res
            .status(200)
            .send(response(STRINGS.TEXTS.AdCreated, newAd));
    } catch (error) {
        res.status(400).send(response(error.message));

    }
}
//update createAd 

exports.updateAd = async (req, res) => {
    try {
        let adId = req.params.id;
        const { images, colorSelection, addText, effects } = req.body

        let ad = await Ad.findOne({ _id: adId }); // Check if ad exist
        if (!ad) return res.status(400).send(response(STRINGS.ERRORS.adNotFound));
        let newAd = await Ad.findOneAndUpdate( //update Ad
            {
                _id: adId,
            },
            {
                $set: {
                    images: images,
                    colorSelection: colorSelection,
                    addText: addText,
                    effects: effects
                },
            },
            {
                new: true
            }
        ).populate(populateQuery);
        res
            .status(200)
            .send(response(STRINGS.TEXTS.AdUpdated, newAd));
    } catch (error) {
        res.status(400).send(response(error.message));

    }
}

//get single Ad 

exports.getSingleAd = async (req, res) => {
    try {
        let adId = req.params.id;
        let ad = await Ad.findOne({ _id: adId }).populate(populateQuery);// Check if ad exist
        if (!ad) return res.status(400).send(response(STRINGS.ERRORS.adNotFound));

        return res
            .status(200)
            .send(response(STRINGS.TEXTS.adFetched, ad));
    } catch (error) {
        res.status(400).send(response(error.message));

    }
}

//get all Ads by user 

exports.getAllAdsByUser = async (req, res) => {
    try {
       
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
//delete single Ad 

exports.deleteAdByUser = async (req, res) => {
    try {
        let adId = req.params.id;
        let userId = req.user.id;

        let ad = await Ad.findOne({ _id: adId }); // Check if ad exist
        if (!ad) return res.status(400).send(response(STRINGS.ERRORS.adNotFound));
        await User.findOneAndUpdate( //remove ad from user
            {
                _id: userId,
            },
            {
                $pull: {
                    Ads: adId,
                },
            },
            {
                new: true
            }
        );
        await Ad.findByIdAndRemove({ _id: adId }); //remove ad
        return res
            .status(200)
            .send(response(STRINGS.TEXTS.AdDeleted));
    } catch (error) {
        res.status(400).send(response(error.message));

    }
}