"use client";

import {
    Abstraxion,
    useAbstraxionAccount,
    useModal
} from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import Image from 'next/image';
import React, { useEffect } from 'react';
import Logo from '@/public/logo.svg';
import DocsNPatient from '@/public/docsnpatient.svg';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where } from "@firebase/firestore";
import { db } from "./firebase-config";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ConnectWallet(): JSX.Element {
    // Abstraxion hooks
    const { data: { bech32Address }, isConnected, isConnecting } = useAbstraxionAccount();

    // General state hooks
    const [, setShow] = useModal();
    const router = useRouter();

    // Check Firebase for user and redirect appropriately
    useEffect(() => {
        const checkUser = async () => {
            if (isConnected && bech32Address) {
                try {
                    const usersRef = collection(db, "users");
                    const q = query(usersRef, where("walletAddress", "==", bech32Address));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        // Assuming the first matching document is the correct one
                        const userData = querySnapshot.docs[0].data();
                        if (userData.role === "doctor") {
                            const timer = setTimeout(() => {
                                router.push('/doctor/docHome');
                            }, 2000);
                            return () => clearTimeout(timer);
                        } else if (userData.role === "patient") {
                            const timer = setTimeout(() => {
                                router.push('/patient/userHome');
                            }, 2000);
                            return () => clearTimeout(timer);
                        } else {
                            console.error("Invalid role in database.");
                        }
                    } else {
                        toast.success("Account created successfully, now register to start using teleHealthSol")
                        const timer = setTimeout(() => {
                            router.push('/signup');
                        }, 2000);
                        return () => clearTimeout(timer);
                    }
                } catch (error) {
                    console.error("Error checking user in Firebase:", error);
                }
            }
        };

        checkUser();
    }, [isConnected, bech32Address, router, isConnecting]);

    return (
        <main className="w-11/12 max-w-lg mx-auto font-urbanist h-screen pt-16 mb-0">
            <Image src={Logo} alt='logo' className='w-4/12 h-20 mx-auto' />
            <div className='flex flex-col justify-center align-center w-full'>
                <h1 className='font-jakarta font-bold mt-10 text-custom-blue text-xl text-center'>Health Care Brought Closer</h1>
                <p className='text-custom-grey text-base text-center p-2'>
                    Schedule appointments with doctors,
                    Book online consultations, Request drug delivery services
                    - just with one click!
                </p>
            </div>
            <Image src={DocsNPatient} alt='Docs and a Patient' className='w-8/12 mt-16 mb-18 mx-auto' />
            <div className='w-full flex flex-col justify-center items-center mt-4'>
                <Button
                    fullWidth
                    onClick={() => { setShow(true) }}
                    structure="base"
                    style={{
                        backgroundColor: '#3772FF',
                        color: '#F9F9F9',
                        padding: '15px 32px',
                        fontSize: '18px',
                        borderRadius: '16px',
                        border: 'none',
                        // width: '343px',
                        height: '54px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '10px',
                    }}
                >
                    {bech32Address ? (
                        <div className="flex items-center justify-center">VIEW ACCOUNT</div>
                    ) : (
                        "CONNECT"
                    )}
                </Button>
                {
                bech32Address &&
                    <div className="border-2 border-primary rounded-md py-4 px-2 flex flex-row mt-2 w-full">
                        <div className="w-full">
                            <div>
                            {bech32Address}
                            </div>
                        </div>
                    </div>
                }
            </div>
            <Abstraxion onClose={() => setShow(false)} />
            <ToastContainer />
        </main>
    );
}

export default ConnectWallet;

// xion1h4h59tzltvqueat5q00kwdgalhxg9kw597tptzzeq2fnyqv5dwhqy7mekm
// xion1f0u3lnk3nfg256ke29szf6fgswz2a02l8gq966vlkqjsrvr2zf4s5u0vhv