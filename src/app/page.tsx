import { ConnectToRoom } from "@/components/home/connectToRoom";

export default function RoomForm() {

    return (  
        <>
            <div className="flex flex-col container p-20 font-bold">
                <h1 className=" text-4xl">Enter The Chat Room</h1>
                <ConnectToRoom />
            </div>
        
        </>
    )
}