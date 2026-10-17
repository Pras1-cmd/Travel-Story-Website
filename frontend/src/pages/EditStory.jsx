import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storyAPI } from '../services/api';

function EditStory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tagsInput, setTagsInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    images: [],
    location: {
      country: '',
      city: '',
      coordinates: {
        latitude: '',
        longitude: ''
      }
    },
    reachableBy: [],
    familyFriendly: false,
    familyFriendlyNote: '',
    tags: [],
    category: 'other',
    isPublished: true
  });

  useEffect(() => {
    if (id) {
      fetchStory();
    }
  }, [id]);

  const fetchStory = async () => {
    try {
      setFetchLoading(true);
      const response = await storyAPI.getStory(id);
      const story = response.data.data.story;

      // Check if user owns the story
      if (!story.author || story.author._id.toString() !== user.id) {
        setError('You are not authorized to edit this story');
        setTimeout(() => navigate(-1), 2000);
        return;
      }

      // Transform data for form
      setFormData({
        title: story.title || '',
        content: story.content || '',
        excerpt: story.excerpt || '',
        coverImage: story.coverImage || '',
        images: story.images || [],
        location: {
          country: story.location?.country || '',
          city: story.location?.city || '',
          coordinates: {
            latitude: story.location?.coordinates?.latitude || '',
            longitude: story.location?.coordinates?.longitude || ''
          }
        },
        reachableBy: story.reachableBy || [],
        familyFriendly: story.familyFriendly || false,
        familyFriendlyNote: story.familyFriendlyNote || '',
        tags: story.tags || [],
        category: story.category || 'other',
        isPublished: story.isPublished !== undefined ? story.isPublished : true
      });
      setTagsInput((story.tags || []).join(', '));

    } catch (error) {
      console.error('Error fetching story:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch story';
      setError(errorMessage);
      setTimeout(() => navigate(-1), 2000);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      if (name === 'familyFriendly') {
        if (!checked) {
          setFormData(prev => ({ ...prev, familyFriendlyNote: '' }));
        }
      }
    } else if (name.includes('.')) {
      // Handle nested objects like location.country or location.coordinates.latitude
      const parts = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;

        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelect = (e) => {
    const { value, checked } = e.target;
    const { reachableBy } = formData;

    if (checked) {
      setFormData(prev => ({
        ...prev,
        reachableBy: [...reachableBy, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        reachableBy: reachableBy.filter(item => item !== value)
      }));
    }
  };

  const handleTagsInput = (e) => {
    const tagsString = e.target.value;
    setTagsInput(tagsString);
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  const handleCoverImageFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, coverImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImageFiles = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { url: reader.result, caption: file.name }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.content.trim()) errors.push('Content is required');
    if (formData.title.length > 200) errors.push('Title cannot exceed 200 characters');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare story data
      const storyData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        coverImage: formData.coverImage,
        images: formData.images,
        location: formData.location,
        reachableBy: formData.reachableBy,
        familyFriendly: formData.familyFriendly,
        familyFriendlyNote: formData.familyFriendly ? formData.familyFriendlyNote : undefined,
        tags: formData.tags,
        category: formData.category,
        isPublished: formData.isPublished
      };

      const response = await storyAPI.updateStory(id, storyData);

      setLoading(false);
      navigate(`/story/${id}`);

    } catch (error) {
      console.error('Error updating story:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update story';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Travel Story</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter story title"
              maxLength={200}
            />
            <p className="text-sm text-gray-500 mt-1">Max 200 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your travel story..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt (Optional)</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary of your story..."
              maxLength={300}
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">Max 300 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL or Upload File</label>
            <input
              type="text"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              placeholder="https://example.com/cover.jpg"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageFile}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formData.coverImage && (
              <div className="mt-2 h-32 w-32 rounded-lg overflow-hidden border">
                <img src={formData.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images (Upload files)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImageFiles}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
            />
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative h-20 rounded-lg overflow-hidden border">
                    <img src={img.url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Country"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reachable By</label>
            <div className="space-y-2">
              {['train', 'bus', 'vehicle', 'flight'].map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="reachableBy"
                    value={option}
                    checked={formData.reachableBy.includes(option)}
                    onChange={handleMultiSelect}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Family Friendly</label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="familyFriendly"
                checked={formData.familyFriendly}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">This story is family friendly</span>
            </label>
            {formData.familyFriendly && (
              <div className="mt-2">
                <textarea
                  name="familyFriendlyNote"
                  value={formData.familyFriendlyNote}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any family-friendly notes..."
                  maxLength={500}
                ></textarea>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="adventure">Adventure</option>
              <option value="culture">Culture</option>
              <option value="food">Food</option>
              <option value="nature">Nature</option>
              <option value="city">City</option>
              <option value="budget">Budget</option>
              <option value="luxury">Luxury</option>
              <option value="solo">Solo</option>
              <option value="family">Family</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={handleTagsInput}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., beach, sunset, adventure, cooking"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">Published</label>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Updating...' : 'Update Story'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStory;