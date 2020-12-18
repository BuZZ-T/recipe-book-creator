const puppeteer = require('puppeteer')

async function printPDF() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--disable-web-security', '--user-data-dir=chrome-user']
    });
    const page = await browser.newPage();
    await page.goto(`file://${__dirname}/wein2.html`, { waitUntil: 'networkidle0' });
    
    await page.pdf({
        format: 'A4',
        path: `${__dirname}/wein-test.pdf`,
        landscape: true,
    })
    
    // close the browser
    await browser.close()
}

printPDF().then(() => {
    console.log('finished')
})
