
export function Footer() {
    return (
        <footer className="sticky bottom-0 z-50 bg-gray-900/80 border-t border-gray-800">
            <div className="container mx-auto px-4 py-4 text-center text-gray-300">
                &copy; {new Date().getFullYear()} DevConfession. MADufour.
            </div>
        </footer>
    );
}