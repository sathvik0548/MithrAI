import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/Profile.css";

function Profile() {
  

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
});useEffect(() => {
    loadProfile();
}, []);
const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};
const handleSave = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      "http://localhost:5050/api/profile",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Profile updated successfully!");
  } catch (err) {
    console.log(err);
    alert("Failed to update profile.");
  }
};
const [image, setImage] = useState(null);

const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (file) {
    setImage(URL.createObjectURL(file));
  }
};
const loadProfile = async () => {

    try {

        const token = localStorage.getItem("token");

        const response = await axios.get(
            "http://localhost:5050/api/profile",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setFormData(response.data);

    } catch (err) {

        console.log(err);

    }

};
  return (
    <div className="profile-page container">
      <Sidebar />

      <div className="main-content">
        <h1>PROFILE PAGE</h1>

        <div className="profile-wrapper">

          {/* Profile Card */}
          <div className="profile-card">

            <h2>Profile Settings</h2>
            <p>Manage your profile information.</p>

            <div className="profile-content">

              {/* Image Section */}
              <div className="profile-image-box">

                <img
                  src={image}
                  alt="Profile"
                />

                <input
                  type="file"
                  id="photoUpload"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />

                <button
                  onClick={() =>
                    document
                      .getElementById("photoUpload")
                      .click()
                  }
                >
                  Change Photo
                </button>

                <small>
                  JPG, PNG up to 3MB
                </small>

              </div>

              {/* Form Section */}
              <div className="form-section">

                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />

                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />

                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />

                <label>Bio</label>
                <textarea
                  rows="4"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                />

              </div>

            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-card">

            <h3>Your Stats</h3>

            <div className="stat">
              <span>📄</span>
              <div>
                <p>Resumes Analyzed</p>
                <h4>8</h4>
              </div>
            </div>

            <div className="stat">
              <span>🎯</span>
              <div>
                <p>Interviews Taken</p>
                <h4>12</h4>
              </div>
            </div>

            <div className="stat">
              <span>⭐</span>
              <div>
                <p>Average Score</p>
                <h4>76%</h4>
              </div>
            </div>

            <div className="stat">
              <span>📅</span>
              <div>
                <p>Member Since</p>
                <h4>May 2024</h4>
              </div>
            </div>

            <button
              className="save-btn"
              onClick={handleSave}
            >
              Save Changes
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;