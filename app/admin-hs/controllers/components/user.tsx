'use client';

import React, { useState, useEffect } from 'react';
import { 
  useGetUserProfileQuery, 
  useCreateUserProfileMutation, 
  useEditUserProfileMutation 
} from '../../../../store/apis/userApi';
import * as LucideIcons from 'lucide-react';

export const SystemUserView: React.FC = () => {
  const { data: profileResponse, isLoading, isError, refetch } = useGetUserProfileQuery({});
  const [createProfile, { isLoading: isCreating }] = useCreateUserProfileMutation();
  const [editProfile, { isLoading: isUpdating }] = useEditUserProfileMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');                 // 🌟 Added email state
  const [phoneNumber, setPhoneNumber] = useState('');     // 🌟 Added phoneNumber state
  const [title, setTitle] = useState('');
  const [subText, setSubText] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  
  // Instagram Preview State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const profile = profileResponse && 'data' in profileResponse ? profileResponse.data : profileResponse;
  const hasProfile = !!profile && '_id' in profile;

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');                      // 🌟 Hydrate email field
      setPhoneNumber(profile.phoneNumber || '');          // 🌟 Hydrate phoneNumber field
      setTitle(profile.title || '');
      setSubText(profile.subText || '');
      setAboutText(profile.aboutText || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name || !email || !title || !aboutText) {
      setMessage({ text: 'Name, Email, Title, and About Text areas are completely required.', isError: true });
      return;
    }

    try {
      if (!hasProfile) {
        // Submit raw JSON for initial config block
        await createProfile({ name, email, phoneNumber, title, subText, aboutText }).unwrap();
        setMessage({ text: 'Profile established successfully!', isError: false });
      } else {
        // Submit multi-part layout payload structure
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);                  // 🌟 Append email to form elements
        formData.append('phoneNumber', phoneNumber);      // 🌟 Append phoneNumber to form elements
        formData.append('title', title);
        formData.append('subText', subText);
        formData.append('aboutText', aboutText);

        const profileInput = document.getElementById('profilePicInput') as HTMLInputElement;
        const resumeInput = document.getElementById('resumeFileInput') as HTMLInputElement;

        if (profileInput?.files?.[0]) {
          formData.append('profileUser', profileInput.files[0]);
        }
        if (resumeInput?.files?.[0]) {
          formData.append('resume', resumeInput.files[0]);
        }

        await editProfile(formData).unwrap();
        setMessage({ text: 'Profile changes committed successfully!', isError: false });
        
        if (profileInput) profileInput.value = '';
        if (resumeInput) resumeInput.value = '';
      }
      refetch();
    } catch (err: any) {
      setMessage({ 
        text: err?.data?.message || err?.message || 'Failed to commit profile updates.', 
        isError: true 
      });
    }
  };

  const handleSetActiveImage = async (imageUrl: string) => {
    if (!hasProfile) return;
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('setActiveImageUrl', imageUrl);
      formData.append('name', name);
      formData.append('email', email);                    // 🌟 Retain context on picture toggle
      formData.append('phoneNumber', phoneNumber);        // 🌟 Retain context on picture toggle
      formData.append('title', title);
      formData.append('aboutText', aboutText);
      formData.append('subText', subText);

      await editProfile(formData).unwrap();
      setMessage({ text: 'Active profile display image updated!', isError: false });
      refetch();
    } catch (err: any) {
      setMessage({ text: 'Could not switch active profile element reference context.', isError: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-start min-h-[200px] text-zinc-400 text-xs pl-0">
        <div className="animate-spin mr-1.5 h-3.5 w-3.5 border-2 border-zinc-500 border-t-transparent rounded-full" />
        Loading parameters...
      </div>
    );
  }

  const activeImageUrl = profile?.profilePictures?.find(img => img.isActive)?.url;

  return (
    <div className="w-full space-y-4 pl-0 ml-0 left-0">
      
      {/* Header aligned fully left */}
      <div className="pl-0">
        <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Profile Configurations</h2>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          {hasProfile ? 'Update global context configurations, download streams, and display instances.' : 'Initialize primary profile setup layout data.'}
        </p>
      </div>

      {/* Tighter Alert Banner */}
      {message && (
        <div className={`p-2 text-xs rounded-md flex items-center gap-1.5 border ${
          message.isError 
            ? 'bg-red-50 text-red-600 border-red-100' 
            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
        }`}>
          {message.isError ? <LucideIcons.AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <LucideIcons.CheckCircle className="w-3.5 h-3.5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid Layout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Core Form Element */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-3">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="profileName" className="block text-[11px] font-medium text-zinc-600 mb-0.5">Full Name</label>
              <input
                id="profileName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="profileTitle" className="block text-[11px] font-medium text-zinc-600 mb-0.5">Professional Title</label>
              <input
                id="profileTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Full-Stack Engineer"
                className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
                required
              />
            </div>
          </div>

          {/* 🌟 New Contact Fields Grid Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="profileEmail" className="block text-[11px] font-medium text-zinc-600 mb-0.5">Email Address</label>
              <input
                id="profileEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="profilePhone" className="block text-[11px] font-medium text-zinc-600 mb-0.5">Phone Number (Optional)</label>
              <input
                id="profilePhone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="profileSubText" className="block text-[11px] font-medium text-zinc-600 mb-0.5">Subtext / Tagline</label>
            <input
              id="profileSubText"
              type="text"
              value={subText}
              onChange={(e) => setSubText(e.target.value)}
              placeholder="Building scalable web platforms"
              className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
            />
          </div>

          <div>
            <label htmlFor="profileAbout" className="block text-[11px] font-medium text-zinc-600 mb-0.5">About Statement Summary</label>
            <textarea
              id="profileAbout"
              value={aboutText}
              onChange={(e) => setAboutText((e.target as HTMLTextAreaElement).value)}
              placeholder="Describe your background, stacks, and experiences..."
              rows={3}
              className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white resize-none"
              required
            />
          </div>

          {hasProfile && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
              <div>
                <label htmlFor="profilePicInput" className="block text-[11px] font-medium text-zinc-600 mb-0.5">Upload Profile Photo</label>
                <input
                  id="profilePicInput"
                  type="file"
                  accept="image/*"
                  className="w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="resumeFileInput" className="block text-[11px] font-medium text-zinc-600 mb-0.5">Upload New Resume (PDF)</label>
                <input
                  id="resumeFileInput"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="inline-flex items-center justify-center px-3.5 py-1.5 bg-zinc-950 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors disabled:bg-zinc-400 mt-1"
          >
            {(isCreating || isUpdating) && <div className="animate-spin mr-1.5 h-3 w-3 border-2 border-white border-t-transparent rounded-full" />}
            {hasProfile ? 'Save Structural Updates' : 'Initialize Profile Node'}
          </button>
        </form>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-[11px] font-semibold text-zinc-400 tracking-wide uppercase">Historical Media</h3>
            
            {/* Active Display Element with Click-and-Hold Preview */}
            <div className="flex flex-col items-center justify-center py-1 pb-2 border-b border-zinc-100">
              {activeImageUrl ? (
                <div 
                  className="relative cursor-pointer select-none active:scale-95 transition-transform"
                  onMouseDown={() => setPreviewImage(activeImageUrl)}
                  onMouseUp={() => setPreviewImage(null)}
                  onMouseLeave={() => setPreviewImage(null)}
                  onTouchStart={() => setPreviewImage(activeImageUrl)}
                  onTouchEnd={() => setPreviewImage(null)}
                >
                  <img 
                    src={activeImageUrl} 
                    alt="Active display snapshot" 
                    className="w-20 h-20 rounded-full object-cover border border-zinc-950 p-0.5 shadow-sm"
                    draggable="false"
                  />
                  <div className="absolute bottom-0 right-0 bg-zinc-950 p-1 rounded-full text-white border border-white">
                    <LucideIcons.Maximize2 className="w-2 h-2" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-zinc-50 border border-dashed border-zinc-200 flex items-center justify-center text-zinc-400 text-[11px]">
                  No Image
                </div>
              )}
              <span className="text-[9px] text-zinc-400 font-medium mt-1 uppercase tracking-wider">Hold image to peek</span>
            </div>

            {/* Document Link */}
            {profile?.resumeUrl && (
              <a 
                href={profile.resumeUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 bg-zinc-50 px-2 py-1.5 rounded border border-zinc-100"
              >
                <LucideIcons.FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="truncate font-medium">View Current Resume.pdf</span>
                <LucideIcons.ExternalLink className="w-3 h-3 ml-auto text-zinc-400" />
              </a>
            )}

            {/* Thumbnails Grid with Peek Support */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Gallery ({profile?.profilePictures?.length || 0})</label>
              
              {profile?.profilePictures && profile.profilePictures.length > 0 ? (
                <div className="grid grid-cols-4 gap-1.5">
                  {profile.profilePictures.map((image, index) => (
                    <div key={index} className="relative aspect-square group">
                      <button
                        type="button"
                        onClick={() => handleSetActiveImage(image.url)}
                        onMouseDown={() => setPreviewImage(image.url)}
                        onMouseUp={() => setPreviewImage(null)}
                        onMouseLeave={() => setPreviewImage(null)}
                        onTouchStart={() => setPreviewImage(image.url)}
                        onTouchEnd={() => setPreviewImage(null)}
                        className={`w-full h-full rounded overflow-hidden bg-zinc-50 border select-none transition-transform active:scale-95 ${
                          image.isActive ? 'border-zinc-950 ring-1 ring-zinc-950/20' : 'border-zinc-200'
                        }`}
                      >
                        <img 
                          src={image.url} 
                          alt={`Snapshot reference ${index}`} 
                          className="w-full h-full object-cover"
                          draggable="false"
                        />
                        {image.isActive && (
                          <div className="absolute inset-0 bg-zinc-950/30 flex items-center justify-center">
                            <LucideIcons.Check className="w-3 h-3 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-400 italic">No historical assets.</p>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Instagram Portal-Style Lightbox Overlay */}
      {previewImage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm pointer-events-none transition-opacity duration-150 animate-fadeIn">
          <div className="relative max-w-[90vw] max-h-[80vh] p-2 bg-white rounded-lg shadow-2xl scale-100 transition-transform animate-scaleUp">
            <img 
              src={previewImage} 
              alt="Live peek preview wrapper instance" 
              className="max-w-full max-h-[70vh] rounded object-contain"
            />
            <div className="text-center text-[10px] text-zinc-400 font-medium mt-1.5 uppercase tracking-wide">
              Release click/touch to exit preview
            </div>
          </div>
        </div>
      )}

    </div>
  );
};