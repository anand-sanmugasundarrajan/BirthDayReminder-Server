
// Read the `url` from request, goto the page, extract title and return the results

module.exports.selenium = async (request, response, driver) => {
    await driver.get('https://catalyst.zoho.com');
    const pageTitle = await driver.getTitle();
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify({ output: pageTitle }));
    response.end();
};
