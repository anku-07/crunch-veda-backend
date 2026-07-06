const Product = require("../models/Product");
const Category = require("../models/Category.model");
const mongoose = require("mongoose");

const normalizeArrayField = (value) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (error) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return value;
};

const normalizeBooleanField = (value) => {
  if (typeof value !== "string") return value;
  return value.toLowerCase() === "true";
};

const normalizeObjectField = (value) => {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return value;

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    return value;
  }

  return value;
};

const uploadProductImages = async (files = []) => {
  if (!files.length) return [];

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

  const uploads = await Promise.all(
    files.map((file) =>
      ik.upload({
        file: file.buffer,
        fileName: `product_${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`,
        folder: "/crunchveda/products",
      }),
    ),
  );

  return uploads.map((uploadResponse) => uploadResponse.url);
};

// 1. GET ALL PRODUCTS
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = {};

    // Filter by category if provided
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const matchedCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${category}$`, "i") },
        });
        if (matchedCategory) {
          query.category = matchedCategory._id;
        } else {
          query.category = new mongoose.Types.ObjectId();
        }
      }
    }

    // Search by name if search query provided
    if (search) {
      query.name = { $regex: search, $options: "i" }; // Case-insensitive matching
    }

    const products = await Product.find(query).populate("category");

    res.status(200).json({
      status: "success",
      results: products.length,
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET SINGLE PRODUCT BY ID
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "No product found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. CREATE PRODUCT (Admin only)
exports.createProduct = async (req, res, next) => {
  try {
    const body = req.body || {};
    const uploadedImages = await uploadProductImages(req.files);
    const requestImages = normalizeArrayField(body.images);
    const images = uploadedImages.length ? uploadedImages : requestImages;
    const prices = normalizeArrayField(body.prices);
    const isBestseller = normalizeBooleanField(body.isBestseller);
    const rating = normalizeObjectField(body.rating);
    const { name, description, category, stock, badge } = body;

    if (!category) {
      return res.status(400).json({
        status: "fail",
        message: "Category is required",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        status: "fail",
        message: "Selected category does not exist in the database.",
      });
    }

    const newProduct = await Product.create({
      name,
      description,
      isBestseller,
      prices,
      category,
      stock,
      images,
      rating,
      badge,
    });

    const populatedProduct = await Product.findById(newProduct._id).populate(
      "category",
    );

    res.status(201).json({
      status: "success",
      data: {
        product: populatedProduct,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE PRODUCT (Admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const body = req.body || {};
    const { category } = body;

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          status: "fail",
          message: "Selected category does not exist in the database.",
        });
      }
    }

    const payload = { ...body };
    const uploadedImages = await uploadProductImages(req.files);
    const requestImages = normalizeArrayField(body.images);

    if (uploadedImages.length) {
      payload.images = uploadedImages;
    } else if (requestImages !== undefined) {
      payload.images = requestImages;
    }

    if (body.prices !== undefined) {
      payload.prices = normalizeArrayField(body.prices);
    }

    if (body.isBestseller !== undefined) {
      payload.isBestseller = normalizeBooleanField(body.isBestseller);
    }

    if (body.rating !== undefined) {
      payload.rating = normalizeObjectField(body.rating);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true,
      },
    ).populate("category");

    if (!updatedProduct) {
      return res.status(404).json({
        status: "fail",
        message: "No product found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        product: updatedProduct,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE PRODUCT (Admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "No product found with that ID",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// 6. GET DISTINCT PRODUCT CATEGORIES
exports.getProductCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    const categoryNames = categories.map((cat) => cat.name);

    res.status(200).json({
      status: "success",
      data: {
        categories: categoryNames,
      },
    });
  } catch (error) {
    next(error);
  }
};
