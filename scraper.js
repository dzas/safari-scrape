const puppeteer = require('puppeteer');

let bookUrl = "https://www.safaribooksonline.com/library/view/programming-aspnet-core/9781509304448/cover.xhtml";
let loginUrl = "https://www.safaribooksonline.com/";

let CREDS = {
    username: "",
    password: ""
}

const USERNAME_SELECTOR = '#id_email';
const PASSWORD_SELECTOR = '#id_password1';
const SIGN_POPUP_SELECTOR = 'a.login.js-login';
const BUTTON_SELECTOR = "button[type='submit']";

const NEXTPAGE_SELECTOR = "a.next.nav-link";

let browser, page;

async function Login() {
    await page.goto(loginUrl);

    await page.click(SIGN_POPUP_SELECTOR);

    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(CREDS.username);

    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(CREDS.password);

    await page.click(BUTTON_SELECTOR);

    await page.waitForNavigation();
}

async function Init() {
    browser = await puppeteer.launch({
        headless: true
    });

    page = await browser.newPage();
}


async function GetNextPage() {
    let a = await page.$eval(NEXTPAGE_SELECTOR, el => el && el.href);
    console.log(a);
    return a;
}

async function ClearPage() {
    let selectorsToRemove = [".sbo-site-nav", ".interface-controls.interface-controls-top", "#js-subscribe-nag", ".sbo-reading-menu", ".sbo-nav-top", "footer"];
    await page.evaluate((selectors) => {
        selectors.forEach((sel) => {
            var elements = document.querySelectorAll(sel);
            elements.forEach((element) => {
                element.parentNode.removeChild(element);
            })
        })
    }, selectorsToRemove);

}

async function SavePageToPdf(pageNumber) {
    await page.emulateMedia('screen');
    let buffer = await page.pdf({
        format: 'A4',
        headerTemplate: "",
        footerTemplate: ""
    });

    // await page.pdf({
    //     path: 'page-' + pageNumber + '.pdf'
    // });
}
async function OpenPage(url) {
    await page.goto(url);
}


(async () => {
    await Init()
    await Login();

    let nextpage = bookUrl;
    let pageNumber = 1;

    while (nextpage) {
        console.log("fetching %i, %s", pageNumber, nextpage);
        await OpenPage(nextpage);
        nextpage = await GetNextPage();

        await ClearPage();
        await SavePageToPdf(pageNumber);

        pageNumber++;
    }
    await browser.close()
})()
