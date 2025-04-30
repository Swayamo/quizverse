import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Profile.css';

const Profile = () => {
  const { currentUser, updateProfile, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.username || !formData.email) {
      setFormError('Username and email are required');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    setFormError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    try {
      const result = await updateProfile({
        username: formData.username,
        email: formData.email,
        bio: formData.bio
      });
      
      if (result.success) {
        setSuccessMessage('Profile updated successfully');
        setIsEditing(false);
      } else {
        setFormError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to get user initials for the avatar
  const getUserInitials = () => {
    if (!currentUser?.username) return '?';
    return currentUser.username.charAt(0).toUpperCase();
  };
  
  // Function to get a random color based on username
  const getAvatarColor = () => {
    if (!currentUser?.username) return '#3498db';
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    const index = currentUser.username.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }
  
  return (
    <div className="profile-page-container">
      <div className="profile-banner">
        <div className="profile-container">
          <div className="profile-header-content">
            <div 
              className="profile-avatar-large" 
              style={{ backgroundColor: getAvatarColor() }}
            >
              {getUserInitials()}
            </div>
            <div className="profile-title">
              <h1>{currentUser?.username || 'User Profile'}</h1>
              <p className="profile-subtitle">Member since {currentUser?.created_at 
                ? new Date(currentUser.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) 
                : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-nav">
            <button 
              className={`profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user"></i>
              <span>Profile Information</span>
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <i className="fas fa-lock"></i>
              <span>Security</span>
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <i className="fas fa-sliders-h"></i>
              <span>Preferences</span>
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              <i className="fas fa-database"></i>
              <span>Data & Privacy</span>
            </button>
          </div>
          
          <div className="profile-stats">
            <h3>Statistics</h3>
            <div className="stat-item">
              <div className="stat-label">Quizzes Taken</div>
              <div className="stat-value">{currentUser?.quizzes_taken || 0}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Quizzes Created</div>
              <div className="stat-value">{currentUser?.quizzes_created || 0}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Average Score</div>
              <div className="stat-value">{currentUser?.average_score || 0}%</div>
            </div>
          </div>
        </div>
        
        <div className="profile-main">
          {(formError || error) && (
            <div className="notification notification-error">
              <i className="fas fa-exclamation-circle"></i> {formError || error}
              <button className="close-notification" onClick={() => setFormError('')}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
          
          {successMessage && (
            <div className="notification notification-success">
              <i className="fas fa-check-circle"></i> {successMessage}
              <button className="close-notification" onClick={() => setSuccessMessage('')}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div className="profile-card">
              <div className="card-header">
                <h2>Profile Information</h2>
                {!isEditing && (
                  <button 
                    className="btn btn-outline edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit"></i> Edit Profile
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <div className="input-wrapper">
                      <i className="fas fa-user input-icon"></i>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className="form-control"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <div className="input-wrapper">
                      <i className="fas fa-envelope input-icon"></i>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      className="form-control"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us a bit about yourself"
                      rows="4"
                    />
                  </div>
                  
                  <div className="form-buttons">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          username: currentUser?.username || '',
                          email: currentUser?.email || '',
                          bio: currentUser?.bio || ''
                        });
                        setFormError('');
                      }}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                    
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <LoadingSpinner size="small" /> : (
                        <><i className="fas fa-save"></i> Save Changes</>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="info-card">
                    <div className="info-icon">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="info-content">
                      <label>Username</label>
                      <p>{currentUser?.username || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="info-card">
                    <div className="info-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="info-content">
                      <label>Email</label>
                      <p>{currentUser?.email || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="info-card">
                    <div className="info-icon">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                    <div className="info-content">
                      <label>Account Created</label>
                      <p>{currentUser?.created_at 
                        ? new Date(currentUser.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="info-card">
                    <div className="info-icon">
                      <i className="fas fa-info-circle"></i>
                    </div>
                    <div className="info-content">
                      <label>Bio</label>
                      <p className="bio-text">{currentUser?.bio || 'No bio provided yet.'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="profile-card">
              <div className="card-header">
                <h2>Security Settings</h2>
              </div>
              <div className="security-options">
                <div className="security-option">
                  <div className="option-content">
                    <h3>Change Password</h3>
                    <p>Update your password to keep your account secure</p>
                  </div>
                  <button className="btn btn-outline">Change Password</button>
                </div>
                
                <div className="security-option">
                  <div className="option-content">
                    <h3>Two-Factor Authentication</h3>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <button className="btn btn-outline">Enable 2FA</button>
                </div>
                
                <div className="security-option">
                  <div className="option-content">
                    <h3>Login History</h3>
                    <p>View recent login activities on your account</p>
                  </div>
                  <button className="btn btn-outline">View History</button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'data' && (
            <div className="profile-card">
              <div className="card-header">
                <h2>Data & Privacy</h2>
              </div>
              
              <div className="data-privacy-section">
                <div className="data-action">
                  <div className="data-action-info">
                    <h3><i className="fas fa-download"></i> Download My Data</h3>
                    <p>Get a copy of all your data from our platform</p>
                  </div>
                  <button className="btn btn-outline">
                    Request Data
                  </button>
                </div>
                
                <div className="data-action danger-zone">
                  <div className="data-action-info">
                    <h3><i className="fas fa-trash"></i> Delete Account</h3>
                    <p>Permanently remove your account and all associated data</p>
                  </div>
                  <button className="btn btn-danger">
                    Delete Account
                  </button>
                </div>
                
                <div className="data-action">
                  <div className="data-action-info">
                    <h3><i className="fas fa-cookie"></i> Cookie Preferences</h3>
                    <p>Manage how we use cookies to enhance your experience</p>
                  </div>
                  <button className="btn btn-outline">
                    Manage Cookies
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'preferences' && (
            <div className="profile-card">
              <div className="card-header">
                <h2>Preferences</h2>
              </div>
              
              <div className="preferences-section">
                <div className="preference-item">
                  <div className="preference-info">
                    <h3>Dark Mode</h3>
                    <p>Switch between light and dark mode</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="preference-item">
                  <div className="preference-info">
                    <h3>Email Notifications</h3>
                    <p>Receive emails about quiz updates and new features</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="preference-item">
                  <div className="preference-info">
                    <h3>Quiz Difficulty</h3>
                    <p>Default difficulty level for new quizzes</p>
                  </div>
                  <select className="preference-select">
                    <option value="easy">Easy</option>
                    <option value="medium" selected>Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
