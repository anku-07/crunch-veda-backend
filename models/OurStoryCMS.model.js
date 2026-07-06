const mongoose = require('mongoose');

const ourStoryCMSSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'our-story',
      unique: true,
    },
    banner: {
      bannerImage: {
        type: String,
        default: '',
      },
      bannerLabel: {
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
      buttonText: {
        type: String,
        default: '',
      },
      buttonLink: {
        type: String,
        default: '',
      },
    },
    theBeginning: {
      sectionLabel: {
        type: String,
        default: '',
      },
      sectionTitle: {
        type: String,
        default: '',
      },
      sectionDescription: {
        type: String,
        default: '',
      },
      image: {
        type: String,
        default: '',
      },
    },
    philosophy: {
      sectionTitle: {
        type: String,
        default: '',
      },
      sectionDescription: {
        type: String,
        default: '',
      },
      philosophies: [
        {
          icon: {
            type: String,
            default: '',
          },
          title: {
            type: String,
            default: '',
          },
          description: {
            type: String,
            default: '',
          },
        },
      ],
    },
    stewardship: {
      sectionTitle: {
        type: String,
        default: '',
      },
      milestones: [
        {
          year: {
            type: String,
            default: '',
          },
          title: {
            type: String,
            default: '',
          },
          description: {
            type: String,
            default: '',
          },
          image: {
            type: String,
            default: '',
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OurStoryCMS', ourStoryCMSSchema);
