import Link from 'next/link'

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Hero Section */}
                    <div className="mb-12">
                        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                            DevFlow
                        </h1>
                        <p className="text-2xl text-gray-300 mb-8">
                            Spotify Wrapped for Developers
                        </p>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Track your coding productivity, discover patterns, unlock achievements,
                            and share your developer journey with beautiful year-in-review cards.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <div className="text-4xl mb-3">📊</div>
                            <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                            <p className="text-gray-300">
                                Track commits, PRs, issues, and productivity scores with beautiful visualizations
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <div className="text-4xl mb-3">🏆</div>
                            <h3 className="text-xl font-semibold mb-2">Achievements</h3>
                            <p className="text-gray-300">
                                Unlock 15+ achievements and compete on global leaderboards
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <div className="text-4xl mb-3">🤖</div>
                            <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
                            <p className="text-gray-300">
                                Get personalized productivity tips and burnout warnings powered by GPT-4
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <div className="text-4xl mb-3">🎁</div>
                            <h3 className="text-xl font-semibold mb-2">Year in Review</h3>
                            <p className="text-gray-300">
                                Generate beautiful shareable cards showcasing your coding year
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="space-y-4">
                        <Link
                            href="/api/auth/signin"
                            className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-8 py-4 rounded-lg transition-all transform hover:scale-105"
                        >
                            Sign in with GitHub
                        </Link>
                        <p className="text-sm text-gray-400">
                            Free forever • No credit card required
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div>
                            <div className="text-3xl font-bold text-purple-400">10+</div>
                            <div className="text-sm text-gray-400">API Endpoints</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-pink-400">15+</div>
                            <div className="text-sm text-gray-400">Achievements</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-blue-400">AI</div>
                            <div className="text-sm text-gray-400">Powered Insights</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
