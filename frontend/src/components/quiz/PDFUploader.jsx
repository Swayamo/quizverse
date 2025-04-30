import { useState, useRef } from 'react';
import './PDFUploader.css';

const PDFUploader = ({ onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    fileInputRef.current.value = null;
  };

  return (
    <div className="pdf-uploader">
      <div 
        className={`drop-area ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="application/pdf"
          className="file-input"
        />
        
        {selectedFile ? (
          <div className="selected-file">
            <i className="fas fa-file-pdf file-icon"></i>
            <div className="file-details">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
            </div>
            <button type="button" className="remove-file" onClick={removeFile}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <i className="fas fa-cloud-upload-alt upload-icon"></i>
            <p>Drag & drop your PDF file here</p>
            <p className="or">OR</p>
            <button type="button" className="browse-btn" onClick={handleBrowseClick}>
              Browse Files
            </button>
            <p className="file-hint">PDF files only, max 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUploader;
