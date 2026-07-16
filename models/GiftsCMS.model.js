const mongoose = require("mongoose");

const giftsCMSSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "gifts",
      unique: true,
    },
    banner: {
      bannerLabel: {
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
    giftCollections: {
      sectionTitle: {
        type: String,
        default: "",
      },
      sectionButtonText: {
        type: String,
        default: "",
      },
      sectionButtonLink: {
        type: String,
        default: "",
      },
      collections: [
        {
          image: {
            type: String,
            default: "",
          },
          label: {
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
          buttonText: {
            type: String,
            default: "",
          },
          buttonLink: {
            type: String,
            default: "",
          },
        },
      ],
    },
    customChest: {
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
    giftProducts: {
      categories: [
        {
          categoryTitle: {
            type: String,
            default: "",
          },
          products: [
            {
              image: {
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
              price: {
                type: String,
                default: "",
              },
            },
          ],
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("GiftsCMS", giftsCMSSchema);
