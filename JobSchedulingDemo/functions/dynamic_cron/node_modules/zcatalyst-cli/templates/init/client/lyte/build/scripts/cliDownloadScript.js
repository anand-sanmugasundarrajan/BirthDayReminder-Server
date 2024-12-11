var production = process.env.production
if(!production)  {
    var execSync = require("child_process").execSync;
    var registry = "http://integ-docker:4873";
    var path = require("path");
    var fs = require("fs");
    var packageJSONPath = path.join(process.cwd(),"package.json");
    var packageJSONContent = JSON.parse(fs.readFileSync(packageJSONPath,'utf-8'));
    var version = packageJSONContent["lyte-cli"];
    console.log("Installing the lyte-cli");
    var installTheVersion = function(folderToCreate,version)  {
        var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
        var globalCliLocation = path.join(homeDir,'.lyte',"lyte-cli@"+folderToCreate);
        var globalCliLocationNodeModules = path.join(globalCliLocation,"node_modules");
        fs.mkdirSync(globalCliLocation,{recursive : true});
        if(!fs.existsSync(globalCliLocationNodeModules)) {
            try {
                var str = execSync('cd '+globalCliLocation+' && npm install lyte-cli@'+version+' --registry='+registry+" --puppeteer_skip_chromium_download=true");
                console.log(str.toString());
            } catch(e) {
                console.log(e.message);
                process.exit(2);
            }
        }
        var resolution = packageJSONContent.resolution || {};
        resolution["lyte-cli"] = version;
        packageJSONContent.resolution = resolution;
        fs.writeFileSync(packageJSONPath,JSON.stringify(packageJSONContent,null,' '));
        console.log("\x1b[32mLyte-cli found in the location "+globalCliLocation+'\x1b[0m');
    }
    if(version) {
        let folderToCreate;
        if(version.indexOf("http") != -1) {
            folderToCreate = version.split(path.sep).pop();
            installTheVersion(folderToCreate,version);
        } else {
            let lyteCliVersion;
            var allVersions = execSync('npm view lyte-cli@'+version+'  version --json --registry='+registry).toString().trim();
            if(allVersions.length) {
                array = JSON.parse(allVersions);
                if(Array.isArray(array)) {
                    lyteCliVersion = array.pop().trim()
                } else {
                    lyteCliVersion = array.trim();
                }
                lyteCliVersion = lyteCliVersion.replace(/V|v/g,'');
                installTheVersion(lyteCliVersion,lyteCliVersion);
            } else {
                console.log("\x1b[31mNot an valid version for lyte-cli\x1b[0m");
                process.exit(2);
            }
        }
    }
}