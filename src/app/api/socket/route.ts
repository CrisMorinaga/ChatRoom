import { NextRequest, NextResponse } from 'next/server';
import axios, {AxiosError} from 'axios';

const SERVER = process.env.NEXT_PUBLIC_SERVER as string
const REQUEST_TIMEOUT = 6000

export async function POST(req: NextRequest) {

    try {
        const requestBody = await req.json()
        const { name, code, join } = requestBody

        const request = await axios.post(SERVER, {
            name: name,
            code: code,
            join: join
        }, {
            timeout: REQUEST_TIMEOUT,
        })
        return NextResponse.json({data: request.data}, {status: 200})

    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.code === 'ECONNABORTED') {
                return new NextResponse('Request timeout', {status: 504})
            } else if (error.response?.data.message.includes('That room does not exist.')) {
                return new NextResponse('Room does not exists.', {status: 409})
            } else if (error.response?.data.message.includes('Username already in use.')) {
                return new NextResponse('Username already in use.', {status: 409})
            }
        } else {
            return new NextResponse('Internal Server Error', { status: 500 })
        }
    }
}
