"use client";

import Image from 'next/image';
import React from 'react';
import Logo from '@/public/logo.svg';
import DocsNPatient from '@/public/docsnpatient.svg';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SignUp() {
    const handleClick = () => {
        toast.info("Uh uh! Can't do that right now! Ain't that easy Dawg...")
    }

    return (
        <main className="w-11/12 max-w-lg mx-auto font-urbanist min-h-screen box-border">
            <Image src={Logo} alt='logo' className='w-4/12 h-20 mt-16 mx-auto' />
            <div className='flex flex-col justify-center align-center w-full'>
                <h1 className='font-jakarta font-bold mt-10 text-custom-blue text-xl text-center'>Health Care Brought Closer</h1>
                <p className='text-custom-grey text-base text-center p-2'>
                    Schedule appointments with doctors,
                    Book online consultations, Request drug delivery services
                    - just with one click!
                </p>
            </div>
            <Image src={DocsNPatient} alt='Docs and a Patient' className='w-8/12 mt-16 mb-18 mx-auto' />
            <div className='w-full flex flex-col justify-center items-center mt-4 gap-2'>
                <Link href='/signup/patientSignup' className="bg-custom-blue text-lg text-white font-semibold h-14 rounded-2xl flex justify-center items-center w-[91vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw]">I am a prospective Patient</Link>
                <Link href='/signup' onClick={handleClick} className="bg-white text-lg text-custom-blue border flex justify-center items-center border-custom-blue font-semibold h-14 rounded-2xl p-0 w-[91vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw]">I am a Doctor</Link>
                {/* <Link href='/signup/doctorSignUp' className="bg-white text-lg text-custom-blue border flex justify-center items-center border-custom-blue font-semibold h-14 rounded-2xl p-0 w-[91vw] sm:w-[80vw] md:w-[60vw] lg:w-[50vw]">I am a Doctor</Link> */}
            </div>
            <ToastContainer />
        </main>
    )
}

export default SignUp;