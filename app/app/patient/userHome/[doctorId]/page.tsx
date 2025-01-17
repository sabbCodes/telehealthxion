"use client";

import {
  Abstraxion,
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import Image from 'next/image';
import DocImg from '@/public/Frame 75.svg';
import Heart from '@/public/heart.svg';
import HomeActive from '@/public/homeActive.svg';
import ScheduleInactive from '@/public/story.svg';
import MessagesInactive from '@/public/messages-inactive.svg';
import ProfileInactive from '@/public/profileInactive.svg';
import ArrowLeft from '@/public/arrow-left.svg';
import ArrowRight from '@/public/shape.svg';
import VideoIcon from '@/public/video.svg';
import ChatIcon from '@/public/messages-3.svg';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/app/components/firebase-config';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface DoctorDetails {
    firstName: string;
    lastName: string;
    specialization: string;
    rating: number;
    reviewsCount: number;
    about: string;
    consultationFee: number;
    walletAddress: string;
}

function getWeekDays(startDate: Date) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push({
            day: format(date, 'EE').substring(0, 2),
            date: format(date, 'dd'),
        });
    }
    return dates;
}

function DocDetails() {
    const [doctorDetails, setDoctorDetails] = useState<DoctorDetails | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [dates, setDates] = useState(getWeekDays(new Date()));
    const { doctorId } = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Abstraxion hooks
    const { data: account } = useAbstraxionAccount();
    const { client } = useAbstraxionSigningClient();

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            if (doctorId) {
                try {
                    const doctorsRef = collection(db, 'users');
                    const q = query(doctorsRef, where("walletAddress", "==", doctorId as string));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const doctorDoc = querySnapshot.docs[0].data() as DoctorDetails;
                        setDoctorDetails(doctorDoc);
                    } else {
                        toast.warning('Doctor not found');
                    }
                } catch (error) {
                    console.error('Error fetching doctor details:', error);
                }
            }
        };

        fetchDoctorDetails();
    }, [doctorId]);

    const handleDateSelection = (date: string) => {
        setSelectedDate(date);
    };

    const handleTimeSelection = (time: string) => {
        setSelectedTime(time);
    };

    // FD9A1000963070BE52DFD77E0F2A2759B1759FE795DAFAEFDD21C724946B2161 INSTANTIATE
    // 4FA06CE78982DE9215602A76C37800964E1C391FFB4F01CC14EA2BFB882AD935 DEPLOY
    // xion1v87k482eju82dw7tng0x4u3shce426k3yz9j9f084md3rc5u8lmq788ydj CA
    // xion1sqrv8xr96jjlv6647g6fq4pc7l97sxrzspvau02m98tac8la8ugsjvmve6 TREASURY

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime) {
            alert('Please select a date and time');
            return;
        }

        if (!account?.bech32Address || !client) {
            setIsOpen(true);
            return;
        }

        setLoading(true);

        try {
            const doctorWalletAddress = doctorDetails?.walletAddress || '';
            const platformWalletAddress = 'xion16cvzs29c3ex4wrs2x663lrqp8e3fma9je6yjljt55xsvdnn3u09qdjz5xs';
            const consultationFeeInXION = doctorDetails!.consultationFee;

            // Calculate fees in uxion (6 decimals)
            const platformFee = Math.round(consultationFeeInXION * 0.1 * 1000000);
            const doctorFee = Math.round(consultationFeeInXION * 0.9 * 1000000);

            // Platform payment message
            const platformPayment = {
                typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                value: {
                    fromAddress: account.bech32Address,
                    toAddress: platformWalletAddress,
                    amount: [{
                        denom: "uxion",
                        amount: platformFee.toString()
                    }]
                }
            };

            // Doctor payment message
            const doctorPayment = {
                typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                value: {
                    fromAddress: account.bech32Address,
                    toAddress: doctorWalletAddress,
                    amount: [{
                        denom: "uxion",
                        amount: doctorFee.toString()
                    }]
                }
            };

            const fee = 1.8;

            const result = await client.signAndBroadcast(
                account.bech32Address,
                [platformPayment, doctorPayment],
                fee
            );

            if (result.code === 0) {
                await saveBookingToDatabase(result.transactionHash);
                toast.success(`Session booked successfully! Transaction hash: ${result.transactionHash}`);
            } else {
                throw new Error(`Transaction failed with code ${result.code}: ${result.rawLog}`);
            }
        } catch (error: any) {
            console.error('Payment failed:', error);

            if (error.message?.includes('authorization not found')) {
                toast.error('Transaction failed: Unable to process payment. Please ensure you have enough XION tokens.');
            } else if (error.message?.includes('insufficient funds')) {
                toast.error('Transaction failed: Insufficient funds. Please check your XION balance.');
            } else {
                toast.error('Payment failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const saveBookingToDatabase = async (transactionHash: string) => {
        if (!account?.bech32Address || !doctorDetails) return;

        const bookingDetails = {
            userId: account.bech32Address,
            doctorId: doctorDetails.walletAddress,
            date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${selectedDate}`,
            time: selectedTime,
            consultationFee: doctorDetails.consultationFee,
            status: 'Booked',
            paymentMethod: 'XION_USDC',
            chain: 'xion-testnet-1',
            transactionHash
        };

        try {
            await addDoc(collection(db, 'bookings'), bookingDetails);
        } catch (error) {
            console.error('Error saving booking:', error);
        }
    };

    if (!doctorDetails) {
        return <p>Loading...</p>;
    }

    return (
        <main className="w-11/12 max-w-lg mx-auto font-urbanist min-h-screen box-border">
            <div className='my-2 flex justify-center relative'>
                <Link href='/patient/userHome' className='absolute left-0 top-2'>
                    <Image src={ArrowLeft} alt='back icon' />
                </Link>
                <div className='flex flex-col items-center p-2'>
                    <Image src={DocImg} alt='doctor profile image' className='w-20 h-20' />
                    <h1 className='font-jakarta font-semibold text-xl'>Dr. {doctorDetails.firstName} {doctorDetails.lastName}</h1>
                    <p>{doctorDetails.specialization}</p>
                    <div className='flex gap-4'>
                        <div className='flex'>
                            <Image src={Heart} alt='heart icon' className='w-5 h-5' />
                            <p>{doctorDetails.rating}</p>
                        </div>
                        <p>{doctorDetails.reviewsCount} Review(s)</p>
                    </div>
                </div>
            </div>
            <article>
                <h2 className='font-jakarta font-semibold text-xl'>ABOUT DOCTOR</h2>
                <p className='leading-5'>Dr. {doctorDetails.firstName} {doctorDetails.lastName} {doctorDetails.about}... <span className='text-custom-blue hover-cursor'>Read more</span></p>
            </article>
            <article className='mt-2'>
                <h2 className='font-jakarta font-semibold text-xl'>SCHEDULE</h2>
                <div className='flex justify-between'>
                    {dates.map((date, index) => (
                        <div
                            key={index}
                            className={`flex flex-col items-center border rounded-2xl text-sm py-2 gap-1 justify-between px-1 h-12 cursor-pointer ${
                                selectedDate === date.date ? 'bg-active-nav text-white border-none' : 'border-border-grey text-custom-grey'
                            }`}
                            onClick={() => handleDateSelection(date.date)}
                        >
                            <p className='leading-none'>{date.day}</p>
                            <p className='leading-none'>{date.date}</p>
                        </div>
                    ))}
                </div>
                <div className='mt-4 flex flex-col gap-2'>
                    <div className='flex justify-between'>
                        {['8 AM', '9 AM', '10 AM', '11 AM'].map((time, index) => (
                            <div
                                key={index}
                                className={`flex justify-center items-center border rounded-3xl p-2 text-sm h-7 leading-none w-20 cursor-pointer ${
                                    selectedTime === time ? 'bg-active-nav text-white border-none' : 'border-dark-grey text-custom-grey'
                                }`}
                                onClick={() => handleTimeSelection(time)}
                            >
                                <p>{time}</p>
                            </div>
                        ))}
                    </div>
                    <div className='flex justify-between'>
                        {['12 PM', '1 PM', '2 PM', '3 PM'].map((time, index) => (
                            <div
                                key={index}
                                className={`flex justify-center items-center border rounded-3xl p-2 text-sm h-7 leading-none w-20 cursor-pointer ${
                                    selectedTime === time ? 'bg-active-nav text-white border-none' : 'border-dark-grey text-custom-grey'
                                }`}
                                onClick={() => handleTimeSelection(time)}
                            >
                                <p>{time}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </article>
            <article className='mt-2'>
                <h2 className='font-jakarta font-semibold text-xl'>MODE OF CONSULTATION</h2>
                <div className='flex gap-3 justify-center mt-2'>
                    <div className='flex border border-custom-blue text-custom-blue items-center w-32 h-9 rounded-2xl justify-center gap-1'>
                        <p>Video</p>
                        <Image src={VideoIcon} alt='video icon' />
                    </div>
                    <div className='flex border border-custom-blue text-custom-blue items-center w-32 h-9 rounded-2xl justify-center gap-1'>
                        <p>Chat</p>
                        <Image src={ChatIcon} alt='chat icon' />
                    </div>
                </div>
            </article>
            <article className='mt-6 pb-16'>
                <h2 className='font-jakarta font-medium text-lg'>
                    CONSULTATION FEE: {doctorDetails.consultationFee} XION
                </h2>
                <button
                    onClick={handleBooking}
                    disabled={loading}
                    className='mt-2 w-full h-14 flex gap-2 text-xl font-medium outline-none bg-schedule-col rounded-lg justify-center items-center text-white'
                >
                    {loading ? 'Processing...' : 'Book Consultation'}
                    <Image src={ArrowRight} alt='Arrow Right' />
                </button>
            </article>
            <footer className='flex items-center h-14 shadow-3xl w-screen m-0 absolute right-0 left-0 bottom-0 bg-white'>
                <nav className='w-full flex gap-14 justify-evenly items-center py-4 px-14'>
                    <Link href='/patient/userHome'>
                        <Image src={HomeActive} alt='home icon' />
                    </Link>
                    <Link href='/patient/schedule'>
                        <Image src={ScheduleInactive} alt='Schedule icon' />
                    </Link>
                    <Link href='/patient/messages'>
                        <Image src={MessagesInactive} alt='Messages icon' />
                    </Link>
                    <Link href='/patient/userProfile'>
                        <Image src={ProfileInactive} alt='Profile icon' />
                    </Link>
                </nav>
            </footer>
            <Abstraxion onClose={() => setIsOpen(false)} />
            <ToastContainer />
        </main>
    );
}

export default DocDetails;
