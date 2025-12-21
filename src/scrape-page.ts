import * as cheerio from "cheerio"
import fs from "fs/promises"
import { EPSTEIN_FILES_PATH, JUSTICE_GOV_HOSTNAME, JUSTICE_GOV_URL, LIVE_PATH } from "./constants.js"
import { pipeline } from "stream/promises"
import { createWriteStream } from "fs"
import { readTextBody, saveFile } from "./util.js"

export async function scrape(urlString: string, bmVerify: string) {
	try {
		const url = new URL(urlString)
		const { body, contentType } = await getFile(`${urlString}?bm-verify=${bmVerify}`)
		let hrefs: string[] = []
		let path = url.pathname

		//console.log("Scraping:", urlString, "Content-Type:", contentType)
		if (contentType.includes("text/html")) {
			const html = await readTextBody(body)
			const $ = cheerio.load(html)

			hrefs = extractHrefs($)
			if (path.endsWith("/")) {
				path += "index.html"
			} else {
				path += "/index.html"
			}
			
			const stream = new ReadableStream({
				start(controller) {
					controller.enqueue(new TextEncoder().encode(html))
					controller.close()
				}
			})
			saveFile(stream, path) // save file asynchronously
		} else {
			saveFile(body, path) // save file asynchronously
		}

		return { contentType, hrefs, success: true}
	} catch (error) {
		console.error("error  ", `${urlString}\n`, error)
		return { contentType: "", hrefs: [], success: false }
	}
}

export async function getFile(url: string){
	const response = await fetch(url)

	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status}`)
	}

	const contentType = response.headers.get("content-type") || ""
	
	if (contentType.includes("text/html")) {
		return { body: response.body!, contentType }
	} else {
		return { body: response.body!, contentType }
	}
}

function extractHrefs($: cheerio.CheerioAPI): string[] {
	const hrefs: string[] = []

	$("a[href]").each((_, element) => {
		const href = $(element).attr("href")
		if (!href) return

		let url: URL
		try {
			url = new URL(href)
		} catch {
			// If href is a relative URL, construct the full URL
			url = new URL(href, JUSTICE_GOV_URL)
		}

		//console.log("Found href:", url.pathname, EPSTEIN_FILES_PATH)
		if (url.hostname !== JUSTICE_GOV_HOSTNAME) return
		if (!url.pathname.startsWith(EPSTEIN_FILES_PATH)) return

		hrefs.push(url.href)
	})

	return hrefs
}