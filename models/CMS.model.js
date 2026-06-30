const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'general',
      unique: true,
    },
    heroBanner: {
      title: { type: String, default: 'Premium Dry Fruits & Nuts' },
      subtitle: { type: String, default: 'Taste the crunch of nature, curated for your wellness.' },
      image: { type: String, default: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921' },
      buttonText: { type: String, default: 'Shop Now' },
      buttonLink: { type: String, default: '/products' },
    },
    aboutUs: {
      title: { type: String, default: 'About Crunch Veda' },
      content: { type: String, default: 'We are committed to delivering the highest quality dry fruits, sourced from the best farms around the world.' },
      image: { type: String, default: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af' },
    },
    contactInfo: {
      email: { type: String, default: 'info@crunchveda.com' },
      phone: { type: String, default: '+1 (555) 019-2834' },
      address: { type: String, default: '123 Wellness Street, Health City, HC 9401' },
    },
    policies: {
      shippingPolicy: { type: String, default: 'Standard shipping takes 3-5 business days.' },
      refundPolicy: { type: String, default: 'We offer a 30-day money-back guarantee for unopened items.' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CMS', cmsSchema);
