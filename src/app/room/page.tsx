'use client'
import Script from 'next/script';
import io from 'socket.io-client'
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
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
    const [messageDate, setMessageDate] = useState<string[]>([])
    
    const userName = localStorage.getItem('user_name')
    const roomCode = localStorage.getItem('room')

    const router = useRouter();

    const leaveRoom = () => {
        socketio.emit('client_disconnect', { username: userName, room: roomCode })
        localStorage.removeItem('user_name');
        localStorage.removeItem('room');
        router.push('/')
    }

    useEffect(() => {
        if (userName && roomCode) {
            socketio.emit('client_connect', { username: userName, room: roomCode })
            socketio.on('message', (data) => {
                const { name, message, date, enter_or_leave_message } = data;
                const newMessage = <MessageBubbles name={name} message={message} enter_or_leave_message={enter_or_leave_message} userName={userName}/>
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                setMessageDate((prevDates) => [...prevDates, date])
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

            <div className='pt-10'>
                <div className='flex flex-col border-2 border-black border-solid rounded-lg 
                bg-slate-200 h-[80vh] w-[80vw] items-stretch'>
                    <h1 className='text-3xl p-2'>Chat Room: {roomCode}</h1>
                    <div className="overflow-scroll flex-1 w-full" id="messages">
                        {messages.map((message, index) => {
                            const name = message.props.name
                            return (
                                <div key={index} 
                                className={`flex items-center ${name === userName ? 'flex-row' : 'flex-row-reverse'} justify-end px-2 my-2 gap-1`}>
                                    <span className=" text-base text-slate-500">
                                        {messageDate[index]} 
                                    </span>
                                    {message}
                                </div>
                            )
                        })}
                    </div>
                    <div className='flex p-2 gap-2'>
                        <input 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        onChange={(e) => setMessageInput(e.target.value)}
                        type="text" id="message" placeholder="Message" name="message" value={messageInput} 
                        className='w-full p-2 rounded-lg border border-dashed border-black'/>
                        <Button className='p-4 text-lg self-center' type="button" name="send" onClick={sendMessage}>Send</Button>
                    </div>
                </div>
                <Button className='p-4 text-lg self-center my-4' type="button" name="leave-room" onClick={leaveRoom}>Leave Room</Button>
            </div>
            
        </>
    )
}