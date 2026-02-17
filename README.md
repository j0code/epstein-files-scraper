# Epstein Files Scraper

Scrapes Epstein Files from www.justice.gov

> [!NOTE]
> For educational purposes only. ;)

## Prerequisites
You need node.js installed to run the code. [Download here](https://nodejs.org/en/download)

## Install
1. Download this repo using `git clone` or using the green "<> Code" button and clicking "Download ZIP" and extracting it.
2. Open a Terminal in directory you downloaded. On most operating systems, you can right click and click on "Open in Terminal" or similar.
3. Run `npm install --include dev` to install dependencies.
4. Compile the code to JavaScript using `tsc`.

## Running the scraper
###### This assumes you already have installed node.js, downloaded, and compiled the code.
1. Open a Terminal in directory you downloaded. On most operating systems, you can right click and click on "Open in Terminal" or similar.
2. Run `node .` and let it run until it exits on its own. This is will take hours.

You can repeat this process as often as you want.
This is useful if a new dataset has been released by the US Department of (In-)Justice or the code updated.

## Where are the files stored?
The latest version is stored in `./files/live`.
You can watch the files pile up in this directory while the scraper is running.

Timestamped versions are available as .tar.gz archives in `./files/archive`.
On Linux and Mac, you can extract .tar.gz archives by double-clicking.
On Windows you will need WinRAR, 7zip, or a similar program. Or using the built-in `tar` command.

## Updates
###### This assumes you already have installed node.js, and downloaded the code.
I will update the code from time to time as the justice.gov website changes, to fix bugs, and to include previously undetected hidden files in the download.

To update your installation, you have to perform different steps depending on your selected download method.

If you downloaded the ZIP:
> Download the ZIP again and install it like you did first time. See [Install](#install).
> If you want, you can delete the old directory or keep it.
> If you delete the old directory, make sure you copy the archives in `./files/archive` so your downloads will not be deleted.

If you cloned the repo:
> 1. Open a Terminal in the directory.
> 2. Run `git pull` to download the latest version
> 3. Run `npm install` to update the dependecies.
> 4. Run `tsc` to compile the code.

After you updated the code, simply re-run the code. See [Running the scraper](#running-the-scraper).

## Contributing
If you want to help development, feel free to open an [Issue](./issues) to:
- report a bug
- raise awareness to changes of the justice.gov website that break the code
- inform of hidden files on the justice.gov website that aren't yet downloaded
- raise any other issue regarding the code

If you want to contribute by code, feel free to fork the repository and open pull requests.

## Licence
This repo is licenced under the GPL-3.0-or-later licence.
