import { pipeline } from "stream/promises"
import { LIVE_PATH } from "./constants.js"
import fs from "fs/promises"
import { createWriteStream } from "fs"

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function saveFile(stream: ReadableStream, path: string) {
	const fullPath = `${LIVE_PATH}${path}`
	const dirPath = fullPath.substring(0, fullPath.lastIndexOf("/"))

    try {
        await fs.mkdir(dirPath, { recursive: true })

        await pipeline(
            stream,
            createWriteStream(fullPath)
        )

        console.log("saved  ", path)
    } catch (e) {
        console.error("error  ", `piping file ${path}\n`, e)
    }
}

export async function readTextBody(body: ReadableStream): Promise<string> {
	const decoder = new TextDecoder()
	const text = []

	for await (const chunk of body) {
		const chunkText = decoder.decode(chunk, { stream: true })
		text.push(chunkText)
	}

	text.push(decoder.decode())

	return text.join("")
}