"use client"

import Image from 'next/image';
import MessagesAbsent from '@/public/amico.svg';
import DocImg from '@/public/Frame 75.svg';
import HomeInactive from '@/public/homeInactive.svg';
import ScheduleInactive from '@/public/story.svg';
import MessagesActive from '@/public/messagesActive.svg';
import ProfileInactive from '@/public/profileInactive.svg';
import ArrowLeft from '@/public/arrow-left.svg';
import Link from 'next/link';
import { useState } from 'react';

function Messages() {
    const [isMessages, setIsMessages] = useState(false);

    return (
        <main className="w-11/12 max-w-lg mx-auto font-urbanist min-h-screen box-border bg-white">
            <div className='flex mt-2 gap-2 items-center'>
                <Link href='/doctor/userHome'>
                    <Image src={ArrowLeft} alt='back icon' />
                </Link>
                <h1 className="text-custom-black font-jakarta font-semibold text-xl">Conversations</h1>
            </div>
            {isMessages ? (
                <div className='flex flex-col mt-28 items-center'>
                    <Image src={MessagesAbsent} alt='messages absent' className='w-10/12' />
                    <p>OOPS! No messages here yet.</p>
                </div>
            ) : (
                <Link href='/doctor/messages/chat' className='flex justify-between mt-2'>
                    <div className='flex gap-2'>
                        <Image src={DocImg} alt='doctor profile image' className='w-10 h-10 rounded-full' />
                        <div className='leading-none flex flex-col justify-center'>
                            <p className='leading-none text-custom-black font-semibold text-base m-0'>Dr. Adam Hawa</p>
                            <p className='leading-none text-sm m-0 p-0'>How do you feel today?</p>
                        </div>
                    </div>
                    <div className='flex flex-col justify-center gap-1 items-end'>
                        <p className='leading-none text-custom-grey text-xs m-0'>2 min ago</p>
                        <p className='leading-none text-xs w-4 h-4 bg-active-nav rounded-full text-white flex justify-center items-center'>3</p>
                    </div>
                </Link>
            )}
            <footer className='flex items-center h-14 shadow-3xl w-screen m-0 fixed right-0 left-0 bottom-0 bg-white'>
                <nav className='w-full flex gap-14 justify-evenly items-center py-4 px-14'>
                    <Link href='/doctor/docHome'>
                        <Image src={HomeInactive} alt='home icon' />
                    </Link>
                    <Link href='/doctor/schedule'>
                        <Image src={ScheduleInactive} alt='Schedule icon' />
                    </Link>
                    <Link href='/doctor/messages'>
                        <Image src={MessagesActive} alt='Messages icon' />
                    </Link>
                    <Link href='/doctor/userProfile'>
                        <Image src={ProfileInactive} alt='Profile icon' />
                    </Link>
                </nav>
            </footer>
        </main>
    )
}

export default Messages;