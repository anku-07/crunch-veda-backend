const Category = require('../models/Category.model');
const { z } = require('zod');

const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
});

const categoryUpdateSchema = z.object({
  name: z.string().min(1, 'Category name cannot be empty').max(100).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

// 1. GET ALL CATEGORIES
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. CREATE CATEGORY (Admin Only)
exports.createCategory = async (req, res, next) => {
  try {
    let imageUrl = req.body.image || '';

    // If a file is uploaded, upload it to ImageKit
    if (req.file) {
      const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
      const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/dummy/';

      if (
        !publicKey || !privateKey ||
        publicKey === 'your_imagekit_public_key' ||
        privateKey === 'your_imagekit_private_key'
      ) {
        return res.status(500).json({
          status: 'error',
          message: 'ImageKit credentials are not configured. Please define valid IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY in your .env file.',
        });
      }

      const ImageKit = require('imagekit');
      const ik = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint,
      });

      const uploadResponse = await ik.upload({
        file: req.file.buffer,
        fileName: `category_${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`,
        folder: '/crunchveda/categories',
      });
      imageUrl = uploadResponse.url;
    }

    const parsedData = categoryCreateSchema.parse({
      ...req.body,
      image: imageUrl,
    });

    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${parsedData.name}$`, 'i') },
    });
    if (existing) {
      return res.status(400).json({
        status: 'fail',
        message: `Category "${parsedData.name}" already exists.`,
      });
    }

    const newCategory = await Category.create(parsedData);

    res.status(201).json({
      status: 'success',
      data: {
        category: newCategory,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: error.issues.map(err => ({ field: err.path.join('.'), message: err.message })),
      });
    }
    next(error);
  }
};

// 3. UPDATE CATEGORY (Admin Only)
exports.updateCategory = async (req, res, next) => {
  try {
    let imageUrl = req.body.image;

    // If a file is uploaded, upload it to ImageKit
    if (req.file) {
      const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
      const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/dummy/';

      if (
        !publicKey || !privateKey ||
        publicKey === 'your_imagekit_public_key' ||
        privateKey === 'your_imagekit_private_key'
      ) {
        return res.status(500).json({
          status: 'error',
          message: 'ImageKit credentials are not configured. Please define valid IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY in your .env file.',
        });
      }

      const ImageKit = require('imagekit');
      const ik = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint,
      });

      const uploadResponse = await ik.upload({
        file: req.file.buffer,
        fileName: `category_${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`,
        folder: '/crunchveda/categories',
      });
      imageUrl = uploadResponse.url;
    }

    const payload = { ...req.body };
    if (imageUrl !== undefined) {
      payload.image = imageUrl;
    }

    const parsedData = categoryUpdateSchema.parse(payload);

    if (parsedData.name) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${parsedData.name}$`, 'i') },
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(400).json({
          status: 'fail',
          message: `Category "${parsedData.name}" already exists.`,
        });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, parsedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCategory) {
      return res.status(404).json({
        status: 'fail',
        message: 'No category found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        category: updatedCategory,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: error.issues.map(err => ({ field: err.path.join('.'), message: err.message })),
      });
    }
    next(error);
  }
};

// 4. DELETE CATEGORY (Admin Only)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'No category found with that ID',
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
