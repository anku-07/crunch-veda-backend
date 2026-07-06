const mongoose = require("mongoose");

const homepageCMSSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "homepage",
      unique: true,
    },
    homeBanner: {
      bannerImage: {
        type: String,
        default: "",
      },
      bannerVideo: {
        type: String,
        default: "",
      },
      bannerSubTitle: {
        type: String,
        default: "",
      },
      bannerTitle: {
        type: String,
        default: "",
      },
      bannerDescription: {
        type: String,
        default: "",
      },
    },
    categorySection: {
      categoryTitle: {
        type: String,
        default: "",
      },
    },
    bestSellerSection: {
      sectionTitle: {
        type: String,
        default: "",
      },
      selectedProducts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
    },
    featureSection: {
      features: [
        {
          icon: {
            type: String,
            default: "",
          },
          title: {
            type: String,
            default: "",
          },
          description: {
            type: String,
            default: "",
          },
        },
      ],
    },
    giftBoxSection: {
      sectionLabel: {
        type: String,
        default: "",
      },
      sectionTitle: {
        type: String,
        default: "",
      },
      sectionDescription: {
        type: String,
        default: "",
      },
      buttonText: {
        type: String,
        default: "",
      },
      buttonLink: {
        type: String,
        default: "",
      },
      backgroundImage: {
        type: String,
        default: "",
      },
    },
    nutritionHighlightsSection: {
      items: [
        {
          sectionLabel: {
            type: String,
            default: "",
          },
          sectionTitle: {
            type: String,
            default: "",
          },
          sectionDescription: {
            type: String,
            default: "",
          },
          highlights: [
            {
              type: String,
              default: "",
            },
          ],
          image: {
            type: String,
            default: "",
          },
          imagePosition: {
            type: String,
            enum: ["left", "right"],
            default: "right",
          },
        },
      ],
    },
    heritageJourneySection: {
      sectionTitle: {
        type: String,
        default: "",
      },
      sectionDescription: {
        type: String,
        default: "",
      },
      milestones: [
        {
          year: {
            type: String,
            default: "",
          },
          title: {
            type: String,
            default: "",
          },
          description: {
            type: String,
            default: "",
          },
        },
      ],
    },

    reelsSection: {
      sectionTitle: {
        type: String,
        default: "",
      },
      sectionDescription: {
        type: String,
        default: "",
      },
      reels: [
        {
          reelsVideo: {
            type: String,
            default: "",
          },
          reelsImage: {
            type: String,
            default: "",
          },
        },
      ],
    },
    faqSection: {
      sectionTitle: {
        type: String,
        default: "",
      },
      faqs: [
        {
          question: {
            type: String,
            default: "",
          },
          answer: {
            type: String,
            default: "",
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("HomepageCMS", homepageCMSSchema);
