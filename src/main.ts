import { execSync } from "child_process"
import { bypassBotCheck } from "./bypass-bot-check.js"
import { ARCHIVE_PATH, EPSTEIN_FILES_URL, LIVE_PATH, REQUEST_COOLDOWN_MS } from "./constants.js"
import { scrape } from "./scrape-page.js"
import fs from "fs/promises"
import { mkdirSync } from "fs"
import { sleep } from "./util.js"

const bmVerify = await bypassBotCheck()

if (!bmVerify) {
	console.error("Failed to bypass bot check.")
	process.exit(1)
}

// clear live directory
await fs.rm("./files/live", { recursive: true, force: true })
await fs.mkdir("./files/live", { recursive: true })

const completedHrefs = new Set<string>()
const scrapeHrefs: Set<string> = new Set()

scrapeHrefs.add(EPSTEIN_FILES_URL)

process.on('exit', (code) => {
	const finishTime = performance.now()
	const duration = ((finishTime - startTime) / 1000).toFixed(2)
	const time = new Date().toISOString().replace(/[:.]/g, "-")
	console.log("Scraping complete. Took:", duration, "seconds.")

	mkdirSync("./files/archive", { recursive: true })
	// save live dir as tar gz
	const archivePath = `${ARCHIVE_PATH}/epstein-files-${time}.tar.gz`
	execSync(`tar -czf ${archivePath} -C ${LIVE_PATH} .`)
	console.log("Archive created at", archivePath)

	const tarDuration = ((performance.now() - finishTime) / 1000).toFixed(2)
	console.log("Archiving took:", tarDuration, "seconds.")
	console.log("Total time:", ((performance.now() - startTime) / 1000).toFixed(2), "seconds.")
})

const startTime = performance.now()

let i = 0
while (scrapeHrefs.size > 0) {
	const href = scrapeHrefs.values().next().value
	if (!href) break

	const { contentType, hrefs, success } = await scrape(href, bmVerify)

	if (!success) {
		console.error("failed ", href)
		console.log("retry in 1s...")
		await sleep(1000)
		continue
	}

	//console.log(`scraped ${href}:`, hrefs)
	hrefs.forEach((newHref) => {
		if (completedHrefs.has(newHref)) return
		scrapeHrefs.add(newHref)
	})

	console.log("scraped", href, contentType, hrefs.length, scrapeHrefs.size)
	i++
	scrapeHrefs.delete(href)
	completedHrefs.add(href)

	await sleep(REQUEST_COOLDOWN_MS)
}

console.log("Received all headers.")
