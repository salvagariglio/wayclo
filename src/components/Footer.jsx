"use client";
export default function Footer() {
    return (
        <footer className="py-12 border-t border-white/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                    <p className="text-black/60 text-sm">
                        © {new Date().getFullYear()} CyberCloud.
                    </p>
                </div>
            </div>
        </footer>
    );
}
