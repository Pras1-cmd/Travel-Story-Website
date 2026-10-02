import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function EditStory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    location: {
      country: '',
      city: ''
    },
    category: 'adventure',
    tags: ''
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);

  const categories = ['adventure', 'culture', 'food', 'nature', 'city', 'budget', 'luxury', 'solo', 'family', 'other'];

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await storyAPI.getStory(id);
        const story = response.data.data.story;

        // Check ownership
        if (story.author._id !== user?.id) {
          setError('You are not authorized to edit this story');
          return;
        }

        setFormData({
          title: story.title || '',
          content: story.content || '',
          excerpt: story.excerpt || '',
          location: {
            country: story.location?.country || '',
            city: story.location?.city || ''
          },
          category: story.category || 'adventure',
          tags: story.tags?.join(', ') || ''
        });

        setExistingImages(story.images || []);
      } catch (err) {
        setError('Failed to load story');
      }
      setFetching(false);
    };

    if (user) {
      fetchStory();
    }
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'country' || name === 'city') {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };

  const handleNewImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImageFiles.length + files.length;

    if (totalImages > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setNewImageFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setNewImages(prev => [...prev, ...newPreviews]);
  };

  const removeExistingImage = async (publicId) => {
    try {
      await api.delete(`/upload/${encodeURIComponent(publicId)}`);
      setExistingImages(prev => prev.filter(img => img.publicId !== publicId));
    } catch (err) {
      console.error('Failed to delete image from Cloudinary', err);
    }
  };

  const removeNewImage = (index) => {
    setNewImages(prev => {
      const newImgs = [...prev];
      URL.revokeObjectURL(newImgs[index].preview);
      newImgs.splice(index, 1);
      return newImgs;
    });
    setNewImageFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadImagesToCloudinary = async (files) => {
    const formDataToSend = new FormData();
    files.forEach(file => {
      formDataToSend.append('images', file);
    });

    try {
      const response = await api.post('/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.data.images;
    } catch (err) {
      throw new Error(`Image upload failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.content.trim()) {
      setError('Content/Description is required');
      return false;
    }
    if (!formData.location.country || !formData.location.city) {
      setError('Location (country and city) is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      let newUploadedImages = [];

      // Upload new images if any
      if (newImageFiles.length > 0) {
        setUploadingImages(true);
        newUploadedImages = await uploadImagesToCloudinary(newImageFiles);
        setUploadingImages(false);
      }

      // Combine existing and new images
      const allImages = [
        ...existingImages,
        ...newUploadedImages
      ];

      // Update story
      const storyData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: allImages,
        coverImage: allImages[0]?.url || ''
      };

      await storyAPI.updateStory(id, storyData);

      navigate(`/story/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update story');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">Loading story...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
          Please log in to edit this story.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Edit Story</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Give your story a captivating title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="capitalize">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              name="country"
              value={formData.location.country}
              onChange={handleChange}
              placeholder="e.g., Indonesia"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.location.city}
              onChange={handleChange}
              placeholder="e.g., Bali"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt (Optional)
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="A brief summary of your story (max 300 characters)"
            maxLength="300"
            rows="2"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Content *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Tell your amazing travel story..."
            rows="8"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            disabled={loading}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., beach, adventure, travel (comma separated)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {existingImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img.url}
                    alt={`existing-${idx}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.publicId)}
                    disabled={loading}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add More Images (Max 5 total)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleNewImageSelect}
              disabled={loading || uploadingImages}
              className="hidden"
              id="edit-image-upload"
            />
            <label
              htmlFor="edit-image-upload"
              className="cursor-pointer text-primary hover:text-primary-dark font-medium"
            >
              {newImageFiles.length === 0 ? 'Click to upload or drag and drop' : `${newImageFiles.length} new image(s) selected`}
            </label>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF, WEBP up to 5MB</p>
          </div>

          {newImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {newImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img.preview}
                    alt={`preview-${idx}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    disabled={loading}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              loading || uploadingImages
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            {loading ? 'Saving Changes...' : uploadingImages ? 'Uploading Images...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/story/${id}`)}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditStory;