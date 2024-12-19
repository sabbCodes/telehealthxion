"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ref, push, onValue, off } from "firebase/database";
import DocImg from '@/public/Frame 75.svg';
import ArrowLeft from '@/public/arrow-left.svg';
import VideoIcon from '@/public/video.svg';
import Attachment from '@/public/attachment.svg';
import CameraIcon from '@/public/camera.svg';
import MicrophoneIcon from '@/public/microphone-2.svg';
import SendIcon from '@/public/send.svg';
import { database, db } from '@/app/components/firebase-config';
import { addDoc, collection, getDocs, query, where } from '@firebase/firestore';
import { useWallet } from '@solana/wallet-adapter-react';
import PopupWallet from '@/app/components/PopupWallet';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface CryptoKeyPair {
    publicKey: CryptoKey;
    privateKey: CryptoKey;
}

interface DoctorDetails {
    firstName: string;
    lastName: string;
    dateOfBirth: number;
    allergies: string;
    medicalHistory: string;
    walletAddress: string;
}

function Chat() {
    const wallet = useWallet();
    const [message, setMessage] = useState('');
    const [decryptedMessages, setDecryptedMessages] = useState<any[]>([]);
    const [chatKeyPair, setChatKeyPair] = useState<CryptoKeyPair | null>(null);
    const [otherPublicKey, setOtherPublicKey] = useState<string | null>(null);
    const [publicKeyStoredInDb, setPublicKeyStoredInDb] = useState(false);
    const [showConnectWallet, setShowConnectWallet] = useState(false);
    const [doctorDetails, setDoctorDetails] = useState<DoctorDetails | null>(null);
    const { chatId } = useParams();
    const router = useRouter();
    const chatRef = ref(database, 'chats/doctor-patient-chat');
    let userId: string;

    useEffect(() => {
        if (wallet.connected && wallet.publicKey) {
          userId = wallet.publicKey.toString();
        } else {
          setShowConnectWallet(true);
        }
    }, [wallet]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    };

    const [publicKey, setPublicKey] = useState<string | null>(null);

    // 1. Key Generation
    const generateKeyPair = async (): Promise<CryptoKeyPair> => {
        return await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
        );
    };

    // 2. Key Exchange
    const exportPublicKey = async (keyPair: CryptoKeyPair): Promise<string> => {
        const exportedKey = await crypto.subtle.exportKey(
          "spki",
          keyPair.publicKey
        );
        const exportedKeyArray = Array.from(new Uint8Array(exportedKey));
        return btoa(String.fromCharCode.apply(null, exportedKeyArray));
    };

    // Function to import the public key from base64 string
    const importPublicKey = async (base64Key: string): Promise<CryptoKey> => {
        const publicKeyBuffer = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
        return await crypto.subtle.importKey(
            "spki",
            publicKeyBuffer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["encrypt"]
        );
    };

    // 3. Encryption
    const encryptMessage = async (message: string, publicKey: CryptoKey): Promise<string> => {
        const encodedMessage = new TextEncoder().encode(message);
        const encryptedData = await crypto.subtle.encrypt(
            {
            name: "RSA-OAEP"
            },
            publicKey,
            encodedMessage
        );
        const encryptedDataArray = Array.from(new Uint8Array(encryptedData));
        return btoa(String.fromCharCode.apply(null, encryptedDataArray));
    };

    // 4. Decryption
    const decryptMessage = async (encryptedMessage: string, privateKey: CryptoKey): Promise<string> => {
        try {
            const binaryString = atob(encryptedMessage);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
            }
            const decryptedData = await crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            privateKey,
            bytes
            );
            return new TextDecoder().decode(decryptedData);
        } catch (error) {
            console.error('Decryption failed:', error);
            return ''; // or handle the error as appropriate for your application
        }
    };

    // Utility functions to store and retrieve keys from local storage
    const storeKey = (keyName: string, key: string) => {
        localStorage.setItem(keyName, key);
    };

    const retrieveKey = (keyName: string): string | null => {
        return localStorage.getItem(keyName);
    };

    // 1. Key Generation and Storage
    const generateAndStoreKeyPair = async (): Promise<CryptoKeyPair> => {
        const keyPair = await generateKeyPair();

        // Export keys
        const publicKey = await exportPublicKey(keyPair);
        const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
        const privateKeyArray = Array.from(new Uint8Array(privateKey));
        const privateKeyBase64 = btoa(String.fromCharCode.apply(null, privateKeyArray));

        // Store keys in local storage
        storeKey("rsa-public-key", publicKey);
        storeKey("rsa-private-key", privateKeyBase64);

        return keyPair;
    };

    // 2. Importing the Private Key
    const importPrivateKey = async (base64Key: string): Promise<CryptoKey> => {
        const privateKeyBuffer = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
        return await crypto.subtle.importKey(
            "pkcs8",
            privateKeyBuffer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["decrypt"]
        );
    };

    useEffect(() => {
        const initKeyPair = async () => {
            // Check if the keys are already in local storage
            let publicKey = retrieveKey("rsa-public-key");
            let privateKeyBase64 = retrieveKey("rsa-private-key");

            let keyPair: CryptoKeyPair;

            if (publicKey && privateKeyBase64) {
                // If keys exist in local storage, import the private key
                const privateKey = await importPrivateKey(privateKeyBase64);
                keyPair = { publicKey: await importPublicKey(publicKey), privateKey };
            } else {
                // Otherwise, generate and store a new key pair
                keyPair = await generateAndStoreKeyPair();
                publicKey = retrieveKey("rsa-public-key")!;
                privateKeyBase64 = retrieveKey("rsa-private-key")!;
            }

            setChatKeyPair(keyPair);
            setPublicKey(publicKey);

            // Store the public key in Firebase under the user's ID if not already stored
            if (chatId && !publicKeyStoredInDb) {
                await addDoc(collection(db, 'publicKeys'), {
                    userId: userId,
                    publicKey
                });
                setPublicKeyStoredInDb(true);
            }

            // Retry fetching the other party's public key
            const fetchOtherPublicKey = async () => {
                const q = query(collection(db, 'publicKeys'), where("userId", "==", chatId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const otherUserPublicKey = querySnapshot.docs[0].data().publicKey;
                    setOtherPublicKey(otherUserPublicKey);
                } else {
                    console.error("No public key found for the other user, retrying...");
                    setTimeout(fetchOtherPublicKey, 2000); // Retry after 2 seconds
                }
            };

            fetchOtherPublicKey();
        };

        initKeyPair();
    }, [chatId]);

    const formatTimestamp = (timestamp: number): string => {
        if (typeof timestamp !== 'number' || isNaN(timestamp)) {
            console.error('Invalid timestamp:', timestamp);
            return 'Invalid Time';
        }

        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            console.error('Invalid date object:', date);
            return 'Invalid Time';
        }

        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Ensures 24-hour format
        });
    };

    const storeSentMessageLocally = (message: string, recipientPublicKey: string, timestamp: number) => {
        const sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '[]');
        sentMessages.push({ message, recipientPublicKey, timestamp });
        localStorage.setItem('sentMessages', JSON.stringify(sentMessages));
    };

    const loadSentMessages = (recipientPublicKey: string) => {
        const sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '[]');
        return sentMessages.filter((msg: any) => msg.recipientPublicKey === recipientPublicKey);
    };

    useEffect(() => {
        if (otherPublicKey) {
          const storedMessages = loadSentMessages(otherPublicKey);
          setDecryptedMessages((prevMessages) => [
            ...prevMessages,
            ...storedMessages.map((msg: any) => ({
              content: msg.message,
              sender: publicKey,
              timestamp: msg.timestamp,
              formattedTime: formatTimestamp(msg.timestamp),
            })),
          ]);
        }
    }, [otherPublicKey]);

    const handleSend = async () => {
        if (!otherPublicKey || !message.trim() || !chatKeyPair) return;

        try {
            // Import the other party's public key
            const importedPublicKey = await importPublicKey(otherPublicKey);

            // Encrypt the message using the imported public key
            const encryptedMessage = await encryptMessage(message, importedPublicKey);
            if (encryptedMessage) {
                const timestamp = Date.now();

                // Push the encrypted message to the database
                push(chatRef, {
                    sender: publicKey,       // Sender's public key
                    recipient: otherPublicKey, // Recipient's public key
                    message: encryptedMessage,
                    timestamp,
                });

                // Store the plaintext message locally
                storeSentMessageLocally(message, otherPublicKey, timestamp);

                // Directly add the plain text message to the decryptedMessages array
                setDecryptedMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        content: message, // Add the plain text message
                        sender: publicKey,
                        timestamp,
                        formattedTime: formatTimestamp(timestamp),
                    },
                ]);

                // Clear the message input
                setMessage('');
            }
        } catch (err) {
            console.error('Failed to encrypt or send message:', err);
        }
    };

    useEffect(() => {
        const handleNewMessages = async (snapshot: any) => {
            const messages = snapshot.val();
            if (messages && chatKeyPair && publicKey) {
                const newMessages = await Promise.all(
                    Object.entries(messages).map(async ([key, msg]: [string, any]) => {
                        // Filter messages based on recipient
                        if (msg.recipient !== publicKey && msg.sender !== publicKey) {
                            // Skip messages where the current user is neither the sender nor the recipient
                            return null;
                        }

                        if (msg.sender === publicKey) {
                            // Skip decryption for messages sent by the current user
                            return null;
                        } else {
                            try {
                                const decryptedContent = await decryptMessage(msg.message, chatKeyPair.privateKey);
                                return {
                                    key, // Use the key as a unique identifier
                                    content: decryptedContent,
                                    sender: msg.sender,
                                    timestamp: msg.timestamp,
                                    formattedTime: formatTimestamp(msg.timestamp),
                                };
                            } catch (error) {
                                console.error('Failed to decrypt message:', error);
                                return null;
                            }
                        }
                    })
                );

                // Filter out null values (messages that are not meant for this user)
                const filteredNewMessages = newMessages.filter(msg => msg !== null);

                if (filteredNewMessages.length > 0) {
                    setDecryptedMessages((prevMessages) => {
                        const existingKeys = new Set(prevMessages.map((msg) => msg.key));
                        const uniqueNewMessages = filteredNewMessages.filter((msg) => !existingKeys.has(msg.key));
                        return [...prevMessages, ...uniqueNewMessages];
                    });
                }
            }
        };

        onValue(chatRef, handleNewMessages);

        return () => {
            off(chatRef, 'value', handleNewMessages);
        };
    }, [chatRef, chatKeyPair, publicKey]);

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            if (chatId) {
                try {
                    const doctorsRef = collection(db, 'users');
                    const q = query(doctorsRef, where("walletAddress", "==", chatId as string));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const patientDoc = querySnapshot.docs[0].data() as DoctorDetails;
                        setDoctorDetails(patientDoc);
                    } else {
                        console.error('Patient not found');
                    }
                } catch (error) {
                    console.error('Error fetching patient details:', error);
                }
            }
        };

        fetchDoctorDetails();
    }, [chatId]);

    const handleVideoCallClick = () => {
        if (chatId) {
            router.push(`/patient/video-call?receiverId=${chatId}`);
        } else {
            setShowConnectWallet(true);
            console.error('User ID is not available');
        }
    };

    return (
        <main className="w-11/12 max-w-lg mx-auto font-urbanist min-h-screen box-border">
            <div className='flex mt-2 justify-between items-center'>
                <div className='flex gap-3 items-center'>
                    <Link href='/patient/messages'>
                        <Image src={ArrowLeft} alt='back icon' />
                    </Link>
                    <div className='flex gap-2'>
                        <Image src={DocImg} alt='doctor profile image' className='w-10 h-10 rounded-full' />
                        <div className='leading-none flex flex-col justify-center'>
                            <p className='leading-none text-custom-black font-semibold text-base m-0'>Dr. {doctorDetails?.firstName} {doctorDetails?.lastName}</p>
                            <p className='leading-none text-xs text-dark-grey m-0 p-0'>Active now!</p>
                        </div>
                    </div>
                </div>
                <Image src={VideoIcon}  onClick={handleVideoCallClick} alt='video call' className='w-6 h-6' />
            </div>
            <div>
            <p className='text-sm text-center italic mt-1 text-gray-500'>Messages are end-to-end eencrypted</p>
                <h3 className='text-center bg-doc-bg w-14 h-6 flex justify-center items-center p-2 text-sm mx-auto mt-2 rounded-lg'>Today</h3>
                {decryptedMessages.map((msg, index) => (
                    <div key={index} className={`flex flex-col  w-3/4 ${msg.sender === publicKey?.toString() ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                        <p className={`${msg.sender === publicKey?.toString() ? 'bg-chat-blue text-white rounded-br-none' : 'bg-doc-bg text-black rounded-bl-none'} py-2 px-4 max-w-full rounded-lg`}>
                            {msg.content}
                        </p>
                        <p className='text-xs text-dark-grey'>{msg.formattedTime}</p>
                    </div>
                ))}
            </div>
            <div className='fixed bottom-0 left-0 w-full bg-white py-2 px-4 flex items-center justify-between z-10'>
                <Image src={Attachment} alt='select a file' className='mr-0' />
                <input
                    type='text'
                    value={message}
                    onChange={handleChange}
                    placeholder='Write a message'
                    className='flex-1 py-2 px-3 rounded-xl bg-doc-bg text-base mx-2 outline-0'
                />
                <div className='flex items-center'>
                    {message === '' ? (
                        <>
                            <Image src={CameraIcon} alt='send picture' className='mr-2' />
                            <Image src={MicrophoneIcon} alt='record audio' />
                        </>
                    ) : (
                        <Image
                            src={SendIcon}
                            alt='send message'
                            className='w-6 h-6'
                            onClick={handleSend}
                        />
                    )}
                </div>
            </div>
            {showConnectWallet && (
                <PopupWallet onClose={() => setShowConnectWallet(false)} />
            )}
        </main>
    );
}

export default Chat;
