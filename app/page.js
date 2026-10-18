import ClipboardApp from "@/components/ClipboardApp";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="font-poppins text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Pastely
          </h1>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-zinc-500">
            Copy and Paste text, photos, and files from different devices. Automatically deleted after 5 minutes.
          </p>
        </div>
        <ClipboardApp />
      </main>

      <footer className="py-8 text-center text-xs text-zinc-400">
        <p>Pastely · Private and temporary clipboard pastebin</p>
      </footer>
    </div>
  );
}
