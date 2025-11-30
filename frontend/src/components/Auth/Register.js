import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api";
import { AppContext } from "../../context/appContext";

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AppContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post('/auth/register', { email, password });
            login(res.data.token);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Registration failed. Please try again.');
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
                                password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                required
                                className="w-full px-6 py-4 bg-cream border-2 border-clay focus:border-terracotta focus:outline-none font-mono text-charcoal placeholder-fog transform focus:rotate-0 transition-all duration-200"
                            />
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