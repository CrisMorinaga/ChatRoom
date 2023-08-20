import { ConnectToRoom } from "@/components/home/connectToRoom";

export default function RoomForm() {

    return (  
        <>
            <div className="flex flex-col container p-10 mt-4 font-bold">
                <h1 className="sm:text-4xl text-2xl text-white">Enter The Chat Room</h1>
                <ConnectToRoom />
            </div>
        
        </>
    )
}