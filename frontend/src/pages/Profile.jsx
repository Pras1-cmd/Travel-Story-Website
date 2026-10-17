import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storyAPI, userAPI } from '../services/api';
import StoryCard from '../components/StoryCard';

function Profile() {
  const { user: currentUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [storyError, setStoryError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState('stories');
  const [storySearch, setStorySearch] = useState('');
  const [storySort, setStorySort] = useState('newest');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    profileImage: ''
  });

  const profileId = id || currentUser?.id;
  const isOwnProfile = !id || id === currentUser?.id || id === currentUser?._id;
  const visibleStories = useMemo(() => {
    const search = storySearch.trim().toLowerCase();
    return [...stories]
      .filter((story) => {
        if (!search) return true;
        return [
          story.title,
          story.excerpt,
          story.location?.city,
          story.location?.country,
          ...(story.tags || [])
        ].some((value) => value?.toLowerCase().includes(search));
      })
      .sort((a, b) => storySort === 'popular'
        ? (b.likesCount || 0) - (a.likesCount || 0)
        : new Date(b.createdAt) - new Date(a.createdAt));
  }, [stories, storySearch, storySort]);

  useEffect(() => {
    if (currentUser || id) {
      loadProfileData();
    }
  }, [currentUser?.id, id]);

  const loadProfileData = async () => {
    const targetId = profileId;

    if (!targetId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profileRes = await userAPI.getProfile(targetId);
      const userData = profileRes.data.data.user;
      setProfileUser(userData);
      setStories(profileRes.data.data.stories || []);

      setFormData({
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        bio: userData?.bio || '',
        profileImage: userData?.profileImage || ''
      });
      setProfileImageUrl(userData?.profileImage?.startsWith('data:image/') ? '' : userData?.profileImage || '');
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileImageUrlChange = (e) => {
    const { value } = e.target;
    setProfileImageUrl(value);
    setFormData(prev => ({ ...prev, profileImage: value }));
    setProfileError('');
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      setUploadingImage(true);
      setProfileError('');
      const response = await userAPI.uploadProfileImage(file);
      const profileImage = response.data.data.profileImage;
      const updatedUser = response.data.data.user;
      updateUser(updatedUser);
      setProfileUser(updatedUser);
      setFormData(prev => ({ ...prev, profileImage }));
      setProfileImageUrl('');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setProfileError(error.response?.data?.message || error.message || 'Failed to upload profile image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileError('');
      const response = await userAPI.updateProfile(formData);
      const updatedUser = response.data.data.user;

      updateUser(updatedUser);
      setProfileUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError(error.response?.data?.message || 'Could not update your profile.');
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Delete this travel story? This cannot be undone.')) return;

    try {
      setStoryError('');
      await storyAPI.deleteStory(storyId);
      setStories((currentStories) => currentStories.filter((story) => story._id !== storyId));
    } catch (error) {
      console.error('Error deleting story:', error);
      setStoryError(error.response?.data?.message || 'Could not delete this story.');
    }
  };

  const handleDeleteAccount = async () => {
    const firstConfirmation = window.confirm(
      'Delete your account? Your account, published stories, and comments will be permanently deleted.'
    );
    if (!firstConfirmation) return;

    const secondConfirmation = window.confirm(
      'This is your final confirmation. Permanently delete your account and its content? This cannot be undone.'
    );
    if (!secondConfirmation) return;

    try {
      setDeletingAccount(true);
      setProfileError('');
      await userAPI.deleteAccount();
      logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error deleting account:', error);
      setProfileError(error.response?.data?.message || 'Could not delete your account. Please try again.');
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600">This user could not be loaded.</p>
        </div>
      </div>
    );
  }

  const displayName = [profileUser.firstName, profileUser.lastName].filter(Boolean).join(' ') || profileUser.username;
  const initials = displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const memberSince = profileUser.createdAt
    ? new Date(profileUser.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-7 sm:px-10 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border-4 border-white bg-gradient-to-br from-sky-100 to-blue-200 text-2xl font-black text-blue-700 shadow-lg sm:h-28 sm:w-28">
              {profileUser.profileImage ? (
                <img
                  src={profileUser.profileImage}
                  alt={`${displayName}'s profile`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <p className="text-sm font-medium text-slate-500">@{profileUser.username}</p>
              <h1 className="mt-1 break-words text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {displayName}
              </h1>
              <p className="mt-3 max-w-2xl whitespace-pre-line leading-7 text-slate-600">
                {profileUser.bio || (isOwnProfile ? 'Add a little introduction about yourself and your travels.' : 'This traveler has not added a bio yet.')}
              </p>
            </div>

            {isOwnProfile && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(!isEditing);
                  setProfileError('');
                }}
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                {isEditing ? 'Close editor' : 'Edit profile'}
              </button>
            )}
          </div>

          <div className="mt-7 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setActiveTab('stories')}
              className={`rounded-2xl px-4 py-3 text-left transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${activeTab === 'stories' ? 'bg-blue-50 ring-1 ring-blue-100' : 'bg-slate-50 hover:bg-slate-100'}`}
            >
              <span className="block text-lg font-bold text-slate-900">{stories.length}</span>
              <span className="text-xs font-medium text-slate-500">{stories.length === 1 ? 'Published story' : 'Published stories'}</span>
            </button>
            {memberSince && (
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`rounded-2xl px-4 py-3 text-left transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${activeTab === 'about' ? 'bg-blue-50 ring-1 ring-blue-100' : 'bg-slate-50 hover:bg-slate-100'}`}
              >
                <span className="block text-lg font-bold text-slate-900">{memberSince}</span>
                <span className="text-xs font-medium text-slate-500">Traveling with us since</span>
              </button>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="border-t border-slate-200 bg-slate-50/70 px-6 py-7 sm:px-10">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Your details</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Update your profile</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {profileError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {profileError}
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  maxLength={500}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Share a little about yourself and the places you love."
                ></textarea>
                <p className="mt-1 text-right text-xs text-slate-500">{formData.bio.length}/500</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Profile photo</p>
                  <p className="mt-1 text-sm text-slate-500">Choose a photo that represents your travels.</p>
                </div>
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Image URL (optional)</label>
                  <input
                    type="url"
                    name="profileImageUrl"
                    value={profileImageUrl}
                    onChange={handleProfileImageUrlChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Or upload from your device</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleProfileImageUpload}
                    disabled={uploadingImage}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-60"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    {uploadingImage ? 'Uploading to Cloudinary...' : 'JPEG, PNG, WebP, or GIF. Maximum size: 5 MB.'}
                  </p>
                </div>
                {formData.profileImage && (
                  <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4">
                    <img
                      src={formData.profileImage}
                      alt="Profile image preview"
                      className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, profileImage: '' }));
                        setProfileImageUrl('');
                        setProfileError('');
                      }}
                      className="text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save profile
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
              <h3 className="text-base font-bold text-red-800">Delete account</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-red-700">
                Permanently delete your account, published stories, and comments. This action cannot be undone.
              </p>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="mt-4 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingAccount ? 'Deleting account...' : 'Delete my account'}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm" role="tablist" aria-label="Profile sections">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'stories'}
              onClick={() => setActiveTab('stories')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${activeTab === 'stories' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              Stories <span className="ml-1 opacity-75">{stories.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'about'}
              onClick={() => setActiveTab('about')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${activeTab === 'about' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              About
            </button>
          </div>

          {activeTab === 'stories' && isOwnProfile && (
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <span aria-hidden="true" className="text-lg leading-none">+</span>
              Write a story
            </Link>
          )}
        </div>

        {storyError && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {storyError}
          </div>
        )}

        {activeTab === 'about' ? (
          <div className="grid gap-5 md:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">A little about me</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">{displayName}</h2>
              <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
                {profileUser.bio || 'This traveler is still working on their introduction.'}
              </p>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setProfileError('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mt-6 rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Add to your bio
                </button>
              )}
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">On TravelStory</p>
              <dl className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4 border-b border-blue-100 pb-4">
                  <dt className="text-sm text-slate-600">Published stories</dt>
                  <dd className="font-bold text-slate-900">{stories.length}</dd>
                </div>
                {memberSince && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-slate-600">Member since</dt>
                    <dd className="font-bold text-slate-900">{memberSince}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">The journal</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  {isOwnProfile ? 'Your published stories' : `${profileUser.username}'s stories`}
                </h2>
              </div>
              {stories.length > 1 && (
                <label className="relative">
                  <span className="sr-only">Search this author’s stories</span>
                  <input
                    type="search"
                    value={storySearch}
                    onChange={(e) => setStorySearch(e.target.value)}
                    placeholder="Search stories..."
                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pr-24 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:w-64"
                  />
                  <select
                    value={storySort}
                    onChange={(e) => setStorySort(e.target.value)}
                    aria-label="Sort stories"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 outline-none"
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Popular</option>
                  </select>
                </label>
              )}
            </div>

            {stories.length > 0 ? (
              visibleStories.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {visibleStories.map((story) => (
                    <div key={story._id} className="group">
                      <StoryCard story={story} />
                      {isOwnProfile && (
                        <div className="mt-3 flex justify-end gap-2 opacity-100 transition sm:opacity-70 sm:group-hover:opacity-100">
                          <Link
                            to={`/edit-story/${story._id}`}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            Edit story
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteStory(story._id)}
                            className="rounded-full border border-red-100 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                  <p className="font-semibold text-slate-800">No stories match “{storySearch}”</p>
                  <button type="button" onClick={() => setStorySearch('')} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Clear search
                  </button>
                </div>
              )
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600" aria-hidden="true">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 15.5 8 11l3 3 5.5-6 4 4M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">No published stories yet</h3>
                <p className="mx-auto mt-2 max-w-md leading-6 text-slate-600">
                  {isOwnProfile ? 'Share a travel moment and it will show up here for everyone to explore.' : 'This traveler has not published any stories yet.'}
                </p>
                {isOwnProfile && (
                  <Link to="/create" className="mt-5 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                    Write your first story
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Profile;