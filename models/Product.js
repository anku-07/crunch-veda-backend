const mongoose = require("mongoose");

// Mongoose schema: Blueprint for our Dry Fruit products
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    prices: {
      type: [
        {
          size: {
            type: String,
            required: [true, "Product size is required"],
            trim: true,
          },
          price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Price cannot be negative"],
          },
        },
      ],
      validate: {
        validator: (prices) => Array.isArray(prices) && prices.length > 0,
        message: "At least one product price is required",
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    images: {
      type: [String], // URL to product image
      default: ["https://via.placeholder.com/150"],
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  },
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
