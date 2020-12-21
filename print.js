const puppeteer = require('puppeteer')
const { readFile, writeFile } = require('fs')
const program = require('commander')
const { promisify } = require('util')
const { join } = require('path')
const packageJson = require('./package.json')

const readFilePromise = promisify(readFile)
const writeFilePromise = promisify(writeFile)

const defaultPapersPerQuire = 6
const defaultAmountOfQuires = 8

const PRINT_HTML_FILENAME = 'print.html'
const printHtmlPath = join(__dirname, PRINT_HTML_FILENAME)

async function replacePageNumber({ first, second, secondLast, last }) {
    const printHtmlFile = await readFilePromise(printHtmlPath, 'utf-8')
    const modifiedPrintHtmlFile = printHtmlFile.replace(/const first = '\d+'/, `const first = '${first}'`)
        .replace(/const second = '\d+'/, `const second = '${second}'`)
        .replace(/const secondLast = '\d+'/, `const secondLast = '${secondLast}'`)
        .replace(/const last = '\d+'/, `const last = '${last}'`)

    await writeFilePromise(printHtmlPath, modifiedPrintHtmlFile)
}

function parseArgs() {
    program
        .version(packageJson.version, '-v, --version')
        .option('--papers-per-quire <papers>', 'How many sheets of papers does one quire have?', '6')
        .option('--quires <quire>', 'How many quires does the book have?', '8')
        .parse(process.argv)

    return {
        papersPerQuire: program.papersPerQuire,
        amountOfQuires: program.quires,
    }
}

async function printAll() {

    const config = parseArgs()

    let outputFileCounter = 1
    for (let quire = 0; quire < config.amountOfQuires; quire++) {

        const lastPageOfQuire = (config.papersPerQuire * 4)

        const pageStart = quire * config.papersPerQuire * 4

        for (let page = 1; page < config.papersPerQuire * 2; page += 2) {
            const first = page + pageStart
            const second = page + pageStart + 1

            const secondLast = lastPageOfQuire - page + pageStart
            const last = lastPageOfQuire - page + pageStart + 1

            await replacePageNumber({
                first,
                second,
                secondLast,
                last,
            })
            await printPage(outputFileCounter)
            outputFileCounter++
        }
    }
}

async function printPage(pageNumber) {
    console.log(`print page ${pageNumber}`)
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--disable-web-security', '--user-data-dir=chrome-user']
    });
    const page = await browser.newPage();
    await page.goto(`file://${printHtmlPath}`, { waitUntil: 'networkidle0' });

    await page.pdf({
        format: 'A4',
        path: `${__dirname}/output-${pageNumber.toString().padStart(2, '0')}.pdf`,
        landscape: true,
        displayHeaderFooter: false,
        printBackground: true,
    })

    await browser.close()
    console.log(`page ${pageNumber} successfully printed!`)
}

printAll()
