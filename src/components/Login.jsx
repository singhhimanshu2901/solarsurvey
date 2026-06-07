import React, { useState } from 'react';
import { Sun } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase';

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const provider = new GoogleAuthProvider();

  async function handleSubmit() {
    try {
      setError('');

      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      onLogin();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');

      await signInWithPopup(auth, provider);

      onLogin();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login">
      <div className="card loginCard">
        <Sun className="logo" />

        <h1>{isSignup ? 'Company Signup' : 'Company Login'}</h1>

        <p>Phase 1 Solar Survey Report Generator</p>

        <input
          placeholder="Company email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="errorText">{error}</p>}

        <button onClick={handleSubmit}>
          {isSignup ? 'Create Account' : 'Login'}
        </button>

        <button className="googleBtn" onClick={handleGoogleLogin}>
          Continue with Google
        </button>

        <small
          onClick={() => setIsSignup(!isSignup)}
          className="switchAuth"
        >
          {isSignup
            ? 'Already have account? Login'
            : 'New company? Create account'}
        </small>
      </div>
    </div>
  );
}

export default Login;