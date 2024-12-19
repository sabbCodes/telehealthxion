"use client";

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../components/firebase-config';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import Logo from '@/public/logo.svg';
import Eye from '@/public/eye.png';
import EyeSlash from '@/public/eye-slash.png';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useWallet } from '@solana/wallet-adapter-react';

function DoctorSignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        address: '',
        gender: '',
        dateOfBirth: '',
        medicalLicenseNumber: '',
        specialization: '',
        yearsOfExperience: '',
        password: '',
        walletAddress: ''
    });
    const router = useRouter();
    const { publicKey, connected } = useWallet();

    useEffect(() => {
        if (connected && publicKey) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                walletAddress: publicKey.toString(),
            }));
        }
    }, [connected, publicKey]);

    const handleNext = () => {
        if (currentPage === 1) {
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
                toast.error("Please fill in all required fields.");
                return;
            }
        }

        if (currentPage < 3) {
            setCurrentPage(currentPage + 1);
        } else if (currentPage === 3 && isCheckboxChecked) {
            handleSubmit();
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleBack = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsCheckboxChecked(e.target.checked);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateForm = () => {
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
            toast.error("All fields are required.");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            await setDoc(doc(db, "users", userCredential.user.uid), {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                address: formData.address,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth,
                medicalLicenseNumber: formData.medicalLicenseNumber,
                specialization: formData.specialization,
                yearsOfExperience: formData.yearsOfExperience,
                walletAddress: formData.walletAddress,
                role: 'doctor',
            });

            toast.success("Sign-up successful! Please log in with your new account.");

            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch (error) {
            toast.error("An error occurred during sign-up. Please try again later.");
            console.error("Error signing up:", error);
        }
    };

    return (
        <main className="w-11/12 max-w-lg mx-auto font-urbanist min-h-screen box-border">
            <Image src={Logo} alt='logo' className='w-4/12 h-20 mt-16 mx-auto' />
            <div className='flex justify-between items-center mt-10'>
                <p className='text-custom-grey'>Kindly fill the form below.</p>
                <div className="flex justify-between items-center">
                    {[1, 2, 3].map((page) => (
                        <React.Fragment key={page}>
                            <div className="flex items-center mx-1">
                                <div
                                    className={`${
                                        currentPage === page ? 'w-10' : 'w-2.5'
                                    } rounded-full transition-all duration-300 ${
                                        currentPage === page ? 'bg-custom-blue' : 'bg-gray-300'
                                    } h-2.5`}
                                ></div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className="mt-8">
                {currentPage === 1 && (
                    <div className='flex flex-col gap-3'>
                        <div className='flex gap-3'>
                            <div>
                                <label className='text-custom-grey'>
                                    First Name
                                    <input
                                        type='text'
                                        name='firstName'
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder='John'
                                        className="w-full mt-2 py-2 px-3 border border-border-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                                    />
                                </label>
                            </div>
                            <div>
                                <label className='text-custom-grey'>
                                    Last Name
                                    <input
                                        type='text'
                                        name='lastName'
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder='Doe'
                                        className="w-full mt-2 py-2 px-3 border border-border-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                                    />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className='text-custom-grey'>
                                Phone Number
                                <input
                                    type='text'
                                    name='phoneNumber'
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder='+2348055523927'
                                    className="w-full mt-2 py-2 px-3 border border-border-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                                />
                            </label>
                        </div>
                        <div>
                            <label className='text-custom-grey'>
                                Email Address
                                <input
                                    type='text'
                                    name='email'
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder='johndoe@doemail.com'
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
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
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
                    </div>
                )}
                {currentPage === 2 && (
                    <div className='flex flex-col gap-3'>
                        <div>
                            <label className='text-custom-grey'>
                                Gender
                                <select
                                    name='gender'
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full mt-2 py-2 px-3 border border-border-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                                >
                                    <option value="">Select One</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </label>
                        </div>
                        <div>
                            <label className='text-custom-grey'>
                                Date Of Birth
                                <input
                                    type='date'
                                    name='dateOfBirth'
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className="w-full mt-2 py-2 px-3 border border-border-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                                />
                            </label>
                        </div>
                        <div>
                            <label className='text-custom-grey'>
                                Medical License Number
                                <input
                                    type='text'
                                    name='medicalLicenseNumber'
                                    value={formData.medicalLicenseNumber}
                                    onChange={handleChange}
                                    placeholder='Your Medical License Number'
                                    className="w-full mt-2 py-2 px-3 border border-border-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                                />
                            </label>
                        </div>
                        <div>
                            <label className='text-custom-grey'>
                                Specialization
                                <input
                                    type='text'
                                    name='specialization'
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    placeholder='Your Specialty'
                                    className="w-full mt-2 py-2 px-3 border border-border-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                                />
                            </label>
                        </div>
                    </div>
                )}
                {currentPage === 3 && (
                    <div className='flex flex-col gap-3'>
                        <div>
                            <label className='text-custom-grey'>
                                Residential Address
                                <input
                                    type='text'
                                    name='address'
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder='123 Main St'
                                    className="w-full mt-2 py-2 px-3 border border-border-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                                />
                            </label>
                        </div>
                        <div>
                            <label className='text-custom-grey'>
                                Years Of Experience
                                <input
                                    type='text'
                                    name='yearsOfExperience'
                                    value={formData.yearsOfExperience}
                                    onChange={handleChange}
                                    placeholder='How many years of experience do you have?'
                                    className="w-full mt-2 py-2 px-3 border border-border-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                                />
                            </label>
                        </div>
                        <div className='flex items-center mt-4'>
                            <input
                                type='checkbox'
                                id='checkbox'
                                className="mr-2 h-4 w-4 text-custom-blue border-gray-300 rounded focus:ring-custom-blue"
                                onChange={handleCheckboxChange}
                            />
                            <label htmlFor='checkbox' className='text-custom-grey'>
                                I certify that all above information is correct.
                            </label>
                        </div>
                    </div>
                )}
            </div>
            <div className='w-full flex flex-col justify-center items-center mt-4 gap-2'>
                <button
                    onClick={handleNext}
                    disabled={currentPage === 3 && !isCheckboxChecked}
                    className={`${
                        currentPage === 3 && !isCheckboxChecked ? 'bg-gray-400' : 'bg-custom-blue'
                    } text-lg text-white outline-0 font-semibold h-14 rounded-2xl flex justify-center items-center w-[91vw] sm:w-[80vw] md:w-[53vw] lg:w-[25vw]`}
                >
                    {currentPage < 3 ? 'Next' : 'Submit'}
                </button>
                {currentPage > 1 ? (
                    <button
                        onClick={handleBack}
                        className="bg-white text-lg outline-0 text-custom-blue border flex justify-center items-center border-custom-blue font-semibold h-14 rounded-2xl p-0 w-[91vw] sm:w-[80vw] md:w-[53vw] lg:w-[25vw]"
                    >
                        Back
                    </button>
                ) : (
                    <Link
                        href='/signup'
                        className="bg-white text-lg outline-0 text-custom-blue border flex justify-center items-center border-custom-blue font-semibold h-14 rounded-2xl p-0 w-[91vw] sm:w-[80vw] md:w-[53vw] lg:w-[25vw]"
                    >
                        Back
                    </Link>
                )}
            </div>
            <ToastContainer />
        </main>
    );
}

export default DoctorSignUp;
