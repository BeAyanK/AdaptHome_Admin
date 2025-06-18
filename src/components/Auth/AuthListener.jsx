import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { authActions } from '../../store/authSlice';

const AuthListener = ({ children }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.email === 'admin@techinf.com') {
                // User is signed in and is admin
                const token = await user.getIdToken();
                dispatch(authActions.setAuthState({
                    uid: user.uid,
                    email: user.email,
                    token: token,
                    isAdmin: true
                }));
            } else {
                // User is signed out or not admin
                dispatch(authActions.setAuthState(null));
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [dispatch]);

    return children;
};

export default AuthListener;
