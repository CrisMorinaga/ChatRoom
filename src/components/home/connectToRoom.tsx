"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"


 
const formSchema = z.object({
    name: z.string().min(1, {message: 'Please enter a name.'}),
    roomCode: z.string().optional(),
})

export function ConnectToRoom() {

    const router = useRouter();
    const [button, setButton] = useState(false)
    const [joinClicked, setjoinClicked] = useState(false)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            roomCode: "",
        },
    })

    function handleChange(value: any) {
        if (value.length === 4) {
            setButton(true)
        } else {
            setButton(false)
            setjoinClicked(false)
        }
    }
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try{
            const request = await axios.post('/api/socket', {
                name: values.name,
                code: values.roomCode,
                join: joinClicked && true
            })      
            const username = request.data.data.username
            const room = request.data.data.room
            localStorage.setItem('user_name', username);
            localStorage.setItem('room', room);
            router.push('/room')

        } catch (error) {
            if (error instanceof AxiosError) {
                if(error.response?.data === 'Room does not exists.') {
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: "That room code does not exists, check your code and try again.",
                      })
                } else if (error.response?.data === 'Username already in use.') {
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: "That username already exist on that room, try with another one.",
                      })
                }
            } else {
                return
            }
        }  
    }    

    return (
        <div className="border rounded-xl mt-4 border-white">
            <Form {...form}>
                <form method="POST" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 m-4 text-white">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="sm:text-xl text-lg">Pick a name!</FormLabel>
                        <FormControl>
                            <Input className="text-md sm:py-6 py-3" autoComplete='name' placeholder="Cool Name" {...field} />
                        </FormControl>
                        <FormMessage className="text-sm"/>
                        </FormItem>
                    )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="roomCode"
                        render={({ field }) => (
                            <FormItem className=" sm:col-auto col-span-2">
                                <FormLabel className="sm:text-xl text-lg">Room Code</FormLabel>
                                <FormDescription className="sm:text-sm text-xs text-white"> Use your 4 digit code if you have one. </FormDescription>
                                <FormControl onChange={(event) => handleChange((event.target as HTMLInputElement).value)}>
                                    <Input className="text-md sm:py-6 py-3" autoComplete='name' placeholder="Code" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button onClick={() => setjoinClicked(true)} type="submit" className={`self-end sm:p-6 sm:text-lg p-3 text-sm`} disabled={!button}>Join a Room</Button>
                    </div>
                    <Button className="w-full p-6 text-lg" type="submit">Create a Room</Button>
                </form>
            </Form>
        </div>
      )
  }

