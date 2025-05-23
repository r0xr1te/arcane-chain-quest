
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { User } from '@/types/game';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle auth state change
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession);
        setSession(currentSession);
        
        if (currentSession) {
          // Use setTimeout to avoid potential deadlocks with auth state changes
          setTimeout(async () => {
            try {
              // Fetch user profile data
              const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();
              
              if (data) {
                console.log('User profile found:', data);
                setUser(data as User);
              } else if (error) {
                console.error('Error fetching user profile:', error);
                // Try to create a profile if it doesn't exist
                if (error.code === 'PGRST116') {
                  const username = currentSession.user.user_metadata.username || 'User';
                  const { data: newProfile, error: createError } = await supabase
                    .from('user_profiles')
                    .insert([{ 
                      id: currentSession.user.id,
                      username
                    }])
                    .select()
                    .single();
                    
                  if (newProfile) {
                    console.log('Created new user profile:', newProfile);
                    setUser(newProfile as User);
                  } else {
                    console.error('Error creating user profile:', createError);
                  }
                }
              }
            } catch (err) {
              console.error('Error in auth state change:', err);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        console.log('Initial session check:', existingSession);
        
        if (existingSession) {
          setSession(existingSession);
          
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', existingSession.user.id)
            .single();
            
          if (data) {
            console.log('User profile found:', data);
            setUser(data as User);
          } else {
            console.error('Error fetching user profile:', error);
          }
        }
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    
    try {
      console.log('Signing up with:', email, username);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username // Include username in user metadata
          },
          emailRedirectTo: window.location.origin // Ensure redirects work in both production and preview
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        throw error;
      }
      
      if (data.user) {
        console.log('User created:', data.user);
        // Create a new user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: data.user.id,
              username,
            },
          ]);
          
        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }
        
        // Create initial empty deck
        const { error: deckError } = await supabase
          .from('decks')
          .insert([
            {
              user_id: data.user.id,
              name: 'My First Deck',
              cards: []
            },
          ]);
          
        if (deckError) {
          console.error('Error creating deck:', deckError);
        }
        
        toast.success('Account created! Please check your email to confirm your registration');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      console.log('Signing in with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log('Login successful:', data);
      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
