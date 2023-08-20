import MessageCheck from "./MessageCheck"

type Props = {
    name: string,
    message: string,
    enter_or_leave_message: boolean,
    userName: string,
    date: string,
}

export default function MessageBubbles({name, message, enter_or_leave_message, userName, date}: Props) {

    return (
        <>
            {enter_or_leave_message ? (
                <div className="flex flex-col w-full">
                    <div className={`chat-header`}>
                        <time className="mx-2 text-xs opacity-50">{date}</time>
                    </div>
                    <div className='border border-black p-2 rounded-xl bg-slate-500 text-white w-full'>
                        <strong>{name} {message}</strong>
                    </div>
                </div>
                
             ) : (
                <MessageCheck userName={userName} name={name} date={date} message={message}/>
            )}
        </>
        
    )
}