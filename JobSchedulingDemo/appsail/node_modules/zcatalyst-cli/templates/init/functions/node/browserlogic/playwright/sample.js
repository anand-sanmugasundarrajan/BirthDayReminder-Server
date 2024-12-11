
// Read the `url` from request, goto the page, extract title and return the results

module.exports.playwright = async (request, response, page) => {
    await page.goto('https://catalyst.zoho.com');
    const pageTitle = await page.title();
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify({ output: pageTitle }));
    response.end();
};
