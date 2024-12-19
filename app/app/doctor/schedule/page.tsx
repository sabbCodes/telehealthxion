import Image from 'next/image';
import HomeInactive from '@/public/homeInactive.svg';
import ScheduleActive from '@/public/storyActive.svg';
import MessagesInactive from '@/public/messages-inactive.svg';
import ProfileInactive from '@/public/profileInactive.svg';
import ArrowDown from '@/public/arrow-down.svg';
import Link from 'next/link';

function Schedule() {
    return (
        <main className="w-11/12 max-w-lg mx-auto font-urbanist min-h-screen box-border">
            <div className='mt-2 w-full'>
                <h1 className='font-jakarta font-semibold text-xl'>Today, Tuesday 20th April, 2024. </h1>
            </div>
            <div className='flex gap-2 mt-3 items-center'>
                <p>Calendar view:</p>
                <div className='bg-schedule-col-inner px-3 py-2 flex gap-2 text-chat-blue rounded-lg'>
                    <p>This week</p>
                    <Image src={ArrowDown} alt='arrow down' />
                </div>
            </div>
            <div className='mt-3'>
                <div className='w-full p-2 h-24 bg-custom-grey-doc rounded-lg mb-2 flex flex-col justify-between'>
                    <h2 className='font-bold'>Monday 19th April, 2024.</h2>
                    <div className='flex gap-5 text-sm'>
                        <p>8:00 AM - 9:00 AM</p>
                        <p>10:00 AM - 12:00 AM</p>
                    </div>
                    <div className='flex gap-5 text-sm'>
                        <p>1:00 PM - 2:00 PM</p>
                    </div>
                </div>
                <div className='w-full p-2 h-24 bg-custom-schedule rounded-lg mb-2 flex flex-col justify-between'>
                    <h2 className='font-bold'>Tuesday 20th April, 2024.</h2>
                    <div className='flex gap-5 text-sm'>
                        <p>8:00 AM - 9:00 AM</p>
                        <p>10:00 AM - 12:00 AM</p>
                    </div>
                    <div className='flex gap-5 text-sm'>
                        <p>1:00 PM - 2:00 PM</p>
                    </div>
                </div>
                <div className='w-full p-2 h-24 rounded-lg mb-2 flex flex-col justify-between border'>
                    <h2 className='font-bold'>Wednesday 21st April, 2024.</h2>
                    <div className='flex gap-5 text-sm'>
                        <p>8:00 AM - 9:00 AM</p>
                        <p>10:00 AM - 12:00 AM</p>
                    </div>
                    <div className='flex gap-5 text-sm'>
                        <p>1:00 PM - 2:00 PM</p>
                    </div>
                </div>
                <div className='w-full p-2 h-24 rounded-lg border mb-2 flex flex-col justify-between'>
                    <h2 className='font-bold'>Thursday 22nd April, 2024.</h2>
                    <div className='flex gap-5 text-sm'>
                        <p>8:00 AM - 9:00 AM</p>
                        <p>10:00 AM - 12:00 AM</p>
                    </div>
                    <div className='flex gap-5 text-sm'>
                        <p>1:00 PM - 2:00 PM</p>
                    </div>
                </div>
                <div className='w-full p-2 h-24 rounded-lg border mb-2 flex flex-col justify-between'>
                    <h2 className='font-bold'>Friday 23rd April, 2024.</h2>
                    <div className='flex gap-5 text-sm'>
                        <p>8:00 AM - 9:00 AM</p>
                        <p>10:00 AM - 12:00 AM</p>
                    </div>
                    <div className='flex gap-5 text-sm'>
                        <p>1:00 PM - 2:00 PM</p>
                    </div>
                </div>
            </div>
            <footer className='flex items-center h-14 shadow-3xl w-screen m-0 absolute right-0 left-0 bottom-0 bg-white'>
                <nav className='w-full flex gap-14 justify-evenly items-center py-4 px-14'>
                    <Link href='/doctor/docHome'>
                        <Image src={HomeInactive} alt='home icon' />
                    </Link>
                    <Link href='/doctor/schedule'>
                        <Image src={ScheduleActive} alt='Schedule icon' />
                    </Link>
                    <Link href='/doctor/messages'>
                        <Image src={MessagesInactive} alt='Messages icon' />
                    </Link>
                    <Link href='/doctor/userProfile'>
                        <Image src={ProfileInactive} alt='Profile icon' />
                    </Link>
                </nav>
            </footer>
        </main>
    )
}

export default Schedule;