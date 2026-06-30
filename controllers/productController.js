const Product = require('../models/Product');
const Category = require('../models/Category.model');
const mongoose = require('mongoose');

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
          name: { $regex: new RegExp(`^${category}$`, 'i') },
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
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive matching
    }

    const products = await Product.find(query).populate('category');

    res.status(200).json({
      status: 'success',
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
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'No product found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
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
    const { name, description, price, category, stock, image } = req.body;

    if (!category) {
      return res.status(400).json({
        status: 'fail',
        message: 'Category is required',
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'Selected category does not exist in the database.',
      });
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      image,
    });

    const populatedProduct = await Product.findById(newProduct._id).populate('category');

    res.status(201).json({
      status: 'success',
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
    const { category } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          status: 'fail',
          message: 'Selected category does not exist in the database.',
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category');

    if (!updatedProduct) {
      return res.status(404).json({
        status: 'fail',
        message: 'No product found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
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
        status: 'fail',
        message: 'No product found with that ID',
      });
    }

    res.status(204).json({
      status: 'success',
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
    const categoryNames = categories.map(cat => cat.name);

    res.status(200).json({
      status: 'success',
      data: {
        categories: categoryNames,
      },
    });
  } catch (error) {
    next(error);
  }
};
