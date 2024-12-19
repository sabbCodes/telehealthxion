import Image from 'next/image';
import DocImg from '@/public/Frame 75.svg';
import Heart from '@/public/heart.svg';
import HomeActive from '@/public/homeActive.svg';
import ScheduleInactive from '@/public/story.svg';
import MessagesInactive from '@/public/messages-inactive.svg';
import ProfileInactive from '@/public/profileInactive.svg';
import ArrowLeft from '@/public/arrow-left.svg';
import ProfileSearch from '@/public/Frame 138.svg';
import Link from 'next/link';

function AllDoctors() {
    return (
        <main className="w-11/12 max-w-lg mx-auto font-urbanist min-h-screen box-border">
            <div className='h-8 mt-5 flex justify-between items-center'>
                <div className='flex gap-1'>
                    <Link href='/userHome'>
                        <Image src={ArrowLeft} alt='back icon' />
                    </Link>
                    <h2 className="text-custom-black font-jakarta font-semibold text-xl">Doctors</h2>
                </div>
                <div>
                    <Image src={ProfileSearch} alt='search doctor icon' />
                </div>
            </div>
            <div className='flex gap-2 items-center mb-2'>
                <p className='text-base text-custom-grey'>Filter by:</p>
                <p className='py-2.5 px-3 bg-review-bg rounded-lg'>Review</p>
            </div>
            <div>
                <Link href='/#' className='flex justify-between items-center h-14 bg-doc-bg rounded-lg p-2 mb-2'>
                    <div className='flex gap-2'>
                        <Image src={DocImg} alt='doctor profile image' className='w-10 h-10' />
                        <div className='leading-none'>
                            <p className='text-custom-black font-semibold text-base m-0'>Dr. Sarafa Abbas</p>
                            <p className='leading-none text-sm m-0 p-0'>Neurosurgeon</p>
                        </div>
                    </div>
                    <div className='flex gap-1 items-center'>
                        <Image src={Heart} alt='heart icon' className='w-5 h-5' />
                        <p>4.5</p>
                    </div>
                </Link>
            </div>
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
    )
}

export default AllDoctors;