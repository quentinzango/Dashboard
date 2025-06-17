import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../../assets/images/login.png';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Ton API peut renvoyer un champ `detail` ou une liste d'erreurs
        const msg = data.detail || data.message || JSON.stringify(data);
        throw new Error(msg);
      }

      // Supposons que ton API renvoie { access: 'jwt-token', refresh: 'jwt-refresh', user: { ... } }
      const { access, refresh } = data;
      if (!access) throw new Error("Token non reçu");

      // Sauvegarde les tokens pour les prochaines requêtes authentifiées
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      // Redirection vers le dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur de login :', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden">
      {/* Colonne de gauche avec l'image */}
      <div className="hidden lg:block w-1/2">
        <img 
          src={loginImage} 
          alt="Admin Dashboard" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Colonne de droite avec le formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-black">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white">Iconk</h1>
            <h2 className="mt-2 text-xl font-semibold text-gray-300">
              Log In to Admin Panel
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Enter your email and password below
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-600 text-white rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-white"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                PASSWORD
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-white"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded bg-gray-800"
                disabled={loading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white 
                  ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {loading ? 'Logging in…' : 'Log In'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/signup')} 
                className="font-medium text-indigo-400 hover:text-indigo-300"
                disabled={loading}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
