import { db } from "@/app/components/firebase-config";
import { addDoc, collection } from "@firebase/firestore";
import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const PLATFORM_ADDRESS: PublicKey = new PublicKey(
  "Sab5y7LG3VefLz4E6DSCkxdmjG4pve3hcAb8NUPKn42",
);

const DOCTOR_SABB_ADDRESS: PublicKey = new PublicKey(
  "4K297jX1o9XN8zLhohkBEMVEEXVmssBLWNHpuRQuJBiA",
);

const DOCTOR_ABDALLAH_ADDRESS: PublicKey = new PublicKey(
  "74bd3SEfw5hkLx8xLnx7NLvLjjTsK2tV6TKRZxEvB1GL",
);

const DOCTOR_SABB_FEE = 0.1;
const DOCTOR_ABDALLAH_FEE = 0.2;

const headers = {
  ...createActionHeaders({
    chainId: "mainnet", // or "devnet"
    actionVersion: "2.2.1",
  }),
  'Content-Type': 'application/json',
}

export const GET = async (req: Request) => {
  const reqURL = new URL(req.url);
  const iconUrl = new URL("/teleHealth.jpg", reqURL.origin);

  const payload: ActionGetResponse = {
    type: "action",
    title: "Schedule a session with your favourite doctors from around the world - with just a single click!",
    icon: iconUrl.toString(),
    description: "Book a session with your favorite DOCTOR",
    label: "Book a session",
    links: {
      actions: [
        {
          href: `/api/action?date={date}&time={time}&doctor={doctor}`,
          label: "Schedule meeting now!",
          parameters: [
            {
              name: "date",
              type: "date",
              label: "Session date",
              required: true
            },
            {
              name: "time",
              type: "select",
              label: "Session time",
              options: [
                { value: "8 AM", label: "8 AM" },
                { value: "9 AM", label: "9 AM" },
                { value: "10 AM", label: "10 AM" },
                { value: "11 AM", label: "11 AM" },
                { value: "12 PM", label: "12 PM" }
              ],
              required: true
            },
            {
              name: "doctor",
              type: "select",
              label: "Choose doctor",
              options: [
                { value: "Dr. Abdallah", label: "Dr. Abdallah" },
                { value: "Dr. Sabb", label: "Dr. Sabb" }
              ],
              required: true
            }
          ]
        }
      ]
    }
  };

  return new Response(JSON.stringify(payload), { headers });
};

export const OPTIONS = async (req: Request) => {
  return new Response(null, { headers });
};

export const POST = async (req: Request) => {
  const body: ActionPostRequest = await req.json();

  const url = new URL(req.url);
  const date = url.searchParams.get('date');
  const time = url.searchParams.get('time');
  const doctor = url.searchParams.get('doctor');

  // Determine the consultation fee and doctor's wallet address
  let consultationFeeInSol = 0;
  let doctorWalletAddress = '';

  if (doctor === 'Dr. Sabb') {
    consultationFeeInSol = DOCTOR_SABB_FEE;
    doctorWalletAddress = DOCTOR_SABB_ADDRESS.toBase58();
  } else if (doctor === 'Dr. Abdallah') {
    consultationFeeInSol = DOCTOR_ABDALLAH_FEE;
    doctorWalletAddress = DOCTOR_ABDALLAH_ADDRESS.toBase58();
  } else {
    return new Response('Invalid doctor selected', {
      status: 400,
      headers: headers,
    });
  }

  const platformFeeInLamports = Math.round((consultationFeeInSol * 0.1) * LAMPORTS_PER_SOL);
  const doctorFeeInLamports = Math.round((consultationFeeInSol * 0.9) * LAMPORTS_PER_SOL);

  let accountPubKey: PublicKey;
  try {
    accountPubKey = new PublicKey(body.account);
  } catch (err) {
    console.error("error fetching pubkey", err);
    return new Response('Invalid "account" provided', {
      status: 400,
      headers: headers,
    });
  }

  const connection = new Connection(clusterApiUrl("mainnet-beta")); //"devnet"
  const { blockhash } = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: accountPubKey,
  }).add(
    SystemProgram.transfer({
      fromPubkey: accountPubKey,
      toPubkey: PLATFORM_ADDRESS,
      lamports: platformFeeInLamports,
    }),
    SystemProgram.transfer({
      fromPubkey: accountPubKey,
      toPubkey: new PublicKey(doctorWalletAddress),
      lamports: doctorFeeInLamports,
    })
  );

  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      transaction,
      message: `Booking confirmed with ${doctor} for ${date} at ${time}. You can head to teleHealthSol to have your session!`,
    },
  });

  const bookingDetails = {
    userId: accountPubKey.toBase58(),
    doctorId: doctorWalletAddress,
    date: date,
    time: time,
    status: 'Booked',
  };

  await addDoc(collection(db, 'bookings'), bookingDetails);

  return new Response(JSON.stringify(payload), {
    headers: headers, // Use correct headers here
    status: 200
  });
};