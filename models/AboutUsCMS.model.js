const mongoose = require("mongoose");

const aboutUsCMSSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "about-us",
      unique: true,
    },
    banner: {
      bannerImage: { type: String, default: "" },
      bannerLabel: { type: String, default: "" },
      bannerTitle: { type: String, default: "" },
      bannerDescription: { type: String, default: "" },
      showSection: { type: Boolean, default: true },
    },
    stewardship: {
      eyebrow: { type: String, default: "" },
      heading: { type: String, default: "" },
      description: { type: String, default: "" },
      quote: { type: String, default: "" },
      badgeNumber: { type: String, default: "" },
      badgeText: { type: String, default: "" },
      image: { type: String, default: "" },
      showSection: { type: Boolean, default: true },
    },
    journey: {
      eyebrow: { type: String, default: "" },
      heading: { type: String, default: "" },
      steps: { type: String, default: "" },
      imageSet: { type: String, default: "" },
      showSection: { type: Boolean, default: true },
    },
    quote: {
      quote: { type: String, default: "" },
      author: { type: String, default: "" },
      showSection: { type: Boolean, default: true },
    },
    charter: {
      heading: { type: String, default: "" },
      description: { type: String, default: "" },
      reportLabel: { type: String, default: "" },
      reportHref: { type: String, default: "" },
      charters: { type: String, default: "" },
      showSection: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AboutUsCMS", aboutUsCMSSchema);
