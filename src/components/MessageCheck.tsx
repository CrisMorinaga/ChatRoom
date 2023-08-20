import Image from "next/image"

type Props = {
    name: string,
    userName: string,
    message: string,
    date: string,
}
export default function MessageCheck({name, userName, message, date}: Props) {

    const userMessage = name === userName
    return (
        <>
            <div className={`flex daisychat daisychat-${userMessage ? 'end flex-row-reverse' : 'start'}`}>
                <div className="daisychat-image daisyavatar">
                    <div className="flex w-10 h-10 rounded-full">
                        <Image priority unoptimized={true} src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${name}`} alt="profile image" width={0} height={0}/>
                    </div>
                </div>
                <div>
                    <div className={`daisychat-header ${userMessage ? '' : 'ml-2'}`}>
                        {name}
                        <time className="mx-2 text-xs opacity-50">{date}</time>
                    </div>
                    <div className={`daisychat-bubble ${userMessage ? 'bg-purple-600' : ''} text-white min-w-[150px] sm:max-w-[400px] max-w-[200px] break-words`}>
                        <strong>{message}</strong> 
                    </div>
                </div>
            </div>
        </>
        
    )
}