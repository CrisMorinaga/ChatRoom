'use client'
import Script from 'next/script';
import io from 'socket.io-client'
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import MessageBubbles from '@/components/MessageBubbles';

const CONNECTION_URL = process.env.NEXT_PUBLIC_SERVER as string
const socketio = io(CONNECTION_URL, {
    withCredentials: true,
    transports : ['websocket']
})

export default function RoomForm() {

    const [messages, setMessages] = useState<any[]>([])
    const [messageInput, setMessageInput] = useState('')
    const chatRef = useRef<HTMLDivElement | null>(null)
    const windowRef = useRef<HTMLDivElement | null>(null) 
    const firstLoad = useRef(0)
    
    let userName: string | null = ''
    let roomCode: string | null = ''

    const router = useRouter();

    try {
        userName = localStorage.getItem('user_name')
        roomCode = localStorage.getItem('room')
    } catch (error) {
        // router.push('/')
        // console.log(error)
    }
    
    const leaveRoom = () => {
        socketio.emit('client_disconnect', { username: userName, room: roomCode })
        localStorage.removeItem('user_name');
        localStorage.removeItem('room');
        router.push('/')
    }

    const handleIntersect = (entries: any) => {
        entries.forEach((entry: any) => {
            if (entry.isIntersecting) {
                // console.log('Chat div is visible');
            } else {
                // console.log('Chat div is not visible');
                chatRef.current?.scrollIntoView({
                    behavior: "instant",
                    block: "end",
                });
            }
        });
    };

    useEffect(() => {
        const options = {
            root: null, 
            rootMargin: '0px',
            threshold: 0.5, 
        };
    
        const observer = new IntersectionObserver(handleIntersect, options);
    
        if (chatRef.current) {
            observer.observe(chatRef.current);
        }

        return () => {
            if (chatRef.current) {
                observer.unobserve(chatRef.current);
            }
        };
    }, [messages]);

    useEffect(() => {
        if (userName && roomCode) {
            socketio.emit('client_connect', { username: userName, room: roomCode })
            socketio.on('message', (data) => {
                const { name, message, date, enter_or_leave_message } = data;
                const newMessage = <MessageBubbles name={name} message={message} date={date} enter_or_leave_message={enter_or_leave_message} userName={userName as string}/>
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });
        } else {
            router.push('/')
        }
        return (() => {
            socketio.emit('clean_dict', { username: userName, room: roomCode})
        })
    }, [roomCode, router, userName]);

    const sendMessage = () => {
        if (messageInput === '') return;
        socketio.emit("message", {message: messageInput, username: userName, room: roomCode})
        setMessageInput('')
    }

    return (  
        <>
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js" 
            integrity="sha512-q/dWJ3kcmjBLU4Qc47E4A9kTB4m3wuTY7vkFJDTZKjTs8jhyGQnaUrxa0Ytd0ssMZhbNua9hE+E7Qv1j+DyZwA==" 
            crossOrigin="anonymous"></Script>

            <div className='sm:pt-10'>
                <div className='flex flex-col border-2 border-black border-solid sm:rounded-2xl 
                bg-white sm:h-[80vh] sm:w-[80vw] h-screen w-screen items-stretch'>
                    <div className='flex flex-row justify-between'>
                        <h1 className='sm:text-3xl text-md p-2 self-center'>Chat Room: {roomCode}</h1>
                        <Button className='p-4 m-2 sm:text-md text-sm my-4' type="button" name="leave-room" onClick={leaveRoom}>Leave Room</Button>
                    </div>
                    <div ref={windowRef} className="overflow-scroll flex-1 w-full" id="messages">
                        {messages.map((message, index) => {
                            const name = message.props.name
                            return (
                                <div key={index} 
                                className={`flex items-center ${name === userName ? 'justify-end' : 'justify-start'} px-2 my-2 gap-1`}>
                                    {message}
                                </div>
                            )
                        })}
                        <div ref={chatRef} />
                    </div>
                    <div className='flex p-2 gap-2'>
                        <input 
                        onKeyDown={(e) => { if (e.key === 'Enter') {e.preventDefault(); sendMessage();}}}
                        onChange={(e) => setMessageInput(e.target.value)}
                        type="text" id="message" placeholder="Message" name="message" value={messageInput} 
                        className='w-full p-2 rounded-lg border border-dashed border-black bg-white'/>
                        <Button className='p-4 text-lg self-center' type="button" name="send" onClick={sendMessage}>Send</Button>
                    </div>
                </div>
            </div>
            
        </>
    )
}