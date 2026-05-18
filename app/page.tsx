import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950 px-4">
      <main className="flex w-full max-w-md flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 text-center">
        
        {/* Animated/Styled Status Indicator */}
        <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
          <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-emerald-400 opacity-75 top-4 right-4"></span>
          <svg
            className="h-8 w-8 text-emerald-500 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            System Status
          </h1>
          <p className="text-base font-medium text-emerald-600 dark:text-emerald-400">
            Connected with the backend
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Your Next.js frontend is successfully communicating with the server environment.
          </p>
        </div>

      </main>
    </div>
  );
}