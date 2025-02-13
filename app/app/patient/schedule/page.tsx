"use client";

import {
  Abstraxion,
  useAbstraxionAccount,
} from "@burnt-labs/abstraxion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, query, where, getDocs } from "firebase/firestore";
import DocImg from "@/public/Frame 75.svg";
import DateIcon from "@/public/story.svg";
import TimeIcon from "@/public/clock.svg";
import ArrowLeft from "@/public/arrow-left.svg";
import Add from "@/public/add.svg";
import Link from "next/link";
import { db } from "@/app/components/firebase-config";
import { useRouter } from "next/navigation";
import { DNA } from "react-loader-spinner";

interface Booking {
  date: string;
  doctorId: string;
  time: string;
  userId: string;
  doctor?: Doctor | null;
}

interface Doctor {
  name: string;
  specialization: string;
  [key: string]: any;
}

function Schedule() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const { data: account } = useAbstraxionAccount();

  useEffect(() => {
    if (!account?.bech32Address) {
      setIsOpen(true);
      return;
    }

    const fetchBookingsWithDoctors = async () => {
      setLoading(true);
      try {
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, where("userId", "==", account.bech32Address));
        const querySnapshot = await getDocs(q);

        const bookingsData = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const bookingData = docSnapshot.data() as Booking;

            // Fetch doctor details from "users" collection using doctorId
            const usersRef = collection(db, "users");
            const userQuery = query(
              usersRef,
              where("walletAddress", "==", bookingData.doctorId)
            );
            const userSnapshot = await getDocs(userQuery);

            let doctorData: Doctor | null = null;
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data() as Doctor;
              doctorData = {
                name: `Dr. ${userData.firstName} ${userData.lastName}`,
                specialization: userData.specialization,
              };
            }

            return {
              ...bookingData,
              doctor: doctorData,
            };
          })
        );

        setBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingsWithDoctors();
  }, [account?.bech32Address]);

  const handleDoctorClick = (doctorId: string) => {
    router.push(`/patient/messages/${doctorId}`);
  };

  return (
    <main className="w-11/12 max-w-lg mx-auto font-urbanist min-h-screen box-border">
      <div className="mt-2 flex justify-between w-full">
        <div className="flex gap-3 items-center">
          <Link href="/patient/userHome">
            <Image src={ArrowLeft} alt="back icon" />
          </Link>
          <h1 className="font-jakarta font-semibold text-xl">Schedule</h1>
        </div>
        <Image src={Add} alt="add icon" />
      </div>
      <ul className="flex w-full justify-between my-2 h-11 items-center bg-custom-schedule rounded-full py-1 px-4">
        <li className="py-1 px-3 bg-active-nav rounded-xl leading-none text-white">
          Upcoming
        </li>
        <li>Completed</li>
        <li>Cancelled</li>
      </ul>

      <div className="pb-14">
        {loading ? (
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
        ) : bookings.length === 0 ? (
          <p className="text-center mt-6">No upcoming appointments</p>
        ) : (
          bookings.map((booking, index) => (
            <div
              key={index}
              className="w-full bg-custom-schedule rounded-xl p-3 mb-2"
              onClick={() => handleDoctorClick(booking.doctorId)}
            >
              <div className="flex gap-2">
                <Image src={DocImg} alt="doctor profile image" className="w-10 h-10" />
                <div className="leading-none">
                  <p className="text-custom-black font-semibold text-base m-0">
                    {booking.doctor?.name}
                  </p>
                  <p className="leading-none text-sm m-0 p-0">
                    {booking.doctor?.specialization}
                  </p>
                </div>
              </div>
              <div className="text-black text-xs flex justify-between items-center bg-schedule-col-inner mt-2 p-4 rounded-xl">
                <div className="flex items-center gap-1">
                  <Image src={DateIcon} alt="calendar icon" />
                  <p>{booking.date}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Image src={TimeIcon} alt="clock icon" />
                  <p>{booking.time}</p>
                </div>
              </div>
              <div className="w-full mt-2 flex justify-between h-10">
                <button className="bg-none border-custom-blue border text-custom-blue h-full p-3 rounded-2xl flex items-center w-36 justify-center">
                  Cancel
                </button>
                <button className="bg-schedule-col text-white h-full p-3 rounded-2xl flex items-center w-36 justify-center">
                  Reschedule
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {isOpen && <Abstraxion onClose={() => setIsOpen(false)} />}
    </main>
  );
}

export default Schedule;
