import * as cheerio from "cheerio"
import { EPSTEIN_FILES_URL, JUSTICE_GOV_URL, VERIFY_URL } from "./constants.js"
import { getFile } from "./scrape-page.js"
import { readTextBody } from "./util.js"

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

export async function bypassBotCheck() {
	const { body } = await getFile("https://www.justice.gov/epstein")

	const html = await readTextBody(body)
	const $ = cheerio.load(html)

	const scriptTags = $("script")
	const scripts: string[] = []

	scriptTags.each((_, element) => {
		scripts.push($(element).html() || "")
	})

	const pow      = extractPow(scripts[0]!)
	const bmVerify = extractBmVerify(scripts[1]!)


	//console.log("pow:", pow)
	//console.log("bm-verify:", bmVerify)


	const data: any = await fetch(VERIFY_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"User-Agent": USER_AGENT,
			"Origin": JUSTICE_GOV_URL,
			"Referer": EPSTEIN_FILES_URL,
			"dnt": "1",
			"priority": "u=0, i",
			"Sec-CH-UA": `"Chromium";v="120", "Google Chrome";v="120", "Not=A?Brand";v="24"`,
			"Sec-CH-UA-Mobile": "?0",
			"Sec-CH-UA-Platform": `"Windows"`,
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin"
		},
		body: JSON.stringify({
			"bm-verify": bmVerify,
			"pow": pow
		})
	}).then(response => response.json())

	//console.log("Response data:", data)

	if (!data.hasOwnProperty('location')) {
		throw new Error("Payload did not contain 'location' property.")
	}
	
	const url = new URL("https://www.justice.gov" + data["location"])
	const newBmVerify = url.searchParams.get("bm-verify")

	//console.log("New bm-verify:", newBmVerify)

	return newBmVerify
}

function extractPow(html: string) {
	const lines = html.split("; ")
	//console.log("Lines:", lines)
	const i = Number(lines[0]!.trim().split(" = ")[1]!)
	const jValue = lines[1]!.trim().split(" = ")[1]!
	const j = jValue.substring(jValue.indexOf("(") + 1, jValue.lastIndexOf(")")).split(" + ").reduce((sum, val) => sum + Number(val.slice(1, -1)), 0)
	//console.log(jValue, jValue.indexOf("("), jValue.indexOf(")"))

	return i + j
}

function extractBmVerify(html: string) {
	const left = html.indexOf(`{"bm-verify": "`) + `{"bm-verify": "`.length - 1
	const right = html.indexOf(`", "pow": j}`)
	const bmVerify = html.substring(left + 1, right)

	return bmVerify
}