const AboutUsCMS = require("../models/AboutUsCMS.model");
const { z } = require("zod");

// Validation Schemas
const bannerSchema = z.object({
  bannerImage: z.string().optional().default(""),
  bannerLabel: z.string().optional().default(""),
  bannerTitle: z.string().min(1, "bannerTitle is required"),
  bannerDescription: z.string().optional().default(""),
  showSection: z
    .preprocess((v) => v === "true" || v === true, z.boolean())
    .optional()
    .default(true),
});

const stewardshipSchema = z.object({
  eyebrow: z.string().optional().default(""),
  heading: z.string().min(1, "heading is required"),
  description: z.string().optional().default(""),
  quote: z.string().optional().default(""),
  badgeNumber: z.string().optional().default(""),
  badgeText: z.string().optional().default(""),
  image: z.string().optional().default(""),
  showSection: z
    .preprocess((v) => v === "true" || v === true, z.boolean())
    .optional()
    .default(true),
});

const journeySchema = z.object({
  eyebrow: z.string().optional().default(""),
  heading: z.string().min(1, "heading is required"),
  steps: z.string().optional().default(""),
  imageSet: z.string().optional().default(""),
  showSection: z
    .preprocess((v) => v === "true" || v === true, z.boolean())
    .optional()
    .default(true),
});

const quoteSchema = z.object({
  quote: z.string().min(1, "quote is required"),
  author: z.string().optional().default(""),
  showSection: z
    .preprocess((v) => v === "true" || v === true, z.boolean())
    .optional()
    .default(true),
});

const charterSchema = z.object({
  heading: z.string().min(1, "heading is required"),
  description: z.string().optional().default(""),
  reportLabel: z.string().optional().default(""),
  reportHref: z.string().optional().default(""),
  charters: z.string().optional().default(""),
  showSection: z
    .preprocess((v) => v === "true" || v === true, z.boolean())
    .optional()
    .default(true),
});

const uploadImageToImageKit = async (file, folder = "/crunchveda/about-us") => {
  if (!file) return null;

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint =
    process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dummy/";

  if (
    !publicKey ||
    !privateKey ||
    publicKey === "your_imagekit_public_key" ||
    privateKey === "your_imagekit_private_key"
  ) {
    const error = new Error(
      "ImageKit credentials are not configured. Please define valid IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY in your .env file.",
    );
    error.statusCode = 500;
    throw error;
  }

  const ImageKit = require("imagekit");
  const ik = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });

  const uploadResponse = await ik.upload({
    file: file.buffer,
    fileName: `about_us_${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`,
    folder: folder,
  });

  return uploadResponse.url;
};

const handleZodError = (error, res, next) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      status: "fail",
      message: error.message,
    });
  }

  return next(error);
};

// 1. GET ALL PAGE DATA
exports.getAboutUsPage = async (req, res, next) => {
  try {
    let page = await AboutUsCMS.findOne({ key: "about-us" });
    if (!page) {
      page = await AboutUsCMS.create({
        key: "about-us",
        banner: {
          bannerImage: "",
          bannerLabel: "",
          bannerTitle: "Cultivating Legacy Through the Seasons",
          bannerDescription:
            "A century of dedication to the soil, the seed, and the harvest.",
          showSection: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: "about-us",
        title: "About Us CMS Page",
        records: [
          {
            id: "about-banner",
            title: "About Hero Banner",
            type: "Hero section",
            status: "Published",
            fields: [
              {
                id: "eyebrow",
                label: "Hero subtitle",
                type: "text",
                value: page.banner.bannerLabel || "",
              },
              {
                id: "headline",
                label: "H1 headline",
                type: "text",
                value: page.banner.bannerTitle || "",
              },
              {
                id: "description",
                label: "Hero paragraph",
                type: "textarea",
                value: page.banner.bannerDescription || "",
              },
              {
                id: "image",
                label: "Hero image",
                type: "image",
                value: page.banner.bannerImage || "",
              },
              {
                id: "showSection",
                label: "Show section",
                type: "toggle",
                value: page.banner.showSection !== false,
              },
            ],
          },
          {
            id: "about-stewardship",
            title: "roots section",
            type: "Roots content",
            status: "Published",
            fields: [
              {
                id: "eyebrow",
                label: "Eyebrow",
                type: "text",
                value: page.stewardship.eyebrow || "",
              },
              {
                id: "heading",
                label: "Heading",
                type: "text",
                value: page.stewardship.heading || "",
              },
              {
                id: "description",
                label: "Description",
                type: "textarea",
                value: page.stewardship.description || "",
              },
              {
                id: "quote",
                label: "Quote",
                type: "textarea",
                value: page.stewardship.quote || "",
              },
              {
                id: "badgeNumber",
                label: "Badge Number",
                type: "text",
                value: page.stewardship.badgeNumber || "",
              },
              {
                id: "badgeText",
                label: "Badge Text",
                type: "text",
                value: page.stewardship.badgeText || "",
              },
              {
                id: "image",
                label: "Image",
                type: "image",
                value: page.stewardship.image || "",
              },
              {
                id: "showSection",
                label: "Show section",
                type: "toggle",
                value: page.stewardship.showSection !== false,
              },
            ],
          },
          {
            id: "about-journey",
            title: "artisanal journey",
            type: "Artisanal content",
            status: "Published",
            fields: [
              {
                id: "eyebrow",
                label: "Eyebrow",
                type: "text",
                value: page.journey.eyebrow || "",
              },
              {
                id: "heading",
                label: "Heading",
                type: "text",
                value: page.journey.heading || "",
              },
              {
                id: "steps",
                label: "Steps (Title|Desc)",
                type: "textarea",
                value: page.journey.steps || "",
              },
              {
                id: "imageSet",
                label: "Images (Newline separated)",
                type: "textarea",
                value: page.journey.imageSet || "",
              },
              {
                id: "showSection",
                label: "Show section",
                type: "toggle",
                value: page.journey.showSection !== false,
              },
            ],
          },
          {
            id: "about-quote",
            title: "quote section",
            type: "Quote content",
            status: "Published",
            fields: [
              {
                id: "quote",
                label: "Quote",
                type: "textarea",
                value: page.quote.quote || "",
              },
              {
                id: "author",
                label: "Author",
                type: "text",
                value: page.quote.author || "",
              },
              {
                id: "showSection",
                label: "Show section",
                type: "toggle",
                value: page.quote.showSection !== false,
              },
            ],
          },
          {
            id: "about-charter",
            title: "sustainability charter",
            type: "Charter content",
            status: "Published",
            fields: [
              {
                id: "heading",
                label: "Heading",
                type: "text",
                value: page.charter.heading || "",
              },
              {
                id: "description",
                label: "Description",
                type: "textarea",
                value: page.charter.description || "",
              },
              {
                id: "reportLabel",
                label: "Report CTA Label",
                type: "text",
                value: page.charter.reportLabel || "",
              },
              {
                id: "reportHref",
                label: "Report Link",
                type: "text",
                value: page.charter.reportHref || "",
              },
              {
                id: "charters",
                label: "Charters (Title|Desc)",
                type: "textarea",
                value: page.charter.charters || "",
              },
              {
                id: "showSection",
                label: "Show section",
                type: "toggle",
                value: page.charter.showSection !== false,
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET SECTION: Banner
exports.getBanner = async (req, res, next) => {
  try {
    const page = await AboutUsCMS.findOne({ key: "about-us" });
    res.status(200).json({
      status: "success",
      data: { banner: page?.banner || {} },
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET SECTION: Stewardship
exports.getStewardship = async (req, res, next) => {
  try {
    const page = await AboutUsCMS.findOne({ key: "about-us" });
    res.status(200).json({
      status: "success",
      data: { stewardship: page?.stewardship || {} },
    });
  } catch (error) {
    next(error);
  }
};

// 4. GET SECTION: Journey
exports.getJourney = async (req, res, next) => {
  try {
    const page = await AboutUsCMS.findOne({ key: "about-us" });
    res.status(200).json({
      status: "success",
      data: { journey: page?.journey || {} },
    });
  } catch (error) {
    next(error);
  }
};

// 5. GET SECTION: Quote
exports.getQuote = async (req, res, next) => {
  try {
    const page = await AboutUsCMS.findOne({ key: "about-us" });
    res.status(200).json({
      status: "success",
      data: { quote: page?.quote || {} },
    });
  } catch (error) {
    next(error);
  }
};

// 6. GET SECTION: Charter
exports.getCharter = async (req, res, next) => {
  try {
    const page = await AboutUsCMS.findOne({ key: "about-us" });
    res.status(200).json({
      status: "success",
      data: { charter: page?.charter || {} },
    });
  } catch (error) {
    next(error);
  }
};

// 7. UPDATE SECTION: Banner
exports.updateBanner = async (req, res, next) => {
  try {
    const parsedData = bannerSchema.parse(req.body);
    let imageUrl = parsedData.bannerImage;

    if (req.file) {
      imageUrl = await uploadImageToImageKit(req.file);
    }

    if (!imageUrl) {
      const existing = await AboutUsCMS.findOne({ key: "about-us" });
      if (existing && existing.banner && existing.banner.bannerImage) {
        imageUrl = existing.banner.bannerImage;
      }
    }

    const page = await AboutUsCMS.findOneAndUpdate(
      { key: "about-us" },
      {
        $set: {
          banner: {
            bannerImage: imageUrl || "",
            bannerLabel: parsedData.bannerLabel,
            bannerTitle: parsedData.bannerTitle,
            bannerDescription: parsedData.bannerDescription,
            showSection: parsedData.showSection,
          },
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: "Banner updated successfully.",
      data: { banner: page.banner },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

// 8. UPDATE SECTION: Stewardship
exports.updateStewardship = async (req, res, next) => {
  try {
    const parsedData = stewardshipSchema.parse(req.body);
    let imageUrl = parsedData.image;

    if (req.file) {
      imageUrl = await uploadImageToImageKit(req.file);
    }

    if (!imageUrl) {
      const existing = await AboutUsCMS.findOne({ key: "about-us" });
      if (existing && existing.stewardship && existing.stewardship.image) {
        imageUrl = existing.stewardship.image;
      }
    }

    const page = await AboutUsCMS.findOneAndUpdate(
      { key: "about-us" },
      {
        $set: {
          stewardship: {
            eyebrow: parsedData.eyebrow,
            heading: parsedData.heading,
            description: parsedData.description,
            quote: parsedData.quote,
            badgeNumber: parsedData.badgeNumber,
            badgeText: parsedData.badgeText,
            image: imageUrl || "",
            showSection: parsedData.showSection,
          },
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: "Stewardship updated successfully.",
      data: { stewardship: page.stewardship },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

// 9. UPDATE SECTION: Journey
exports.updateJourney = async (req, res, next) => {
  try {
    const parsedData = journeySchema.parse(req.body);

    const page = await AboutUsCMS.findOneAndUpdate(
      { key: "about-us" },
      {
        $set: {
          journey: {
            eyebrow: parsedData.eyebrow,
            heading: parsedData.heading,
            steps: parsedData.steps,
            imageSet: parsedData.imageSet,
            showSection: parsedData.showSection,
          },
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: "Journey updated successfully.",
      data: { journey: page.journey },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

// 10. UPDATE SECTION: Quote
exports.updateQuote = async (req, res, next) => {
  try {
    const parsedData = quoteSchema.parse(req.body);

    const page = await AboutUsCMS.findOneAndUpdate(
      { key: "about-us" },
      {
        $set: {
          quote: {
            quote: parsedData.quote,
            author: parsedData.author,
            showSection: parsedData.showSection,
          },
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: "Quote updated successfully.",
      data: { quote: page.quote },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

// 11. UPDATE SECTION: Charter
exports.updateCharter = async (req, res, next) => {
  try {
    const parsedData = charterSchema.parse(req.body);

    const page = await AboutUsCMS.findOneAndUpdate(
      { key: "about-us" },
      {
        $set: {
          charter: {
            heading: parsedData.heading,
            description: parsedData.description,
            reportLabel: parsedData.reportLabel,
            reportHref: parsedData.reportHref,
            charters: parsedData.charters,
            showSection: parsedData.showSection,
          },
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: "Charter updated successfully.",
      data: { charter: page.charter },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};
