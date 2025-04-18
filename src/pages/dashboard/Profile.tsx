
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const Profile = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="game-title text-3xl mb-6">Your Profile</h1>
        
        <div className="bg-game-bg rounded-lg p-6 border border-game-uiAccent">
          {user ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-game-uiAccent text-sm">Username</h3>
                <p className="text-white text-lg">{user.username}</p>
              </div>
              
              <div>
                <h3 className="text-game-uiAccent text-sm">Email</h3>
                <p className="text-white text-lg">{user.email}</p>
              </div>
              
              <div>
                <h3 className="text-game-uiAccent text-sm">Account Created</h3>
                <p className="text-white text-lg">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading profile...</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
