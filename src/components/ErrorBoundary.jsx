import { Component } from 'react';
import { motion } from 'framer-motion';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log ke console di dev, bisa dikirim ke Sentry di production
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream dark:bg-gray-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-xl text-center max-w-md w-full"
          >
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-bold text-chocolate dark:text-pastel-pink font-elegant mb-3">
              Oops! Ada yang salah
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              Terjadi kesalahan yang tidak terduga. Coba refresh halaman atau kembali ke beranda.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left mb-6">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 mb-2">
                  Detail error (dev only)
                </summary>
                <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded-xl overflow-auto text-red-500 max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-chocolate text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-dark-chocolate transition-colors"
              >
                Refresh Halaman
              </button>
              <a
                href="/"
                className="border-2 border-chocolate text-chocolate px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-cream transition-colors"
              >
                Ke Beranda
              </a>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
