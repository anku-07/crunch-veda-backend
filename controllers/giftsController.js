const GiftsCMS = require("../models/GiftsCMS.model");
const { z } = require("zod");

// ── Helpers ──────────────────────────────────────────────────────────────────

const parseJSONField = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const uploadImageToImageKit = async (file, folder = "/crunchveda/gifts") => {
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
    fileName: `gifts_${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`,
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

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const bannerSchema = z.object({
  bannerLabel: z.string().optional().default(""),
  bannerTitle: z.string().min(1, "bannerTitle is required"),
  bannerDescription: z.string().optional().default(""),
});

const giftCollectionsSchema = z.object({
  sectionTitle: z.string().min(1, "sectionTitle is required"),
  sectionButtonText: z.string().optional().default(""),
  sectionButtonLink: z.string().optional().default(""),
  collections: z.preprocess(
    (val) => parseJSONField(val),
    z
      .array(
        z.object({
          image: z.string().optional().default(""),
          label: z.string().optional().default(""),
          title: z.string().optional().default(""),
          description: z.string().optional().default(""),
          buttonText: z.string().optional().default(""),
          buttonLink: z.string().optional().default(""),
        }),
      )
      .default([]),
  ),
});

const customChestSchema = z.object({
  sectionLabel: z.string().optional().default(""),
  sectionTitle: z.string().min(1, "sectionTitle is required"),
  sectionDescription: z.string().optional().default(""),
  buttonText: z.string().optional().default(""),
  buttonLink: z.string().optional().default(""),
  backgroundImage: z.string().optional(),
});

const giftProductsSchema = z.object({
  categories: z.preprocess(
    (val) => parseJSONField(val),
    z
      .array(
        z.object({
          categoryTitle: z.string().optional().default(""),
          products: z
            .array(
              z.object({
                image: z.string().optional().default(""),
                title: z.string().optional().default(""),
                description: z.string().optional().default(""),
                price: z.string().optional().default(""),
              }),
            )
            .default([]),
        }),
      )
      .default([]),
  ),
});

// ── 1. GET GIFTS PAGE DATA (Public) ─────────────────────────────────────────

exports.getGiftsPage = async (req, res, next) => {
  try {
    let page = await GiftsCMS.findOne({ key: "gifts" });

    if (!page) {
      page = await GiftsCMS.create({
        key: "gifts",
        banner: {
          bannerLabel: "",
          bannerTitle: "",
          bannerDescription: "",
        },
      });
    }

    res.status(200).json({
      banner: {
        bannerLabel: page.banner.bannerLabel || "",
        bannerTitle: page.banner.bannerTitle || "",
        bannerDescription: page.banner.bannerDescription || "",
      },
      giftCollections: {
        sectionTitle: page.giftCollections?.sectionTitle || "",
        sectionButtonText: page.giftCollections?.sectionButtonText || "",
        sectionButtonLink: page.giftCollections?.sectionButtonLink || "",
        collections: page.giftCollections?.collections || [],
      },
      customChest: {
        sectionLabel: page.customChest?.sectionLabel || "",
        sectionTitle: page.customChest?.sectionTitle || "",
        sectionDescription: page.customChest?.sectionDescription || "",
        buttonText: page.customChest?.buttonText || "",
        buttonLink: page.customChest?.buttonLink || "",
        backgroundImage: page.customChest?.backgroundImage || "",
      },
      giftProducts: {
        categories: page.giftProducts?.categories || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 2. UPDATE BANNER SECTION (Admin Only) ───────────────────────────────────

exports.updateBanner = async (req, res, next) => {
  try {
    const parsedData = bannerSchema.parse(req.body);

    const page = await GiftsCMS.findOneAndUpdate(
      { key: "gifts" },
      {
        $set: {
          banner: {
            bannerLabel: parsedData.bannerLabel,
            bannerTitle: parsedData.bannerTitle,
            bannerDescription: parsedData.bannerDescription,
          },
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: "Gifts banner updated successfully.",
      data: {
        banner: page.banner,
      },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

// ── 3. UPDATE GIFT COLLECTIONS SECTION (Admin Only) ─────────────────────────

exports.updateGiftCollections = async (req, res, next) => {
  try {
    const parsedData = giftCollectionsSchema.parse(req.body);

    const existingPage = await GiftsCMS.findOne({ key: "gifts" });
    const existingCollections =
      existingPage?.giftCollections?.collections || [];

    const arrayFiles = (req.files || []).filter(
      (f) => f.fieldname === "images" || f.fieldname === "collection_images",
    );

    const updatedCollections = await Promise.all(
      parsedData.collections.map(async (collection, index) => {
        const file = (req.files || []).find(
          (f) =>
            f.fieldname === `collection_image_${index}` ||
            f.fieldname === `collections[${index}][image]` ||
            f.fieldname === `collections[${index}].image` ||
            f.fieldname === `image_${index}`,
        );

        const fallbackFile = file || arrayFiles[index];

        let imageUrl = collection.image;

        if (fallbackFile) {
          imageUrl = await uploadImageToImageKit(fallbackFile);
        } else if (!imageUrl) {
          imageUrl = existingCollections[index]?.image || "";
        }

        return {
          image: imageUrl,
          label: collection.label,
          title: collection.title,
          description: collection.description,
          buttonText: collection.buttonText,
          buttonLink: collection.buttonLink,
        };
      }),
    );

    const page = await GiftsCMS.findOneAndUpdate(
      { key: "gifts" },
      {
        $set: {
          giftCollections: {
            sectionTitle: parsedData.sectionTitle,
            sectionButtonText: parsedData.sectionButtonText,
            sectionButtonLink: parsedData.sectionButtonLink,
            collections: updatedCollections,
          },
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: "Gift collections updated successfully.",
      data: {
        giftCollections: page.giftCollections,
      },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

// ── 4. UPDATE CUSTOM CHEST SECTION (Admin Only) ─────────────────────────────

exports.updateCustomChest = async (req, res, next) => {
  try {
    const parsedData = customChestSchema.parse(req.body);

    let imageUrl = parsedData.backgroundImage;

    if (req.file) {
      imageUrl = await uploadImageToImageKit(req.file);
    }

    if (!imageUrl) {
      const existing = await GiftsCMS.findOne({ key: "gifts" });
      if (
        existing &&
        existing.customChest &&
        existing.customChest.backgroundImage
      ) {
        imageUrl = existing.customChest.backgroundImage;
      }
    }

    const page = await GiftsCMS.findOneAndUpdate(
      { key: "gifts" },
      {
        $set: {
          customChest: {
            sectionLabel: parsedData.sectionLabel,
            sectionTitle: parsedData.sectionTitle,
            sectionDescription: parsedData.sectionDescription,
            buttonText: parsedData.buttonText,
            buttonLink: parsedData.buttonLink,
            backgroundImage: imageUrl || "",
          },
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: "Custom chest section updated successfully.",
      data: {
        customChest: page.customChest,
      },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

// ── 5. UPDATE GIFT PRODUCTS SECTION (Admin Only) ────────────────────────────

exports.updateGiftProducts = async (req, res, next) => {
  try {
    const parsedData = giftProductsSchema.parse(req.body);

    const existingPage = await GiftsCMS.findOne({ key: "gifts" });
    const existingCategories = existingPage?.giftProducts?.categories || [];

    const updatedCategories = await Promise.all(
      parsedData.categories.map(async (category, catIndex) => {
        const updatedProducts = await Promise.all(
          category.products.map(async (product, prodIndex) => {
            // Match file by fieldname pattern: product_image_{catIndex}_{prodIndex}
            const file = (req.files || []).find(
              (f) =>
                f.fieldname === `product_image_${catIndex}_${prodIndex}` ||
                f.fieldname ===
                  `categories[${catIndex}][products][${prodIndex}][image]` ||
                f.fieldname ===
                  `categories[${catIndex}].products[${prodIndex}].image`,
            );

            let imageUrl = product.image;

            if (file) {
              imageUrl = await uploadImageToImageKit(file);
            } else if (!imageUrl) {
              imageUrl =
                existingCategories[catIndex]?.products?.[prodIndex]?.image ||
                "";
            }

            return {
              image: imageUrl,
              title: product.title,
              description: product.description,
              price: product.price,
            };
          }),
        );

        return {
          categoryTitle: category.categoryTitle,
          products: updatedProducts,
        };
      }),
    );

    const page = await GiftsCMS.findOneAndUpdate(
      { key: "gifts" },
      {
        $set: {
          giftProducts: {
            categories: updatedCategories,
          },
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: "Gift products updated successfully.",
      data: {
        giftProducts: page.giftProducts,
      },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};
