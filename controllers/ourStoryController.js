const OurStoryCMS = require('../models/OurStoryCMS.model');
const { z } = require('zod');

// Validation Schema for Banner Section
const bannerSchema = z.object({
  bannerImage: z.string().optional(),
  bannerLabel: z.string().optional().default(''),
  bannerTitle: z.string().min(1, 'bannerTitle is required'),
  bannerDescription: z.string().optional().default(''),
  buttonText: z.string().optional().default(''),
  buttonLink: z.string().optional().default(''),
});

const handleZodError = (error, res, next) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      status: 'fail',
      message: error.message,
    });
  }

  return next(error);
};

// 1. GET OUR STORY PAGE DATA (Public)
exports.getOurStoryPage = async (req, res, next) => {
  try {
    let page = await OurStoryCMS.findOne({ key: 'our-story' });

    if (!page) {
      // Create default document if it doesn't exist
      page = await OurStoryCMS.create({
        key: 'our-story',
        banner: {
          bannerImage: '',
          bannerLabel: '',
          bannerTitle: '',
          bannerDescription: '',
          buttonText: '',
          buttonLink: '',
        },
      });
    }

    res.status(200).json({
      banner: {
        bannerImage: page.banner.bannerImage || '',
        bannerLabel: page.banner.bannerLabel || '',
        bannerTitle: page.banner.bannerTitle || '',
        bannerDescription: page.banner.bannerDescription || '',
        buttonText: page.banner.buttonText || '',
        buttonLink: page.banner.buttonLink || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. UPDATE BANNER SECTION (Admin Only)
exports.updateBanner = async (req, res, next) => {
  try {
    const parsedData = bannerSchema.parse(req.body);

    let imageUrl = parsedData.bannerImage;

    // If a file is uploaded, upload it to ImageKit
    if (req.file) {
      const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
      const urlEndpoint =
        process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/dummy/';

      if (
        !publicKey ||
        !privateKey ||
        publicKey === 'your_imagekit_public_key' ||
        privateKey === 'your_imagekit_private_key'
      ) {
        return res.status(500).json({
          status: 'error',
          message:
            'ImageKit credentials are not configured. Please define valid IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY in your .env file.',
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
        fileName: `our_story_banner_${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`,
        folder: '/crunchveda/our-story',
      });
      imageUrl = uploadResponse.url;
    }

    // Fallback: retain existing image if no new file or URL provided
    if (!imageUrl) {
      const existing = await OurStoryCMS.findOne({ key: 'our-story' });
      if (existing && existing.banner && existing.banner.bannerImage) {
        imageUrl = existing.banner.bannerImage;
      }
    }

    const page = await OurStoryCMS.findOneAndUpdate(
      { key: 'our-story' },
      {
        $set: {
          banner: {
            bannerImage: imageUrl || '',
            bannerLabel: parsedData.bannerLabel,
            bannerTitle: parsedData.bannerTitle,
            bannerDescription: parsedData.bannerDescription,
            buttonText: parsedData.buttonText,
            buttonLink: parsedData.buttonLink,
          },
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Our Story banner updated successfully.',
      data: {
        banner: page.banner,
      },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};
