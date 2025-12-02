import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api";
import { AppContext } from "../../context/appContext";

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AppContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post('/auth/register', { email, username, password });
            login(res.data.token);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.error || err.response?.data?.msg || 'Registration failed. Please try again.';
            alert(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream cursor-ink flex items-center justify-center p-8">
            <div className="w-full max-w-lg">
                <div className="mb-12 transform -rotate-1">
                    <div className="flex items-end space-x-4 mb-6">
                        <div className="w-16 h-16 bg-charcoal transform rotate-12 flex items-center justify-center">
                            <span className="text-terracotta font-display font-bold text-2xl transform -rotate-12">T</span>
                        </div>
                        <div>
                            <h1 className="font-display text-5xl font-bold text-charcoal leading-none mb-2">Create account</h1>
                            <p className="font-mono text-rust text-sm tracking-wide">// register.newUser()</p>
                        </div>
                    </div>
                </div>

                <div className="bg-sand border-l-8 border-l-rust p-8 shadow-paper transform rotate-1">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block font-mono text-sm font-medium text-charcoal mb-3 tracking-wide">
                                email_address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                required
                                className="w-full px-6 py-4 bg-cream border-2 border-clay focus:border-terracotta focus:outline-none font-sans text-charcoal placeholder-fog transform focus:rotate-0 transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block font-mono text-sm font-medium text-charcoal mb-3 tracking-wide">
                                username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="your_username"
                                required
                                className="w-full px-6 py-4 bg-cream border-2 border-clay focus:border-terracotta focus:outline-none font-sans text-charcoal placeholder-fog transform focus:rotate-0 transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block font-mono text-sm font-medium text-charcoal mb-3 tracking-wide">
                                password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                    className="w-full px-6 py-4 pr-12 bg-cream border-2 border-clay focus:border-terracotta focus:outline-none font-mono text-charcoal placeholder-fog transform focus:rotate-0 transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-clay hover:text-charcoal transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 px-6 bg-rust hover:bg-terracotta disabled:bg-fog disabled:cursor-not-allowed text-cream font-sans font-bold shadow-brutal hover:shadow-ink-drop transition-all duration-200 transform hover:-translate-y-1 hover:rotate-1 disabled:transform-none"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-3">
                                    <div className="w-5 h-5 border-2 border-cream border-t-transparent animate-spin"></div>
                                    <span className="font-mono">creating account...</span>
                                </div>
                            ) : (
                                <span className="font-mono">register()</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t-2 border-dashed border-clay">
                        <p className="font-mono text-charcoal text-sm">
                            <span className="text-fog">// </span>
                            already registered?{' '}
                            <Link
                                to="/login"
                                className="text-rust hover:text-terracotta font-semibold underline decoration-2 underline-offset-4 hover:decoration-terracotta transition-colors duration-200"
                            >
                                login()
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register;