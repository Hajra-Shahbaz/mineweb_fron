import React, { useMemo } from 'react';
import { useGetUserProfileQuery } from '../../store/apis/userApi';
import { useGetAllSocialLinksQuery } from '../../store/apis/social'; 
import { Mail, Phone, ArrowUpRight, ArrowDown } from 'lucide-react';
import * as FaIcons from 'react-icons/fa';

export const HeroSection: React.FC = () => {
  // 1. Core Data Pipelines
  const { 
    data: profileResult, 
    isLoading: isProfileLoading, 
    isError: isProfileError 
  } = useGetUserProfileQuery(undefined);

  const { 
    data: socialLinks, 
    isLoading: isSocialLoading 
  } = useGetAllSocialLinksQuery();

  // 2. Safe Payload Normalization
  const profile = useMemo(() => {
    if (!profileResult) return null;
    return 'data' in profileResult ? profileResult.data : profileResult;
  }, [profileResult]);

  const activePicture = useMemo(() => {
    return profile?.profilePictures?.find((pic) => pic.isActive)?.url || null;
  }, [profile]);

  const sortedSocials = useMemo(() => {
    if (!socialLinks) return [];
    return [...socialLinks].sort((a, b) => a.order - b.order);
  }, [socialLinks]);

  // Helper to dynamically resolve Font Awesome Icons from string name
  const renderSocialIcon = (iconName: string) => {
    if (!iconName) return <FaIcons.FaLink className="w-4 h-4" />;
    
    let formattedName = iconName.trim();
    if (!formattedName.startsWith('Fa')) {
      formattedName = 'Fa' + formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
    }
    
    const IconComponent = (FaIcons as any)[formattedName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <FaIcons.FaLink className="w-4 h-4" />;
  };

  // 3. Status Gateways (Sleek Minimal Loading Elements)
  if (isProfileLoading || isSocialLoading) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center font-sans tracking-tight text-foreground transition-colors duration-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-muted border-t-foreground animate-spin" />
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground animate-pulse mt-2">Loading Showcase</span>
        </div>
      </div>
    );
  }

  if (isProfileError || !profile) {
    return (
      <div className="w-full h-screen bg-background flex flex-col items-center justify-center font-sans px-6 text-center">
        <div className="text-2xl font-light tracking-tight text-destructive">Could not load profile configuration.</div>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">The handshake to the API infrastructure failed or timed out.</p>
      </div>
    );
  }

  return (
    <section className="relative w-full min-h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background overflow-hidden flex flex-col justify-between border-b border-border antialiased transition-colors duration-500">
      
      {/* 🔮 Soft Organic Background Lighting (Radial Mesh) */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-muted/30 blur-[120px] pointer-events-none z-0 mix-blend-normal dark:mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-muted/20 blur-[100px] pointer-events-none z-0 mix-blend-normal dark:mix-blend-screen" />

      {/* Top Header Navigation Line */}
      <header className="w-full max-w-7xl mx-auto px-6 md:px-16 pt-12 md:pt-16 z-10 flex justify-between items-end tracking-tight motion-preset-slide-down motion-duration-500">
        <div className="flex flex-col">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground/80">Available for contract</span>
          <span className="text-sm font-medium mt-0.5">{profile.name.split(' ')[0]}.studio</span>
        </div>
        <div className="text-xs font-mono text-muted-foreground tracking-wider uppercase hidden sm:block">
          {profile.updatedAt ? `Updated // ${new Date(profile.updatedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}` : ""}
        </div>
      </header>

      {/* Asymmetric Editorial Grid Layout */}
      <main className="w-full max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-24 my-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
        
        {/* Left Typography Cluster */}
        <div className="lg:col-span-7 space-y-10 order-2 lg:order-1 motion-preset-slide-right motion-duration-700">
          
          <div className="space-y-6">
            {profile.subText && (
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground block">
                — {profile.subText}
              </span>
            )}
            {/* Massive Bold High-End Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-normal tracking-tight text-foreground leading-[0.95] font-sans">
              {profile.name}
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground font-light tracking-tight max-w-lg">
              {profile.title}
            </p>
          </div>

          {/* Clean Paragraph Separation */}
          <p className="text-base sm:text-lg text-muted-foreground/90 leading-relaxed max-w-xl font-light">
            {profile.aboutText}
          </p>

          {/* Core Command Interactions (Monochrome Actions) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4">
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center justify-between sm:justify-start gap-4 bg-foreground hover:bg-muted-foreground text-background font-medium text-sm px-7 py-4 rounded-full shadow-sm transition-all duration-300 active:scale-95"
              >
                <span>Read Full Dossier</span>
                <div className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                  <ArrowUpRight className="w-3.5 h-3.5 text-background" />
                </div>
              </a>
            )}

            {/* Flat Monochromatic Social Grid Icons */}
            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
              {sortedSocials.map((link) => (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  title={link.platform}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent hover:border-border/40 transition-all duration-200 active:scale-90"
                >
                  {renderSocialIcon(link.iconName)}
                </a>
              ))}
            </div>
          </div>

          {/* Minimalist Grid Informational Footnote */}
          <div className="flex items-center gap-8 text-xs font-mono text-muted-foreground/60 pt-6 border-t border-border/40 max-w-md">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <a href={`mailto:${profile.email}`} className="hover:text-foreground transition-colors">{profile.email}</a>
            </div>
            {profile.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                <a href={`tel:${profile.phoneNumber}`} className="hover:text-foreground transition-colors">{profile.phoneNumber}</a>
              </div>
            )}
          </div>

        </div>

        {/* Right Media Portrait Container */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2 motion-preset-slide-left motion-duration-700">
          <div className="relative w-full max-w-[300px] sm:max-w-[360px] aspect-[3/4]">
            
            {/* Elegant Minimal Thin Border Accents */}
            <div className="absolute -inset-4 border border-border/30 rounded-[2.5rem] pointer-events-none scale-95 group-hover:scale-100 transition-transform duration-700 ease-out z-0" />
            
            {/* Image Canvas Frame */}
            {activePicture ? (
              <div className="relative w-full h-full bg-muted overflow-hidden rounded-[2rem] filter grayscale hover:grayscale-0 contrast-[1.02] dark:contrast-[1.06] transition-all duration-1000 ease-out shadow-sm z-10 border border-border/40">
                <img
                  src={activePicture}
                  alt={profile.name}
                  className="w-full h-full object-cover opacity-[0.93] hover:opacity-100 hover:scale-105 transition-all duration-1000 ease-out"
                  loading="eager"
                />
              </div>
            ) : (
              /* High-End Empty Structural Canvas */
              <div className="relative w-full h-full bg-muted/30 border border-border/50 rounded-[2rem] flex flex-col justify-between p-8 z-10 backdrop-blur-sm">
                <div className="text-[11px] font-mono tracking-widest text-muted-foreground/40 uppercase">No Display Artifact Injected</div>
                <div className="text-7xl font-extralight tracking-tighter text-muted-foreground/10 select-none">
                  {profile.name.split(' ').map((n) => n[0]).join('')}
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Elegant Ground Level Anchor Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 md:px-16 pb-12 z-10 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs text-muted-foreground border-t border-border/40 pt-8 motion-preset-slide-up motion-duration-500">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">&copy; {new Date().getFullYear()}</span>
          <span className="text-muted-foreground/40">/</span>
          <span>All rights reserved to individual creators</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground/50 text-xs">
          <span>Scroll to uncover</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce duration-1000" />
        </div>
      </footer>

    </section>
  );
};