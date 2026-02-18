import axios from 'axios';
import { useEffect, useState } from 'react';
import ImageGrid from './components/ImageGrid';
import Upload from './components/Upload';
import './index.css';

const API_URL = "https://gallery-backend-qlro.onrender.com";

function App() {
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false); // Added for spinner

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/images`);
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleNewImage = (newImage) => {
    // This updates the state instantly so you don't have to refresh
    setImages((prevImages) => [newImage, ...prevImages]); 
    setLoading(false); // Stop the spinner once the image is added
  };

  // App.jsx
const deleteImage = async (id) => {
  if (window.confirm("Delete this image?")) {
    try {
      await axios.delete(`${API_URL}/api/images/${id}`);
      
      // OPTION A: Filter the local state (Fastest)
      setImages(prevImages => prevImages.filter(img => img._id !== id));
      
      // OPTION B: Re-fetch from database (Safest)
      fetchImages(); 
      
      alert("Deleted successfully");
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }
};

  // FIXED: Added ?. to prevent the "undefined tags" crash
  const filteredImages = images.filter(img => 
    img.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // App.jsx
  return (
    <div className="app-container">
      <h1 className="app-title">AI-Smart Gallery 🧠</h1>
      
      {/* Keep the Upload card where it is */}
      <Upload onUploadSuccess={handleNewImage} setLoading={setLoading} />

      {loading && (
        <div className="ai-loader-overlay">
          <div className="ai-loader-content">
            <div className="creative-spinner"></div>
            <p>AI is analyzing your image tags...</p>
          </div>
        </div>
      )}

      {/* NEW SECTION: Smart Gallery Header with Integrated Search */}
      <div className="gallery-header-section">
        <h2 className="section-title">Your Smart Gallery</h2>
        
        <div className="glass-search-container">
          <div className="search-icon">🔍</div>
          <input 
            type="text" 
            placeholder="Search your memories by tags..." 
            className="glass-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ImageGrid 
        images={images.filter(img => 
          img.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )} 
        onDelete={deleteImage} 
      />
    </div>
  );
}

export default App;
