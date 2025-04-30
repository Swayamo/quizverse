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
            <div className="file-info">
              <div className="file-icon">
                <i className="bi bi-file-earmark-pdf-fill"></i>
              </div>
              <div className="file-details">
                <h6 className="file-name">{selectedFile.name}</h6>
                <p className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button type="button" className="btn btn-remove" onClick={removeFile}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        ) : (
          <div className="upload-prompt text-center">
            <div className="upload-icon">
              <i className="bi bi-cloud-arrow-up-fill"></i>
            </div>
            <h5 className="upload-title">Drag & drop your PDF here</h5>
            <p className="upload-subtitle">or</p>
            <button type="button" className="btn btn-upload" onClick={handleBrowseClick}>
              Browse Files
            </button>
            <p className="upload-hint">PDF files only (max. 5MB)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUploader;
