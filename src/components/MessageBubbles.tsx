type Props = {
    name: string,
    message: string,
    enter_or_leave_message: boolean,
    userName: string
}

export default function MessageBubbles({name, message, enter_or_leave_message, userName}: Props) {

    return (
        <>
            {enter_or_leave_message ? (
                <span className='border border-black p-2 rounded-xl bg-slate-500 text-white w-full'>
                    <strong>{name} {message}</strong>
                </span>
             ) : (
                (name === userName) ? (
                    <span className='border border-black p-2 rounded-xl bg-purple-600 text-white'>
                        <strong>{name}: {message}</strong> 
                    </span>
                ) : (
                    <span className='border border-black p-2 rounded-xl bg-white'>
                        <strong>{name}: {message}</strong> 
                    </span>
                )
            )}
        </>
        
    )
}