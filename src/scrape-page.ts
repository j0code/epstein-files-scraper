import * as cheerio from "cheerio"
import { EPSTEIN_FILES_PATH, JUSTICE_GOV_HOSTNAME, JUSTICE_GOV_URL } from "./constants.js"
import { readTextBody, saveFile } from "./util.js"

export async function scrape(urlString: string, bmVerify: string) {
	try {
		const url = new URL(urlString)
		const { body, contentType } = await getFile(`${urlString}?bm-verify=${bmVerify}`)
		let hrefs: string[] = []
		let path = url.pathname + url.search

		//console.log("Scraping:", urlString, "Content-Type:", contentType)
		if (contentType.includes("text/html")) {
			const html = await readTextBody(body)
			const $ = cheerio.load(html)

			hrefs = extractHrefs($, url.origin + url.pathname)
			if (path.endsWith("/")) {
				path += "index.html"
			} else if (!path.split("/").pop()?.includes(".")) {
				path += "/index.html"
			}

			path = path.replaceAll("?", "__") // avoid usage of ? in file paths
			
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

function extractHrefs($: cheerio.CheerioAPI, baseUrl: string): string[] {
	const hrefs: string[] = []

	$("a[href]").each((_, element) => {
		const href = $(element).attr("href")
		if (!href) return

		let url: URL
		try {
			url = new URL(href, baseUrl)
		} catch (e) {
			console.warn(`Invalid URL found: ${href} on page ${baseUrl}`)
			return
		}

		//console.log("Found href:", url.pathname, EPSTEIN_FILES_PATH)
		if (url.hostname !== JUSTICE_GOV_HOSTNAME) return
		if (!url.pathname.startsWith(EPSTEIN_FILES_PATH)) return

		const hashlessUrl = url.origin + url.pathname + url.search
		hrefs.push(hashlessUrl)
	})

	return hrefs
}