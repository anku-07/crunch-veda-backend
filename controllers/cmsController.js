const CMS = require("../models/CMS.model");
const HomepageCMS = require("../models/HomepageCMS.model");
const Product = require("../models/Product");
const Category = require("../models/Category.model");
const { z } = require("zod");

const parseJSONField = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const arrayField = (schema) =>
  z.preprocess((value) => {
    const parsed = parseJSONField(value);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "string") {
      return parsed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return parsed;
  }, z.array(schema));

// Validation Schemas
const homeBannerSchema = z.object({
  bannerImage: z.string().optional(),
  bannerVideo: z.string().optional().default(""),
  bannerSubTitle: z.string().optional().default(""),
  bannerTitle: z.string().min(1, "bannerTitle is required"),
  bannerDescription: z.string().optional().default(""),
});

const categorySectionSchema = z.object({
  categoryTitle: z.string().min(1, "categoryTitle is required"),
});

const bestSellerSchema = z.object({
  sectionTitle: z.string().min(1, "sectionTitle is required"),
  selectedProducts: arrayField(
    z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID format"),
  ),
});

const featureSectionSchema = z.object({
  features: arrayField(
    z.object({
      icon: z.string().optional().default(""),
      title: z.string().optional().default(""),
      description: z.string().optional().default(""),
    }),
  ).default([]),
});

const giftBoxSectionSchema = z.object({
  sectionLabel: z.string().optional().default(""),
  sectionTitle: z.string().optional().default(""),
  sectionDescription: z.string().optional().default(""),
  buttonText: z.string().optional().default(""),
  buttonLink: z.string().optional().default(""),
  backgroundImage: z.string().optional().default(""),
});

const nutritionHighlightsSectionSchema = z.object({
  items: arrayField(
    z.object({
      sectionLabel: z.string().optional().default(""),
      sectionTitle: z.string().optional().default(""),
      sectionDescription: z.string().optional().default(""),
      highlights: arrayField(z.string()).default([]),
      image: z.string().optional().default(""),
      imagePosition: z.enum(["left", "right"]).optional().default("right"),
    }),
  ).default([]),
});

const heritageJourneySectionSchema = z.object({
  sectionTitle: z.string().optional().default(""),
  sectionDescription: z.string().optional().default(""),
  milestones: arrayField(
    z.object({
      year: z.string().optional().default(""),
      title: z.string().optional().default(""),
      description: z.string().optional().default(""),
    }),
  ).default([]),
});

const faqSectionSchema = z.object({
  sectionTitle: z.string().optional().default(""),
  faqs: arrayField(
    z.object({
      question: z.string().optional().default(""),
      answer: z.string().optional().default(""),
    }),
  ).default([]),
});

const reelsSectionSchema = z.object({
  sectionTitle: z.string().optional().default(""),
  sectionDescription: z.string().optional().default(""),
  reels: arrayField(
    z.object({
      reelsVideo: z.string().optional().default(""),
      reelsImage: z.string().optional().default(""),
    }),
  ).default([]),
});

const updateHomepageSection = async (sectionName, schema, body) => {
  if (!body) {
    const error = new Error(
      "Request body is missing. Send JSON with Content-Type application/json, or form-data fields.",
    );
    error.statusCode = 400;
    throw error;
  }

  const parsedData = schema.parse(body);
  return HomepageCMS.findOneAndUpdate(
    { key: "homepage" },
    { $set: { [sectionName]: parsedData } },
    { new: true, upsert: true, runValidators: true },
  );
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

// 1. GET CMS DATA (Public)
exports.getCMSData = async (req, res, next) => {
  try {
    let cms = await CMS.findOne({ key: "general" });
    if (!cms) {
      // If it doesn't exist for some reason, create default
      cms = await CMS.create({ key: "general" });
    }
    res.status(200).json({
      status: "success",
      data: {
        cms,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. UPDATE CMS DATA (Admin Only)
exports.updateCMSData = async (req, res, next) => {
  try {
    // Finds 'general' document, applies body updates, performs upsert if not found, runs validations, returns updated doc
    const updatedCMS = await CMS.findOneAndUpdate(
      { key: "general" },
      { $set: req.body },
      { new: true, runValidators: true, upsert: true },
    );

    res.status(200).json({
      status: "success",
      message: "CMS sections updated successfully.",
      data: {
        cms: updatedCMS,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET HOMEPAGE CMS DATA (Public)
exports.getHomepageCMS = async (req, res, next) => {
  try {
    let homepage = await HomepageCMS.findOne({ key: "homepage" }).populate(
      "bestSellerSection.selectedProducts",
    );
    let bestSellerproducts = await Product.find({
      isBestseller: true,
    }).populate("category");
    if (!homepage) {
      // If it doesn't exist, create default
      homepage = await HomepageCMS.create({
        key: "homepage",
        homeBanner: {
          bannerImage: "",
          bannerVideo: "",
          bannerSubTitle: "",
          bannerTitle: "",
          bannerDescription: "",
        },
        categorySection: {
          categoryTitle: "",
        },
        bestSellerSection: {
          sectionTitle: "",
          selectedProducts: [],
        },
        featureSection: {
          features: [],
        },
        giftBoxSection: {
          sectionLabel: "",
          sectionTitle: "",
          sectionDescription: "",
          buttonText: "",
          buttonLink: "",
          backgroundImage: "",
        },
        nutritionHighlightsSection: {
          items: [],
        },
        heritageJourneySection: {
          sectionTitle: "",
          sectionDescription: "",
          milestones: [],
        },
        faqSection: {
          sectionTitle: "",
          faqs: [],
        },
        reelsSection: {
          sectionTitle: "",
          sectionDescription: "",
          reels: [],
        },
      });
    }

    // Fetch categories dynamically from the Category collection
    const categoriesList = await Category.find().sort({ name: 1 });
    const categories = categoriesList.map((cat) => ({
      name: cat.name,
      image: cat.image || "",
    }));

    // Return the exact JSON structure required
    res.status(200).json({
      homeBanner: {
        bannerImage: homepage.homeBanner.bannerImage || "",
        bannerVideo: homepage.homeBanner.bannerVideo || "",
        bannerSubTitle: homepage.homeBanner.bannerSubTitle || "",
        bannerTitle: homepage.homeBanner.bannerTitle || "",
        bannerDescription: homepage.homeBanner.bannerDescription || "",
      },
      categorySection: {
        categoryTitle: homepage.categorySection.categoryTitle || "",
        categoryList: categories,
      },
      bestSellerSection: {
        sectionTitle: homepage.bestSellerSection.sectionTitle || "",
        selectedProducts: bestSellerproducts || [],
      },
      featureSection: {
        features: homepage.featureSection?.features || [],
      },
      giftBoxSection: {
        sectionLabel: homepage.giftBoxSection?.sectionLabel || "",
        sectionTitle: homepage.giftBoxSection?.sectionTitle || "",
        sectionDescription: homepage.giftBoxSection?.sectionDescription || "",
        buttonText: homepage.giftBoxSection?.buttonText || "",
        buttonLink: homepage.giftBoxSection?.buttonLink || "",
        backgroundImage: homepage.giftBoxSection?.backgroundImage || "",
      },
      nutritionHighlightsSection: {
        items: homepage.nutritionHighlightsSection?.items || [],
      },
      heritageJourneySection: {
        sectionTitle: homepage.heritageJourneySection?.sectionTitle || "",
        sectionDescription:
          homepage.heritageJourneySection?.sectionDescription || "",
        milestones: homepage.heritageJourneySection?.milestones || [],
      },
      faqSection: {
        sectionTitle: homepage.faqSection?.sectionTitle || "",
        faqs: homepage.faqSection?.faqs || [],
      },
      reelsSection: {
        sectionTitle: homepage.reelsSection?.sectionTitle || "",
        sectionDescription: homepage.reelsSection?.sectionDescription || "",
        reels: homepage.reelsSection?.reels || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE HOME BANNER (Admin Only)
exports.updateHomeBanner = async (req, res, next) => {
  try {
    const parsedData = homeBannerSchema.parse(req.body);

    let imageUrl = parsedData.bannerImage;

    // If a file is uploaded, upload it to ImageKit
    if (req.file) {
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
        return res.status(500).json({
          status: "error",
          message:
            "ImageKit credentials are not configured. Please define valid IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY in your .env file.",
        });
      }

      const ImageKit = require("imagekit");
      const ik = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint,
      });

      const uploadResponse = await ik.upload({
        file: req.file.buffer,
        fileName: `banner_${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`,
        folder: "/crunchveda/banners",
      });
      imageUrl = uploadResponse.url;
    }

    // Fallback: if no new file is uploaded and no URL is provided in the body, try to retain the existing image
    if (!imageUrl) {
      const existing = await HomepageCMS.findOne({ key: "homepage" });
      if (existing && existing.homeBanner && existing.homeBanner.bannerImage) {
        imageUrl = existing.homeBanner.bannerImage;
      } else {
        return res.status(400).json({
          status: "fail",
          message:
            'Banner image is required (upload an image file with key "image" or provide a bannerImage URL).',
        });
      }
    }

    const homepage = await HomepageCMS.findOneAndUpdate(
      { key: "homepage" },
      {
        $set: {
          homeBanner: {
            bannerImage: imageUrl,
            bannerVideo: parsedData.bannerVideo,
            bannerSubTitle: parsedData.bannerSubTitle,
            bannerTitle: parsedData.bannerTitle,
            bannerDescription: parsedData.bannerDescription,
          },
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: "Home banner updated successfully.",
      data: {
        homeBanner: homepage.homeBanner,
      },
    });
  } catch (error) {
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
    next(error);
  }
};

// 5. UPDATE CATEGORY SECTION (Admin Only)
exports.updateCategorySection = async (req, res, next) => {
  try {
    const parsedData = categorySectionSchema.parse(req.body);

    const homepage = await HomepageCMS.findOneAndUpdate(
      { key: "homepage" },
      { $set: { categorySection: parsedData } },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: "Category section updated successfully.",
      data: {
        categorySection: homepage.categorySection,
      },
    });
  } catch (error) {
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
    next(error);
  }
};

// 6. UPDATE BEST SELLER SECTION (Admin Only)
exports.updateBestSeller = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: "fail",
        message:
          "Request body is missing. Send JSON with Content-Type application/json, or form-data fields.",
      });
    }

    const parsedData = bestSellerSchema.parse(req.body);

    // Verify all selected products exist in the database
    const { selectedProducts } = parsedData;
    if (selectedProducts.length > 0) {
      const existingCount = await Product.countDocuments({
        _id: { $in: selectedProducts },
      });
      if (existingCount !== selectedProducts.length) {
        return res.status(400).json({
          status: "fail",
          message:
            "One or more selected products do not exist in the database.",
        });
      }
    }

    const homepage = await HomepageCMS.findOneAndUpdate(
      { key: "homepage" },
      { $set: { bestSellerSection: parsedData } },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: "Best seller section updated successfully.",
      data: {
        bestSellerSection: homepage.bestSellerSection,
      },
    });
  } catch (error) {
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
    next(error);
  }
};

// 7. UPDATE FEATURE SECTION (Admin Only)
exports.updateFeatureSection = async (req, res, next) => {
  try {
    const homepage = await updateHomepageSection(
      "featureSection",
      featureSectionSchema,
      req.body,
    );

    res.status(200).json({
      status: "success",
      message: "Feature section updated successfully.",
      data: {
        featureSection: homepage.featureSection,
      },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

// 8. UPDATE GIFT BOX SECTION (Admin Only)
exports.updateGiftBoxSection = async (req, res, next) => {
  try {
    const homepage = await updateHomepageSection(
      "giftBoxSection",
      giftBoxSectionSchema,
      req.body,
    );

    res.status(200).json({
      status: "success",
      message: "Gift box section updated successfully.",
      data: {
        giftBoxSection: homepage.giftBoxSection,
      },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

// 9. UPDATE NUTRITION HIGHLIGHTS SECTION (Admin Only)
exports.updateNutritionHighlightsSection = async (req, res, next) => {
  try {
    const homepage = await updateHomepageSection(
      "nutritionHighlightsSection",
      nutritionHighlightsSectionSchema,
      req.body,
    );

    res.status(200).json({
      status: "success",
      message: "Nutrition highlights section updated successfully.",
      data: {
        nutritionHighlightsSection: homepage.nutritionHighlightsSection,
      },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

// 10. UPDATE HERITAGE JOURNEY SECTION (Admin Only)
exports.updateHeritageJourneySection = async (req, res, next) => {
  try {
    const homepage = await updateHomepageSection(
      "heritageJourneySection",
      heritageJourneySectionSchema,
      req.body,
    );

    res.status(200).json({
      status: "success",
      message: "Heritage journey section updated successfully.",
      data: {
        heritageJourneySection: homepage.heritageJourneySection,
      },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

// 11. UPDATE FAQ SECTION (Admin Only)
exports.updateFaqSection = async (req, res, next) => {
  try {
    const homepage = await updateHomepageSection(
      "faqSection",
      faqSectionSchema,
      req.body,
    );

    res.status(200).json({
      status: "success",
      message: "FAQ section updated successfully.",
      data: {
        faqSection: homepage.faqSection,
      },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

exports.updateReelsSection = async (req, res, next) => {
  try {
    console.log(
      "📥 [updateReelsSection] req.body:",
      JSON.stringify(req.body, null, 2),
    );

    if (!req.body) {
      return res.status(400).json({
        status: "fail",
        message:
          "Request body is missing. Send JSON with Content-Type application/json, or form-data fields.",
      });
    }

    console.log("⚙️ [updateReelsSection] Parsing with Zod schema...");
    const parsedData = reelsSectionSchema.parse(req.body);
    console.log(
      "✅ [updateReelsSection] Zod parsing succeeded:",
      JSON.stringify(parsedData, null, 2),
    );

    console.log("💾 [updateReelsSection] Saving to database...");
    const homepage = await HomepageCMS.findOneAndUpdate(
      { key: "homepage" },
      { $set: { reelsSection: parsedData } },
      { new: true, upsert: true, runValidators: true },
    );
    console.log(
      "🎉 [updateReelsSection] Saved successfully. reelsSection:",
      JSON.stringify(homepage?.reelsSection, null, 2),
    );

    res.status(200).json({
      status: "success",
      message: "Reels section updated successfully.",
      data: {
        reelsSection: homepage.reelsSection,
      },
    });
  } catch (error) {
    console.error("❌ [updateReelsSection] Error caught:", error);
    return handleZodError(error, res, next);
  }
};
