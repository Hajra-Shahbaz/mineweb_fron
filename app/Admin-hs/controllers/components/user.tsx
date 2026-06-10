"use client";

import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// Define the types based on your backend structure
interface IProfilePicture {
  url: string;
  isActive: boolean;
}

interface IUserProfile {
  name: string;
  title: string;
  aboutText: string;
  subText: string;
  resumeUrl?: string;
  profilePictures?: IProfilePicture[];
}

// Import your actual API hooks - REPLACE THESE WITH YOUR REAL IMPORTS
import {
  useGetUserProfileQuery,
  useCreateUserProfileMutation,
  useEditUserProfileMutation,
  useDeleteUserProfileMutation,
} from '@/store/apis/userApi'; // Adjust the path as needed

export default function UserProfileControlPanel() {
  // RTK Query Core Hooks
  const { data: profileResponse, isLoading: isFetching, error: fetchError, refetch } = useGetUserProfileQuery({});
  const [createProfile, { isLoading: isCreating }] = useCreateUserProfileMutation();
  const [editProfile, { isLoading: isUpdating }] = useEditUserProfileMutation();
  const [deleteProfile, { isLoading: isDeleting }] = useDeleteUserProfileMutation();

  // Handle standard JSON wraps safely
  const profile: IUserProfile | null = profileResponse 
    ? ('data' in profileResponse ? (profileResponse.data as IUserProfile) : (profileResponse as IUserProfile))
    : null;

  // Structured Form State
  const [textFields, setTextFields] = useState({
    name: '',
    title: '',
    aboutText: '',
    subText: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'view' | 'create' | 'edit'>('view');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTextFields({ ...textFields, [e.target.name]: e.target.value });
  };

  // Mutation Triggers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProfile(textFields).unwrap();
      toast.success('Profile created successfully!');
      setActiveTab('view');
      refetch();
    } catch (err: any) {
      toast.error(`Creation failed: ${err.data?.message || err.message}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', textFields.name);
    formData.append('title', textFields.title);
    formData.append('aboutText', textFields.aboutText);
    formData.append('subText', textFields.subText);

    // Use 'profileUser' as the field key (matches your backend)
    if (avatarFile) formData.append('profileUser', avatarFile);
    if (resumeFile) formData.append('resume', resumeFile);

    try {
      await editProfile(formData).unwrap();
      toast.success('Profile updated successfully!');
      setAvatarFile(null);
      setResumeFile(null);
      setActiveTab('view');
      refetch();
    } catch (err: any) {
      toast.error(`Update failed: ${err.data?.message || err.message}`);
    }
  };

  const handleSetActiveImage = async (imageUrl: string) => {
    const formData = new FormData();
    formData.append('setActiveImageUrl', imageUrl);
    
    try {
      await editProfile(formData).unwrap();
      toast.success('Active profile picture updated!');
      refetch();
    } catch (err: any) {
      toast.error(`Failed to update active picture: ${err.data?.message || err.message}`);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this profile?")) {
      try {
        await deleteProfile().unwrap();
        toast.success('Profile deleted successfully!');
        setTextFields({ name: '', title: '', aboutText: '', subText: '' });
        setActiveTab('view');
        refetch();
      } catch (err: any) {
        toast.error(`Deletion failed: ${err.message}`);
      }
    }
  };

  const loadEditFields = () => {
    if (profile) {
      setTextFields({
        name: profile.name || '',
        title: profile.title || '',
        aboutText: profile.aboutText || '',
        subText: profile.subText || ''
      });
    }
    setActiveTab('edit');
  };

  // Find active avatar safely
  const activeAvatar = profile?.profilePictures?.find(pic => pic.isActive);

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-5xl mx-auto mt-4 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Profile Configuration</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your profile information and media assets</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('view')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'view' 
                  ? 'bg-gray-900 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            {!profile && (
              <button
                type="button"
                onClick={() => { 
                  setTextFields({ name: '', title: '', aboutText: '', subText: '' }); 
                  setActiveTab('create'); 
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'create' 
                    ? 'bg-gray-900 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Create Profile
              </button>
            )}
            {profile && (
              <button
                type="button"
                onClick={loadEditFields}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'edit' 
                    ? 'bg-gray-900 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full min-h-125 rounded-xl border border-gray-200 bg-gray-50/50 p-6 sm:p-8">
          
          {/* Loading State */}
          {isFetching && (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading profile data...</p>
            </div>
          )}

          {/* View Screen */}
          {!isFetching && activeTab === 'view' && (
            <div className="space-y-6">
              {fetchError || !profile ? (
                <div className="text-center py-16 max-w-sm mx-auto space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600">No profile found</p>
                    <p className="text-sm text-gray-400 mt-1">Create a new profile to get started</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="text-sm bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    Create Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile Header with Avatar Section */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-6">
                      {/* Avatar Section */}
                      <div className="shrink-0">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                            {activeAvatar?.url ? (
                              <img 
                                src={activeAvatar.url} 
                                alt="Active profile" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-3xl font-medium text-gray-500">
                                {profile.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {profile.profilePictures && profile.profilePictures.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('edit')}
                              className="absolute -bottom-2 -right-2 bg-gray-900 text-white p-1.5 rounded-full text-xs hover:bg-gray-800 transition-colors shadow-lg"
                              aria-label="Edit profile picture"
                              title="Edit profile picture"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Profile Info */}
                      <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-gray-900">{profile.name}</h2>
                        <p className="text-gray-600 mt-1">{profile.title}</p>
                        {profile.subText && (
                          <p className="text-sm text-gray-500 mt-2 italic">{profile.subText}</p>
                        )}
                      </div>
                    </div>

                    {/* Multiple Avatars Gallery */}
                    {profile.profilePictures && profile.profilePictures.length > 1 && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-3">All Profile Pictures</p>
                        <div className="flex gap-3 flex-wrap">
                          {profile.profilePictures.map((pic, index) => (
                            <div key={index} className="relative group">
                              <div className={`w-16 h-16 rounded-full border-2 overflow-hidden ${
                                pic.isActive 
                                  ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' 
                                  : 'border-gray-200'
                              }`}>
                                <img 
                                  src={pic.url} 
                                  alt={`Profile variant ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {!pic.isActive && (
                                <button
                                  type="button"
                                  onClick={() => handleSetActiveImage(pic.url)}
                                  className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  aria-label="Set as main profile picture"
                                  title="Set as main profile picture"
                                >
                                  <span className="text-white text-xs font-medium">Set main</span>
                                </button>
                              )}
                              {pic.isActive && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* About Section */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">About</h3>
                    <p className="text-gray-700 leading-relaxed">{profile.aboutText}</p>
                  </div>

                  {/* Resume Section */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-1">Resume</h3>
                        <p className="text-sm text-gray-500">Download or view the attached resume</p>
                      </div>
                      {profile.resumeUrl ? (
                        <a 
                          href={profile.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Resume
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400 italic">No resume uploaded</span>
                      )}
                    </div>
                  </div>

                  {/* Delete Section */}
                  <div className="pt-4 flex justify-end">
                    <button 
                      type="button"
                      onClick={handleDelete} 
                      disabled={isDeleting}
                      className="text-sm font-medium text-red-600 hover:text-red-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete Profile"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Form */}
          {!isFetching && activeTab === 'create' && (
            <form onSubmit={handleCreate} className="space-y-6 max-w-2xl mx-auto w-full">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Create New Profile</h3>
                <p className="text-sm text-gray-500 mt-1">Fill in the basic information to get started</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="create-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="create-name" 
                    type="text" 
                    name="name" 
                    required 
                                    placeholder="John Doe" 
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors" 
                    value={textFields.name} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div>
                  <label htmlFor="create-title" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Professional Title <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="create-title" 
                    type="text" 
                    name="title" 
                    required 
                    placeholder="Full Stack Developer" 
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors" 
                    value={textFields.title} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div>
                  <label htmlFor="create-about" className="block text-sm font-medium text-gray-700 mb-1.5">
                    About <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="create-about" 
                    name="aboutText" 
                    required 
                    rows={4} 
                    placeholder="Tell us about yourself..." 
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none transition-colors" 
                    value={textFields.aboutText} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div>
                  <label htmlFor="create-subtext" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subtext (Optional)
                  </label>
                  <input 
                    id="create-subtext" 
                    type="text" 
                    name="subText" 
                    placeholder="Building scalable solutions" 
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors" 
                    value={textFields.subText} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isCreating} 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create Profile"}
              </button>
            </form>
          )}

          {/* Edit Form with File Upload */}
          {!isFetching && activeTab === 'edit' && (
            <form onSubmit={handleUpdate} className="space-y-6 max-w-2xl mx-auto w-full">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Edit Profile</h3>
                <p className="text-sm text-gray-500 mt-1">Update your information and media assets</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="edit-name" 
                    type="text" 
                    name="name" 
                    required 
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors" 
                    value={textFields.name} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Professional Title <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="edit-title" 
                    type="text" 
                    name="title" 
                    required 
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors" 
                    value={textFields.title} 
                    onChange={handleInputChange} 
                  />
                </div>

                <div>
                  <label htmlFor="edit-about" className="block text-sm font-medium text-gray-700 mb-1.5">
                    About <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="edit-about" 
                    name="aboutText" 
                    required 
                    rows={4} 
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none transition-colors" 
                    value={textFields.aboutText} 
                    onChange={handleInputChange} 
                  />
                </div>

                <div>
                  <label htmlFor="edit-subtext" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subtext (Optional)
                  </label>
                  <input 
                    id="edit-subtext" 
                    type="text" 
                    name="subText" 
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors" 
                    value={textFields.subText} 
                    onChange={handleInputChange} 
                  />
                </div>

                {/* Profile Picture Upload - matches backend field name 'profileUser' */}
                <div>
                  <label htmlFor="edit-avatar" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Profile Picture
                  </label>
                  <input 
                    id="edit-avatar" 
                    type="file" 
                    accept="image/*" 
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white file:cursor-pointer hover:file:bg-gray-800 transition-colors" 
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} 
                  />
                  {avatarFile && (
                    <p className="text-xs text-green-600 mt-1">New image selected: {avatarFile.name}</p>
                  )}
                  
                  {/* Display existing profile pictures gallery */}
                  {profile?.profilePictures && profile.profilePictures.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-600 mb-2">Current Profile Pictures</p>
                      <div className="flex gap-3 flex-wrap">
                        {profile.profilePictures.map((pic, index) => (
                          <div key={index} className="relative group">
                            <div className={`w-16 h-16 rounded-lg border-2 overflow-hidden ${
                              pic.isActive ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' : 'border-gray-200'
                            }`}>
                              <img 
                                src={pic.url} 
                                alt={`Profile ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {pic.isActive && (
                              <div className="absolute top-0 right-0 -mt-1 -mr-1">
                                <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Note: Upload a new image to add to your collection. Use the overview tab to set active picture.
                      </p>
                    </div>
                  )}
                </div>

                {/* Resume Upload */}
                <div>
                  <label htmlFor="edit-resume" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Resume (PDF)
                  </label>
                  <input 
                    id="edit-resume" 
                    type="file" 
                    accept=".pdf" 
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white file:cursor-pointer hover:file:bg-gray-800 transition-colors" 
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)} 
                  />
                  {profile?.resumeUrl && !resumeFile && (
                    <p className="text-xs text-gray-500 mt-1">Current: Resume file attached</p>
                  )}
                  {resumeFile && (
                    <p className="text-xs text-green-600 mt-1">New resume selected: {resumeFile.name}</p>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isUpdating} 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Save Changes"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}