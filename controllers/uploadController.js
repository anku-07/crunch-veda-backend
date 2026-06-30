const ImageKit = require('imagekit');

let imagekit;

const getInitializeImageKit = () => {
  if (imagekit) return imagekit;

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/dummy/';

  if (
    !publicKey || !privateKey ||
    publicKey === 'your_imagekit_public_key' ||
    privateKey === 'your_imagekit_private_key'
  ) {
    throw new Error(
      'ImageKit credentials are not configured. Please define valid IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY in your .env file.'
    );
  }

  imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });

  return imagekit;
};

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded. Please upload a file with the key "image".',
      });
    }

    let ik;
    try {
      ik = getInitializeImageKit();
    } catch (configError) {
      return res.status(500).json({
        status: 'error',
        message: configError.message,
      });
    }

    const uploadResponse = await ik.upload({
      file: req.file.buffer,
      fileName: `crunchveda_${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`,
      folder: '/crunchveda',
    });

    res.status(200).json({
      status: 'success',
      message: 'File uploaded successfully.',
      data: {
        fileId: uploadResponse.fileId,
        name: uploadResponse.name,
        url: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
