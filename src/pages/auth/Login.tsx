
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if there's a success message in the URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const message = params.get('message');
    if (message === 'verification_success') {
      toast.success('Email verified successfully! You can now log in.');
    }
  }, [location]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      // Make the error message more user-friendly
      let errorMessage = 'Failed to sign in';
      
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before logging in';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-game-gradient p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-game-bg p-8 shadow-lg">
        <div className="text-center">
          <h1 className="game-title text-4xl">Arcane Chain Quest</h1>
          <p className="mt-2 text-game-uiAccent">Sign in to access your decks</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@example.com"
                className="bg-game-ui text-white border border-game-uiAccent"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-game-ui text-white border border-game-uiAccent"
                required
              />
            </div>
          </div>
          
          <Button
            type="submit"
            className="game-button w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <div className="text-center text-white">
            Don't have an account?{' '}
            <Link to="/register" className="text-game-uiAccent hover:underline">
              Register
            </Link>
          </div>
          
          <div className="text-center mt-4">
            <Link to="/" className="inline-flex items-center text-game-uiAccent hover:underline">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
