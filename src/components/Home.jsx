import { useEffect ,useState} from 'react';
import { auth, provider } from "../../firebaseConfig.js";
import { signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence, onAuthStateChanged,signInWithPopup } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import Front from '../assets/Front-image.png';
import Google from '../assets/Google.png';
import Vibe from '../assets/Vibesnap.png';
import '../components/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);  
      try {
        // Check the redirect result for any signed-in users
        const result = await getRedirectResult(auth);
        console.log("Redirect result:", result);
        if (result?.user) {
          console.log("User from redirect:", result.user);
          navigate('/feed');  // Redirect to feed after successful login
        } else if (auth.currentUser) {
          console.log("User already logged in:", auth.currentUser);
          navigate('/feed');  // Redirect if the user is already logged in
        } else {
          console.log("No user found in redirect result or auth state.");
        }
      } catch (error) {
        console.error("Error during redirect result handling:", error);
      }
      finally {
        setLoading(false);  // Hide loading after checking auth state
      }
    };
  
    // Set persistence for auth state
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        checkUser();  // Check for a user after setting persistence
  
        // Listen for auth state changes
        onAuthStateChanged(auth, (user) => {
          console.log("Auth state changed:", user);
          if (user) {
            console.log("User from auth state change:", user);
            navigate('/feed');  // Redirect after successful login
          } else {
            console.log("No user detected from auth state change.");
          }
        });
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      console.log("Initiating Google login...");
      const result = await signInWithPopup(auth, provider);  // Trigger Google login popup
      console.log("User signed in: ", result.user);
      navigate('/feed');  // Redirect to feed after successful login
    } catch (error) {
      console.error("Error logging in with Google: ", error);
    }
  };

  return (
    <div className="container">
      <img src={Front} alt="Front" className="responsive-image" />
      <div className="rectangle">
        <img src={Vibe} alt="Vibe" />
        <img 
          src={Google} 
          alt="Google Login" 
          role="button" 
          aria-label="Sign in with Google" 
          onClick={handleGoogleLogin} 
        />

      </div>
    </div>
  );
};

export default Home;
