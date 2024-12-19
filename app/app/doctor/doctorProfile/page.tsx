"use client"

import Image from 'next/image';
import UserDp from '@/public/userdp.svg';
import SearchIcon from '@/public/search.svg';
import DocImg from '@/public/Frame 75.svg';
import Heart from '@/public/heart.svg';
import VidIcon from '@/public/Frame 55.svg';
import ChatIcon from '@/public/Frame 56.svg';
import DateIcon from '@/public/story.svg';
import TimeIcon from '@/public/clock.svg';
import HomeActive from '@/public/homeActive.svg';
import ScheduleInactive from '@/public/story.svg';
import MessagesInactive from '@/public/messages-inactive.svg';
import ProfileInactive from '@/public/profileInactive.svg';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';


function Home() {
    return (
        <main className="w-11/12 max-w-lg mx-auto font-urbanist min-h-screen box-border">
            <footer className='flex items-center h-14 shadow-3xl w-screen m-0 fixed right-0 left-0 bottom-0 bg-white'>
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
        </main>
    );
}

export default Home;