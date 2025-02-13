"use client";

import {
  Abstraxion,
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import Image from "next/image";
import UserDp from "@/public/userdp.svg";
import DocImg from "@/public/Frame 75.svg";
import TimeIcon from "@/public/clock.svg";
import HomeActive from "@/public/homeActive.svg";
import ScheduleInactive from "@/public/story.svg";
import MessagesInactive from "@/public/messages-inactive.svg";
import ProfileInactive from "@/public/profileInactive.svg";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/components/firebase-config";
// import PopupWallet from "@/app/components/PopupWallet";
import { useRouter } from "next/navigation";
import { DNA } from "react-loader-spinner";

interface BookingDetails {
  userId: string;
  doctorId: string;
  date: string;
  time: string;
  consultationFee: number;
  status: string;
}

interface UserDetails {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  walletAddress: string;
}

interface DoctorDetails {
  firstName: string;
  lastName: string;
  specialization: string;
}

function Home() {
  const [doctorDetails, setDoctorDetails] = useState<DoctorDetails | null>(null);
  const [bookings, setBookings] = useState<(BookingDetails & { userDetails: UserDetails | null })[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Abstraxion hooks
  const { data: account } = useAbstraxionAccount();
  // const { client } = useAbstraxionSigningClient();

  useEffect(() => {
    if (!account?.bech32Address) {
        setIsOpen(true);
        return;
    }

    const fetchDoctorDetails = async () => {
      try {
        const doctorsRef = collection(db, "users");
        const q = query(doctorsRef, where("walletAddress", "==", account.bech32Address));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doctorDoc = querySnapshot.docs[0].data() as DoctorDetails;
          setDoctorDetails(doctorDoc);
        } else {
          console.error("Doctor not found");
        }
      } catch (error) {
        console.error("Error fetching doctor details:", error);
      }
    };

    const fetchBookings = async () => {
      try {
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, where("doctorId", "==", account.bech32Address));
        const querySnapshot = await getDocs(q);

        const fetchedBookings: (BookingDetails & { userDetails: UserDetails | null })[] = [];

        for (const docSnapshot of querySnapshot.docs) {
          const bookingData = docSnapshot.data() as BookingDetails;

          const usersRef = collection(db, "users");
          const userQuery = query(usersRef, where("walletAddress", "==", bookingData.userId));
          const userQuerySnapshot = await getDocs(userQuery);

          let userDetails: UserDetails | null = null;

          if (!userQuerySnapshot.empty) {
            const userDoc = userQuerySnapshot.docs[0].data() as UserDetails;
            userDetails = userDoc;
          } else {
            console.error("User not found for walletAddress:", bookingData.userId);
          }

          fetchedBookings.push({ ...bookingData, userDetails });
        }

        setBookings(fetchedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchDoctorDetails();
    fetchBookings();
  }, [account?.bech32Address]);

  const formatDateString = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      const [day, month, year] = dateString.split("/");
      return new Date(`${month}/${day}/${year}`).toLocaleDateString("en-US", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
    }
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  const handlePatientClick = (patientId: string) => {
    router.push(`/doctor/messages/${patientId}`);
  };

  if (!doctorDetails) {
    return (
        <div className="flex justify-center items-center h-64">
            <DNA
                visible={true}
                height="80"
                width="80"
                ariaLabel="dna-loading"
                wrapperStyle={{}}
                wrapperClass="dna-wrapper"
            />
        </div>
    );
  }

  return (
    <main className="w-11/12 max-w-lg mx-auto font-urbanist min-h-screen box-border">
      <div className="w-full mt-3">
        <div className="h-16 w-full flex justify-between items-center">
          <div>
            <h1 className="text-custom-black font-jakarta font-semibold text-2xl">
              Good day, Dr. {doctorDetails.firstName}
            </h1>
            <p className="text-sm ">You've {bookings.length} appointments today.</p>
          </div>
          <Image src={UserDp} alt="user profile" className="h-16 w-16" />
        </div>
      </div>
      <div className="mt-8">
        <div className="w-full flex justify-between items-center mb-3">
          <h2 className="text-custom-black font-jakarta font-semibold text-xl">
            Upcoming Schedule
          </h2>
          <Link href="/userHome/alldoctors" className="text-custom-blue text-base">
            View All
          </Link>
        </div>
        {bookings.map((booking, index) => (
          <div
            key={index}
            onClick={() => {
              const walletAddress = booking.userDetails?.walletAddress;
              if (walletAddress) {
                handlePatientClick(walletAddress);
              } else {
                console.error("User wallet address is undefined");
              }
            }}
            className="flex justify-between items-center h-10 rounded-lg mb-4 cursor-pointer"
          >
            <div className="flex gap-2">
              <Image src={DocImg} alt="patient profile image" className="w-10 h-10" />
              <div className="leading-none">
                <p className="text-custom-black font-jakarta font-semibold text-base m-0">
                  {booking.userDetails?.firstName} {booking.userDetails?.lastName}
                </p>
                <p className="leading-none text-sm m-0 p-0">
                  {booking.userDetails?.gender.charAt(0).toUpperCase()} /{" "}
                  {new Date().getFullYear() -
                    new Date(booking.userDetails?.dateOfBirth || "").getFullYear()}{" "}
                  yrs old
                </p>
              </div>
            </div>
            <div className="flex gap-1 items-center text-xs">
              <Image src={TimeIcon} alt="Time Icon" className="w-5 h-5" />
              <p>
                {formatDateString(booking.date)} | {booking.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      <footer className="flex items-center h-14 shadow-3xl w-screen m-0 fixed right-0 left-0 bottom-0 bg-white">
        <nav className="w-full flex gap-14 justify-evenly items-center py-4 px-14">
          <Link href="/doctor/docHome">
            <Image src={HomeActive} alt="home icon" />
          </Link>
          <Link href="/doctor/schedule">
            <Image src={ScheduleInactive} alt="Schedule icon" />
          </Link>
          <Link href="/doctor/messages">
            <Image src={MessagesInactive} alt="Messages icon" />
          </Link>
          <Link href="/doctor/userProfile">
            <Image src={ProfileInactive} alt="Profile icon" />
          </Link>
        </nav>
      </footer>
      {isOpen && <Abstraxion onClose={() => setIsOpen(false)} /> }
    </main>
  );
}

export default Home;
