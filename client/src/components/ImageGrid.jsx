
function ImageGrid({ images, onDelete }) {
  return (
    <>
    <div className="image-grid"> {/* This must be a grid container */}
      {images.map((img) => (
        <div key={img._id} className="image-card">
          {/* Transparent Delete Icon - Positioned absolute to float on the image */}
          <button 
            className="glass-delete-btn" 
            onClick={() => onDelete(img._id)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>

          <div className="img-wrapper">
            <img src={img.imageUrl} alt="gallery" crossOrigin="anonymous" className="gallery-img" onError={(e) => console.log("Image Load Error:", e.target.src)}/>
          </div>
          
          <div className="image-info">
            <p className="tag-label">AI Tags Recognized:</p>
            <div className="tags-container">
              {img.tags?.map((tag, index) => (
                <span 
                  key={index} 
                  className="ai-tag" 
                  onClick={() => setSearchTerm(tag)} // Assuming setSearchTerm is passed as a prop
                  style={{ cursor: 'pointer' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
    </>
  );
}

export default ImageGrid;