"use client";

import React, { useState, useEffect } from 'react';

interface Project {
  _id: string;
  title: string;
  description: string;
  liveLink?: string;
  githubLink?: string;
  tags?: string[];
}

export default function ProjectsControlPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state for creating a project if collection is empty
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    liveLink: '',
    githubLink: '',
    tags: ''
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apimw.hasoftz.com/api';

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const res = await fetch(`${API_URL}/project`);
      
      if (!res.ok) {
        throw new Error(`Server returned code ${res.status}`);
      }
      
      const data = await res.json();
      // Handle standard API variants: wrapper objects (data.data) or direct arrays
      const projectList = Array.isArray(data) ? data : data.data || [];
      setProjects(projectList);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setErrorMsg("Unable to retrieve project profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Parse comma-separated tags into an array
      const projectPayload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      const res = await fetch(`${API_URL}/project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectPayload),
      });

      if (!res.ok) throw new Error('Could not add project configuration to cluster.');

      // Clear form and reload data
      setFormData({ title: '', description: '', liveLink: '', githubLink: '', tags: '' });
      await fetchProjects();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b26] bg-gradient-to-br from-[#0b0b26] via-[#11113a] to-[#191973] p-6 text-white font-sans flex flex-col items-center">
      
      {/* Branding Header */}
      <div className="w-full max-w-5xl mb-6 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-200 bg-clip-text text-transparent">
          Owl·Control Systems
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          Route Tracking: <span className="text-pink-400 bg-pink-950/40 px-2 py-0.5 rounded border border-pink-900/30">{API_URL}/project</span>
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Creation Form Panel */}
        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 h-fit shadow-2xl">
          <h3 className="text-lg font-bold tracking-wide mb-4 flex items-center gap-2">
            <span className="w-1.5 h-3 bg-indigo-500 rounded-sm inline-block" />
            Add New Project
          </h3>
          
          <form onSubmit={handleCreateProject} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-mono text-indigo-300 uppercase tracking-wider mb-1">Project Title</label>
              <input 
                type="text" required placeholder="e.g., Blog_Folio platform"
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-indigo-300 uppercase tracking-wider mb-1">Description</label>
              <textarea 
                required placeholder="Describe architecture features..." rows={3}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-indigo-300 uppercase tracking-wider mb-1">Live Application URL</label>
              <input 
                type="url" placeholder="https://..."
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                value={formData.liveLink}
                onChange={(e) => setFormData({...formData, liveLink: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-indigo-300 uppercase tracking-wider mb-1">Source Repository URL</label>
              <input 
                type="url" placeholder="https://github.com/..."
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                value={formData.githubLink}
                onChange={(e) => setFormData({...formData, githubLink: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-indigo-300 uppercase tracking-wider mb-1">Tags (Comma Separated)</label>
              <input 
                type="text" placeholder="Next.js, TypeScript, AWS EC2"
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 font-semibold text-sm py-2.5 rounded-lg shadow-lg active:scale-[0.99] transition-all disabled:opacity-50"
            >
              Push Component to Cluster
            </button>
          </form>
        </div>

        {/* Right Side: Render List Panel */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 shadow-2xl min-h-[450px] flex flex-col">
          <h3 className="text-lg font-bold tracking-wide mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-3 bg-purple-500 rounded-sm inline-block" />
              Active Project Repository Listings
            </span>
            <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
              Count: {projects.length}
            </span>
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center my-auto space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
              <p className="text-xs font-mono text-indigo-200">Reindexing cluster nodes...</p>
            </div>
          ) : errorMsg || projects.length === 0 ? (
            
            /* Graceful Empty/Error Catching State */
            <div className="my-auto text-center py-12 px-4 max-w-md mx-auto space-y-3">
              <p className="text-sm font-semibold text-amber-400">⚠️ No Project Configurations Found</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                The live data cluster target responded smoothly, but the array contains zero modules. Use the entry matrix interface to push your first work repository build logs.
              </p>
            </div>
          ) : (
            
            /* Rendered Grid of Data Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[600px] pr-1">
              {projects.map((project) => (
                <div key={project._id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-200">
                  <div>
                    <h4 className="font-bold text-base tracking-wide text-white">{project.title}</h4>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">{project.description}</p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {/* Tags Array Mapping */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-900/30 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Anchor Connections */}
                    <div className="flex items-center gap-3 pt-2 border-t border-white/5 text-xs font-mono">
                      {project.liveLink && (
                        <a href={project.liveLink} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                          Live App ↗
                        </a>
                      )}
                      {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                          Source Code ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}