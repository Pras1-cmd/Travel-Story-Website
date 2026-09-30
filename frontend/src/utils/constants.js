export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const STORY_CATEGORIES = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'culture', label: 'Culture' },
  { value: 'food', label: 'Food' },
  { value: 'nature', label: 'Nature' },
  { value: 'city', label: 'City' },
  { value: 'budget', label: 'Budget' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'solo', label: 'Solo' },
  { value: 'family', label: 'Family' },
  { value: 'other', label: 'Other' }
];

export const ITEMS_PER_PAGE = 10;

export const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=User';

export const MESSAGE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile/:id',
  CREATE_STORY: '/create',
  EDIT_STORY: '/edit/:id',
  STORY_DETAIL: '/story/:id',
  SAVED_STORIES: '/saved',
  CONTACT: '/contact'
};
