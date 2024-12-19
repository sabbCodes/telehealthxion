"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import Logo from '@/public/logo.svg';
import Eye from '@/public/eye.png';
import EyeSlash from '@/public/eye-slash.png';
import Link from 'next/link';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../components/firebase-config';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from "firebase/firestore";

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in both fields.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userRole = userData.role;

                if (userRole === 'doctor') {
                    router.push('/doctor/docHome');
                } else if (userRole === 'patient') {
                    router.push('/patient/userHome');
                } else {
                    setError('Unrecognized user role.');
                }
            } else {
                setError('No user data found.');
            }
        } catch (error) {
            console.error("Error logging in:", error);
            setError('Failed to log in. Please check your email and password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="w-11/12 max-w-lg mx-auto font-urbanist min-h-screen box-border">
            <Image src={Logo} alt="logo" className="w-4/12 h-20 mt-16 mx-auto" />
            <h2 className="text-custom-grey text-xl font-semibold mt-8 mb-4">Continue with your Email</h2>
            <div className="mb-4">
                <label className="text-custom-grey block mb-2">
                    Email Address
                    <input
                        type="email"
                        value={email}
                        name='email'
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="johndoe@doemail.com"
                        className="w-full mt-2 py-2 px-3 border border-border-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                    />
                </label>
            </div>
            <div className="mb-4 relative">
                <label className="text-custom-grey block mb-2">
                    Password
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            name='password'
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full mt-2 py-2 px-3 border border-border-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                        />
                        <button
                            type="button"
                            onClick={toggleShowPassword}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                        >
                            <Image src={showPassword ? EyeSlash : Eye} alt="Toggle Password Visibility" />
                        </button>
                    </div>
                </label>
            </div>
            <div className="flex justify-between items-center mb-6">
                <label className="flex items-center text-custom-grey">
                    <input type="checkbox" className="mr-2" />
                    Remember me
                </label>
                <Link href="/forgotPassword" className="text-custom-blue hover:underline">
                    Forgotten Password?
                </Link>
            </div>
            {error && <p className="text-red-500 leading-none mb-4">{error}</p>}
            <div className="w-full flex flex-col justify-center items-center gap-2">
                <button
                    onClick={handleLogin}
                    className={`bg-custom-blue text-lg text-white font-semibold mt-12 h-14 rounded-2xl w-[91vw] sm:w-[80vw] md:w-[51vw] lg:w-[25vw] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
            </div>
            <h3 className='mt-6 text-center font-semibold text-custom-grey'>Not a User yet? <Link className='text-custom-blue' href='/signup'>Sign Up</Link> Now</h3>
        </main>
    );
}

export default Login;
