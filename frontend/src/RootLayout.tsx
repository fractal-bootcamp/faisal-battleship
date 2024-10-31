import { Outlet } from "react-router-dom"

// Root layout component that serves as the main wrapper for the application
// Uses Outlet from react-router to render nested child routes
const RootLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main content container */}
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    )
}

export default RootLayout