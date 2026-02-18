import axios from 'axios';
import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Upload = ({ onUploadSuccess, setLoading }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // const [ Loading, ] = useState();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

 // components/Upload.jsx
const handleUpload = async (e) => {
  e.preventDefault();
  if (!file) return;

  setLoading(true); // Start spinner

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(`${API_URL}/api/upload`, formData);
    
    // IMPORTANT: Pass the new image data (response.data) to the success handler
    onUploadSuccess(response.data); 
    
    setFile(null); // Clear the input
  } catch (error) {
    console.error(error);
    setLoading(false); // Stop spinner if it fails
    alert("Upload failed. Check console.");
  }
};

  return (
    <div className="upload-card">
      <h3>Add a New Memory</h3>
      
      <form onSubmit={handleUpload} className="upload-form">
        <div 
          className={`drop-zone ${isDragging ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="file-input-hidden"
          />
          <p>
            {file 
              ? `📁 Selected: ${file.name}` 
              : 'Drag & Drop your image here, or click to browse'}
          </p>
        </div>

        <button type="submit" disabled={uploading || !file} className="upload-btn">
          {uploading ? 'Analyzing with AI...' : 'Upload Image'}
        </button>
      </form>
    </div>
  );
};

export default Upload;
