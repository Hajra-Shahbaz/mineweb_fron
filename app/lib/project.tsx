"use client";

import Link from "next/link";

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
}

const myProjects: Project[] = [
  {
    id: 1,
    title: "rishta.comm",
    description: "A matchmaking and profile platform built for pet adoption and pairing. Features secure user authentication and dynamic filtering.",
    tags: ["Next.js", "MongoDB", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 2,
    title: "Owly-Weather",
    description: "A sleek weather dashboard utilizing external weather APIs. Features automated geolocation data tracking and interactive visual cards.",
    tags: ["React", "Node.js", "Tailwind CSS", "REST API"],
  },
  {
    id: 3,
    title: "Library of Owls",
    description: "An advanced system for managing digital collections, featuring complex secure user management and server-side route definitions.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "AWS EC2"],
  },
];

export default function FeaturedProjects() {
  return (
    <section id="projects" className="py-12 px-4 bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto">
        
        {/* Header - Tightened margins */}
        <div className="flex flex-col mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            Selected Works
          </h2>
          <p className="text-sm text-zinc-400 max-w-md">
            A small curated collection of web applications built from scratch.
          </p>
        </div>

        {/* Fully Responsive Grid (1 col on mobile, 2 on tablet, 3 on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {myProjects.map((project) => (
            <div
              key={project.id}
              className="group relative flex flex-col justify-between p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md transition-all duration-300 hover:border-zinc-700/80 hover:bg-zinc-900/60 hover:-translate-y-1"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div>
                <h3 className="text-lg font-semibold text-zinc-100 tracking-wide mb-2 group-hover:text-white transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  {project.description}
                </p>
              </div>

              {/* Tags and Metadata */}
              <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-zinc-800/40">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono tracking-wider text-zinc-400 bg-zinc-800/50 border border-zinc-700/30 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Link
            href="/projects"
            className="px-5 py-2 rounded-full border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-950 hover:border-zinc-100 shadow-md"
          >
            View All Projects
          </Link>
        </div>

      </div>
    </section>
  );
}