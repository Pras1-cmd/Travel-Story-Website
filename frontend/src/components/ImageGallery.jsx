import { useState } from 'react';

function ImageGallery({ coverImage, images = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const allImages = [
    ...(coverImage ? [{ url: coverImage, caption: 'Cover Image' }] : []),
    ...(Array.isArray(images) ? images : [])
  ];

  if (allImages.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Photo Gallery</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {allImages.map((img, index) => {
          const imageUrl = typeof img === 'string' ? img : img.url;
          const caption = typeof img === 'object' ? img.caption : '';

          if (!imageUrl) return null;

          return (
            <div
              key={index}
              onClick={() => setSelectedImage(imageUrl)}
              className="relative h-48 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow group bg-gray-100"
            >
              <img
                src={imageUrl}
                alt={caption || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300/cccccc/666666?text=Image+Error';
                }}
              />
              {caption && (
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs p-2 truncate">
                  {caption}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-xl font-bold bg-black/50 px-3 py-1 rounded-full hover:bg-black"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
