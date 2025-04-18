
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      await signUp(email, password, username);
      toast.success('Account created successfully! Please check your email to verify your account.');
      // Navigate to login with a message
      navigate('/login?message=account_created');
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // User-friendly error messages
      let errorMessage = 'Failed to create account';
      
      if (error.message.includes('already registered')) {
        errorMessage = 'This email is already registered. Please try logging in instead.';
      } else if (error.message.includes('password')) {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
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
          <p className="mt-2 text-game-uiAccent">Create your wizard account</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="WizardMaster42"
                className="bg-game-ui text-white border border-game-uiAccent"
                required
              />
            </div>
            
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
            
            <div>
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <div className="text-center text-white">
            Already have an account?{' '}
            <Link to="/login" className="text-game-uiAccent hover:underline">
              Sign In
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

export default Register;
