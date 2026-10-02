const cloudinary = require('../config/cloudinary');

// @desc    Upload images to Cloudinary
// @route   POST /api/upload
// @access  Private
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    // Limit to 5 images
    if (req.files.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 images allowed per story'
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      try {
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'travel-stories',
              resource_type: 'auto',
              max_bytes: 5 * 1024 * 1024 // 5MB
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(file.buffer);
        });

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id
        });
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({
          success: false,
          message: `Failed to upload image: ${error.message}`
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        images: uploadedImages
      }
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading images'
    });
  }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID required'
      });
    }

    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting image'
    });
  }
};
