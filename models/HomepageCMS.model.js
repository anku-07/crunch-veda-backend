const mongoose = require('mongoose');

const homepageCMSSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'homepage',
      unique: true,
    },
    homeBanner: {
      bannerImage: {
        type: String,
        default: '',
      },
      bannerVideo: {
        type: String,
        default: '',
      },
      bannerSubTitle: {
        type: String,
        default: '',
      },
      bannerTitle: {
        type: String,
        default: '',
      },
      bannerDescription: {
        type: String,
        default: '',
      },
    },
    categorySection: {
      categoryTitle: {
        type: String,
        default: '',
      },
    },
    bestSellerSection: {
      sectionTitle: {
        type: String,
        default: '',
      },
      selectedProducts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HomepageCMS', homepageCMSSchema);
