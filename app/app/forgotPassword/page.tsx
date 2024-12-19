"use client";

import Image from 'next/image';
import React from 'react';
import Logo from '@/public/logo.svg';

function ConnectWallet() {
    return (
        <main className="w-11/12 max-w-lg mx-auto font-urbanist min-h-screen box-border">
            <Image src={Logo} alt="logo" className="w-4/12 h-20 mt-16 mx-auto" />
            <h2 className="text-custom-dark-grey text-xl font-semibold mt-8 mb-4">Enter your email address to reset your password</h2>
            <div className="mb-4">
                <label className="text-custom-grey block mb-2">
                    Email Address
                    <input
                        type="email"
                        placeholder="johndoe@doemail.com"
                        className="w-full mt-2 py-2 px-3 border border-border-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                    />
                </label>
            </div>
            <div className="w-full flex flex-col justify-center items-center gap-2">
                <button className="bg-custom-blue text-lg text-white font-semibold mt-12 h-14 rounded-2xl w-[91vw] sm:w-[80vw] md:w-[51vw] lg:w-[25vw]">
                    Reset Password
                </button>
            </div>
        </main>
    );
}

export default ConnectWallet;
