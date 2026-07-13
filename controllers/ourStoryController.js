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

// Validation Schema for The Beginning Section
const theBeginningSchema = z.object({
  sectionLabel: z.string().optional().default(''),
  sectionTitle: z.string().min(1, 'sectionTitle is required'),
  sectionDescription: z.string().optional().default(''),
  image: z.string().optional(),
});

// Helper to parse JSON strings from form-data
const parseJSONField = (value) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

// Helper to upload a single file to ImageKit
const uploadImageToImageKit = async (file, folder = '/crunchveda/our-story') => {
  if (!file) return null;

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/dummy/';

  if (
    !publicKey || !privateKey ||
    publicKey === 'your_imagekit_public_key' ||
    privateKey === 'your_imagekit_private_key'
  ) {
    const error = new Error('ImageKit credentials are not configured. Please define valid IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY in your .env file.');
    error.statusCode = 500;
    throw error;
  }

  const ImageKit = require('imagekit');
  const ik = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });

  const uploadResponse = await ik.upload({
    file: file.buffer,
    fileName: `our_story_${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`,
    folder: folder,
  });

  return uploadResponse.url;
};

// Validation Schema for Philosophy Section
const philosophySchema = z.object({
  sectionTitle: z.string().min(1, 'sectionTitle is required'),
  sectionDescription: z.string().optional().default(''),
  philosophies: z.preprocess(
    (val) => parseJSONField(val),
    z.array(
      z.object({
        icon: z.string().optional().default(''),
        title: z.string().optional().default(''),
        description: z.string().optional().default(''),
      })
    ).default([])
  ),
});

// Validation Schema for Stewardship Section
const stewardshipSchema = z.object({
  sectionTitle: z.string().min(1, 'sectionTitle is required'),
  milestones: z.preprocess(
    (val) => parseJSONField(val),
    z.array(
      z.object({
        year: z.string().optional().default(''),
        title: z.string().optional().default(''),
        description: z.string().optional().default(''),
        image: z.string().optional().default(''),
      })
    ).default([])
  ),
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
      theBeginning: {
        sectionLabel: page.theBeginning?.sectionLabel || '',
        sectionTitle: page.theBeginning?.sectionTitle || '',
        sectionDescription: page.theBeginning?.sectionDescription || '',
        image: page.theBeginning?.image || '',
      },
      philosophy: {
        sectionTitle: page.philosophy?.sectionTitle || '',
        sectionDescription: page.philosophy?.sectionDescription || '',
        philosophies: page.philosophy?.philosophies || [],
      },
      stewardship: {
        sectionTitle: page.stewardship?.sectionTitle || '',
        milestones: page.stewardship?.milestones || [],
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
      imageUrl = await uploadImageToImageKit(req.file);
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

// 3. UPDATE THE BEGINNING SECTION (Admin Only)
exports.updateTheBeginning = async (req, res, next) => {
  try {
    const parsedData = theBeginningSchema.parse(req.body);

    let imageUrl = parsedData.image;

    // If a file is uploaded, upload it to ImageKit
    if (req.file) {
      imageUrl = await uploadImageToImageKit(req.file);
    }

    // Fallback: retain existing image if no new file or URL provided
    if (!imageUrl) {
      const existing = await OurStoryCMS.findOne({ key: 'our-story' });
      if (existing && existing.theBeginning && existing.theBeginning.image) {
        imageUrl = existing.theBeginning.image;
      }
    }

    const page = await OurStoryCMS.findOneAndUpdate(
      { key: 'our-story' },
      {
        $set: {
          theBeginning: {
            sectionLabel: parsedData.sectionLabel,
            sectionTitle: parsedData.sectionTitle,
            sectionDescription: parsedData.sectionDescription,
            image: imageUrl || '',
          },
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'The Beginning section updated successfully.',
      data: {
        theBeginning: page.theBeginning,
      },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

// 4. UPDATE PHILOSOPHY SECTION (Admin Only)
exports.updatePhilosophy = async (req, res, next) => {
  try {
    const parsedData = philosophySchema.parse(req.body);

    const page = await OurStoryCMS.findOneAndUpdate(
      { key: 'our-story' },
      {
        $set: {
          philosophy: {
            sectionTitle: parsedData.sectionTitle,
            sectionDescription: parsedData.sectionDescription,
            philosophies: parsedData.philosophies,
          },
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Philosophy section updated successfully.',
      data: {
        philosophy: page.philosophy,
      },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

// 5. UPDATE STEWARDSHIP SECTION (Admin Only)
exports.updateStewardship = async (req, res, next) => {
  try {
    const parsedData = stewardshipSchema.parse(req.body);

    const existingPage = await OurStoryCMS.findOne({ key: 'our-story' });
    const existingMilestones = existingPage?.stewardship?.milestones || [];

    // Filter files uploaded under generic array fields
    const arrayFiles = (req.files || []).filter(
      (f) => f.fieldname === 'images' || f.fieldname === 'milestone_images'
    );

    const updatedMilestones = await Promise.all(
      parsedData.milestones.map(async (milestone, index) => {
        // Find if there is a file specifically matching this index
        const file = (req.files || []).find(
          (f) =>
            f.fieldname === `milestone_image_${index}` ||
            f.fieldname === `milestones[${index}][image]` ||
            f.fieldname === `milestones[${index}].image` ||
            f.fieldname === `image_${index}`
        );

        // Fallback to arrayFiles mapping by index
        const fallbackFile = file || arrayFiles[index];

        let imageUrl = milestone.image;

        if (fallbackFile) {
          imageUrl = await uploadImageToImageKit(fallbackFile);
        } else if (!imageUrl) {
          // Fallback to existing image if no file is uploaded and no URL is provided
          imageUrl = existingMilestones[index]?.image || '';
        }

        return {
          year: milestone.year,
          title: milestone.title,
          description: milestone.description,
          image: imageUrl,
        };
      })
    );

    const page = await OurStoryCMS.findOneAndUpdate(
      { key: 'our-story' },
      {
        $set: {
          stewardship: {
            sectionTitle: parsedData.sectionTitle,
            milestones: updatedMilestones,
          },
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Stewardship section updated successfully.',
      data: {
        stewardship: page.stewardship,
      },
    });
  } catch (error) {
    return handleZodError(error, res, next);
  }
};

exports.getBanner = async (req, res, next) => {
  try {
    const page = await OurStoryCMS.findOne({ key: 'our-story' });
    const banner = page?.banner || {
      bannerImage: '',
      bannerLabel: '',
      bannerTitle: '',
      bannerDescription: '',
      buttonText: '',
      buttonLink: '',
    };
    res.status(200).json({
      status: 'success',
      data: { banner },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTheBeginning = async (req, res, next) => {
  try {
    const page = await OurStoryCMS.findOne({ key: 'our-story' });
    const theBeginning = page?.theBeginning || {
      sectionLabel: '',
      sectionTitle: '',
      sectionDescription: '',
      image: '',
    };
    res.status(200).json({
      status: 'success',
      data: { theBeginning },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPhilosophy = async (req, res, next) => {
  try {
    const page = await OurStoryCMS.findOne({ key: 'our-story' });
    const philosophy = page?.philosophy || {
      sectionTitle: '',
      sectionDescription: '',
      philosophies: [],
    };
    res.status(200).json({
      status: 'success',
      data: { philosophy },
    });
  } catch (error) {
    next(error);
  }
};

exports.getStewardship = async (req, res, next) => {
  try {
    const page = await OurStoryCMS.findOne({ key: 'our-story' });
    const stewardship = page?.stewardship || {
      sectionTitle: '',
      milestones: [],
    };
    res.status(200).json({
      status: 'success',
      data: { stewardship },
    });
  } catch (error) {
    next(error);
  }
};

