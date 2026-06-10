import React, { useState, useEffect } from 'react';
import { 
  useGetAllSocialLinksQuery, 
  useAddSocialLinkMutation, 
  useEditSocialLinkMutation, 
  useDeleteSocialLinkMutation, 
  useReorderSocialLinksMutation 
} from '../../../../store/apis/social';

// Import iconic sets dynamically for searchable registry lookup
import * as LucideIcons from 'lucide-react';
import * as FaIcons from 'react-icons/fa';

// Define explicit local interface matching the RTK Query structural data types
interface ISocialItem {
  _id: string;
  platform: string;
  url: string;
  iconName?: string;
  order: number;
}

// Combine icons into a searchable lookup layout map
const lucideKeys = Object.keys(LucideIcons).filter(key => typeof (LucideIcons as any)[key] === 'object');
const faKeys = Object.keys(FaIcons).filter(key => typeof (FaIcons as any)[key] === 'function');

export const SocialManager: React.FC = () => {
  // RTK Queries & Mutations
  const { data: socials = [], isLoading } = useGetAllSocialLinksQuery();
  const [addSocial] = useAddSocialLinkMutation();
  const [editSocial] = useEditSocialLinkMutation();
  const [deleteSocial] = useDeleteSocialLinkMutation();
  const [reorderSocials] = useReorderSocialLinksMutation();

  // Form State
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [iconName, setIconName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Icon Suggestion Overlay States
  const [iconSearch, setIconSearch] = useState('');
  const [filteredIcons, setFilteredIcons] = useState<string[]>([]);
  const [showIconDropdown, setShowIconDropdown] = useState(false);

  // Handle live icon search compilation across both icon libraries
  useEffect(() => {
    if (!iconSearch.trim()) {
      setFilteredIcons([]);
      return;
    }

    const query = iconSearch.toLowerCase();
    
    // Filter matches from Lucide
    const matchedLucide = lucideKeys
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 15)
      .map(name => `Lucide:${name}`);

    // Filter matches from FontAwesome
    const matchedFA = faKeys
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 15)
      .map(name => `FA:${name}`);

    setFilteredIcons([...matchedLucide, ...matchedFA]);
  }, [iconSearch]);

  // Dynamic Icon Preview Renderer
  const renderIconPreview = (fullIconString: string) => {
    if (!fullIconString) return <LucideIcons.HelpCircle className="w-4 h-4 text-zinc-400" />;
    
    const [provider, name] = fullIconString.split(':');
    
    if (provider === 'Lucide') {
      const IconComponent = (LucideIcons as any)[name];
      return IconComponent ? <IconComponent className="w-4 h-4" /> : <LucideIcons.HelpCircle className="w-4 h-4" />;
    }
    
    if (provider === 'FA') {
      const IconComponent = (FaIcons as any)[name];
      return IconComponent ? <IconComponent className="w-4 h-4" /> : <LucideIcons.HelpCircle className="w-4 h-4" />;
    }

    return <LucideIcons.HelpCircle className="w-4 h-4" />;
  };

  // Submit Submission Loop
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform || !url) return;

    const payload = { platform, url, iconName };

    if (editingId) {
      await editSocial({ id: editingId, data: payload });
      setEditingId(null);
    } else {
      await addSocial(payload);
    }

    // Reset Form Elements
    setPlatform('');
    setUrl('');
    setIconName('');
    setIconSearch('');
  };

  const startEdit = (item: ISocialItem) => {
    setEditingId(item._id);
    setPlatform(item.platform);
    setUrl(item.url);
    setIconName(item.iconName || '');
    setIconSearch(item.iconName ? item.iconName.split(':')[1] || '' : '');
  };

  // Defensive Sequence Sorter Array Operations
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const workingArray = [...socials].map(s => ({ id: s._id, order: s.order }));
    
    if (!workingArray[index] || !workingArray[index - 1]) return;

    const temp = workingArray[index].order;
    workingArray[index].order = workingArray[index - 1].order;
    workingArray[index - 1].order = temp;

    await reorderSocials({ totalSequence: workingArray });
  };

  const handleMoveDown = async (index: number) => {
    if (index === socials.length - 1) return;
    const workingArray = [...socials].map(s => ({ id: s._id, order: s.order }));
    
    if (!workingArray[index] || !workingArray[index + 1]) return;

    const temp = workingArray[index].order;
    workingArray[index].order = workingArray[index + 1].order;
    workingArray[index + 1].order = temp;

    await reorderSocials({ totalSequence: workingArray });
  };

  if (isLoading) return <div className="text-zinc-900 text-xs font-medium">Loading Connections Stack...</div>;

  return (
    <div className="bg-white text-zinc-900 w-full">
      {/* Header Block Section */}
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Social Profile Connections</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Configure and order external gateway nodes across your design layout.</p>
      </div>

      {/* Input Management Form */}
      <form 
        onSubmit={handleSubmit} 
        className="p-4 border border-zinc-200 rounded-xl space-y-3 mb-4 bg-zinc-50"
      >
        <h3 className="text-sm font-semibold text-zinc-800">
          {editingId ? "Modify Connection Meta" : "Link New Channel Resource"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-0.5">Platform Name</label>
            <input 
              type="text" 
              value={platform} 
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g. GitHub, LinkedIn" 
              className="w-full bg-white border border-zinc-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-800 focus:text-black transition-colors duration-150"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-0.5">Gateway Endpoint Destination URL</label>
            <input 
              type="url" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..." 
              className="w-full bg-white border border-zinc-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-800 focus:text-black transition-colors duration-150"
            />
          </div>
        </div>

        {/* Autocomplete Live Icon Picker Selection Controller */}
        <div className="relative">
          <label className="block text-[11px] font-medium text-zinc-500 mb-0.5">Assigned Display Icon</label>
          <div className="flex items-center gap-2.5 bg-white border border-zinc-500 rounded-lg px-2.5 py-1.5">
            <div className="p-1 bg-zinc-50 border border-zinc-200 rounded">
              {renderIconPreview(iconName)}
            </div>
            <input 
              type="text" 
              value={iconSearch} 
              onFocus={() => setShowIconDropdown(true)}
              onChange={(e) => {
                setIconSearch(e.target.value);
                setShowIconDropdown(true);
              }}
              placeholder="Type to search icons (e.g. Github, Linkedin, Terminal, Globe)..." 
              className="w-full bg-transparent text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none"
            />
          </div>

          {/* Custom Autocomplete Lookup Flyout Dropdown Option Box */}
          {showIconDropdown && filteredIcons.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-zinc-500 rounded-lg shadow-xl z-50 grid grid-cols-2 p-1 gap-1">
              {filteredIcons.map((fullKey) => {
                const [provider, rawName] = fullKey.split(':');
                return (
                  <button
                    key={fullKey}
                    type="button"
                    onClick={() => {
                      setIconName(fullKey);
                      setIconSearch(rawName);
                      setShowIconDropdown(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-50 rounded-md text-left transition-colors"
                  >
                    <span className="text-zinc-500">{renderIconPreview(fullKey)}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-zinc-800 truncate">{rawName}</span>
                      <span className="text-[9px] text-zinc-400 font-mono tracking-wider">{provider}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          
          {showIconDropdown && iconSearch && filteredIcons.length === 0 && (
            <div className="absolute left-0 right-0 mt-1 p-3 text-center text-xs text-zinc-400 bg-white border border-zinc-500 rounded-lg z-50">
              No matching vector signatures found inside registry libraries.
            </div>
          )}
          
          {/* Click outside closer hook */}
          {showIconDropdown && (
            <div className="fixed inset-0 z-40" onClick={() => setShowIconDropdown(false)} />
          )}
        </div>

        {/* Form Action Controls - Only the primary save button goes orange on editing state */}
        <div className="flex justify-end gap-1.5 pt-1">
          {editingId && (
            <button 
              type="button" 
              onClick={() => { setEditingId(null); setPlatform(''); setUrl(''); setIconName(''); setIconSearch(''); }}
              className="px-3 py-1.5 text-xs bg-zinc-200 text-zinc-700 hover:bg-zinc-300 rounded-md transition-colors"
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            className={`px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors ${
              editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-zinc-900 hover:bg-zinc-800'
            }`}
          >
            {editingId ? "Save Changes" : "Add Connection"}
          </button>
        </div>
      </form>

      {/* Existing Records Row Matrix Layout */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-zinc-400">Configured Active Sequences</h3>
        
        {/* Grid display configured to show 2 per row on large displays */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {socials.length === 0 ? (
            <div className="p-6 text-center text-zinc-400 text-xs border border-zinc-200 rounded-xl col-span-full">
              No active profiles connected inside storage clusters yet.
            </div>
          ) : (
            socials.map((item: ISocialItem, index: number) => (
              <div 
                key={item._id} 
                className="flex items-center justify-between p-2.5 border border-zinc-200 rounded-xl bg-white group hover:bg-zinc-50/50 transition-colors relative"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  
                  {/* Index Arrow Reorder Triggers */}
                  <div className="flex flex-col gap-0.5 z-10">
                    <button 
                      type="button" 
                      title="Move profile link up"
                      aria-label="Move profile link up"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-0.5 hover:bg-zinc-200 rounded text-zinc-500 disabled:opacity-20 disabled:hover:bg-transparent"
                    >
                      <LucideIcons.ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button" 
                      title="Move profile link down"
                      aria-label="Move profile link down"
                      disabled={index === socials.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-0.5 hover:bg-zinc-200 rounded text-zinc-500 disabled:opacity-20 disabled:hover:bg-transparent"
                    >
                      <LucideIcons.ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Vector Icon Graph Node Preview */}
                  <div className="p-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 z-10">
                    {renderIconPreview(item.iconName || '')}
                  </div>

                  {/* Interactive Text Blocks running external gateways */}
                  <div className="min-w-0 flex-1 relative">
                    {/* Clean Anchor layer ensuring targeted safe link expansion */}
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="absolute inset-0 z-0 cursor-pointer"
                      title={`Open ${item.platform} in a new tab`}
                    />
                    <h4 className="text-xs font-semibold flex items-center gap-1.5 text-zinc-900 relative z-10 pointer-events-none">
                      {item.platform}
                      <span className="text-[9px] font-mono bg-zinc-50 px-1 py-0.2 border border-zinc-200 rounded text-zinc-400">
                        {item.order}
                      </span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-mono truncate max-w-full relative z-10 pointer-events-none">
                      {item.url}
                    </p>
                  </div>
                </div>

                {/* Operation Control Group */}
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-white md:bg-transparent pl-1">
                  <button 
                    type="button"
                    title="Edit connection profile"
                    onClick={() => startEdit(item)}
                    className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    <LucideIcons.Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    title="Delete connection profile"
                    onClick={() => deleteSocial(item._id)}
                    className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <LucideIcons.Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};