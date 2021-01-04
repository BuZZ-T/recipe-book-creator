const puppeteer = require('puppeteer')
const { readFile, writeFile } = require('fs')
const program = require('commander')
const { promisify } = require('util')
const { join } = require('path')
const packageJson = require('./package.json')

const readFilePromise = promisify(readFile)
const writeFilePromise = promisify(writeFile)

const defaultPapersPerSections = '6'
const defaultSections = '8'

const PRINT_HTML_FILENAME = 'print.html'
const printHtmlPath = join(__dirname, PRINT_HTML_FILENAME)

async function replacePageNumber({ first, second, secondLast, last, hasLastPage }) {
    const printHtmlFile = await readFilePromise(printHtmlPath, 'utf-8')
    const modifiedPrintHtmlFile = printHtmlFile.replace(/const first = '\d+'/, `const first = '${first}'`)
        .replace(/const second = '\d+'/, `const second = '${second}'`)
        .replace(/const secondLast = '\d+'/, `const secondLast = '${secondLast}'`)
        .replace(/const last = '\d+'/, `const last = '${last}'`)
        .replace(/const lastPage = .*/, `const lastPage = ${hasLastPage}`)

    await writeFilePromise(printHtmlPath, modifiedPrintHtmlFile)
}

function parseArgs() {
    program
        .version(packageJson.version, '-v, --version')
        .option('--papers-per-section <papers>', 'How many sheets of papers does one section have?', defaultPapersPerSections)
        .option('--sections <number>', 'How many sections does the book have? A section is a bunch of papers, folded together.', defaultSections)
        .parse(process.argv)

    return {
        papersPerSection: program.papersPerSection,
        sections: program.sections,
    }
}

async function printAll() {

    const config = parseArgs()

    let outputFileCounter = 1
    for (let section = 0; section < config.sections; section++) {

        const lastPageOfSection = (config.papersPerSection * 4)

        const pageStart = section * config.papersPerSection * 4

        for (let page = 1; page < config.papersPerSection * 2; page += 2) {
            const first = page + pageStart
            const second = page + pageStart + 1

            const secondLast = lastPageOfSection - page + pageStart
            const last = lastPageOfSection - page + pageStart + 1

            await replacePageNumber({
                first,
                second,
                secondLast,
                last,
                hasLastPage: section === config.sections - 1 && page === 1
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
