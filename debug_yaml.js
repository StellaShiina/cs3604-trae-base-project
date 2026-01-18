const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const projectRoot = "c:\\Users\\16420\\Desktop\\projects\\CS3604\\final-reproduce\\reproduce-try";
const reqPath = path.join(projectRoot, 'requirement', 'requirements.yaml');

console.log(`Checking path: ${reqPath}`);
if (fs.existsSync(reqPath)) {
    console.log("File exists.");
    try {
        const content = fs.readFileSync(reqPath, 'utf8');
        const data = yaml.load(content);
        console.log("YAML loaded successfully.");
        console.log("Keys:", Object.keys(data));
    } catch (e) {
        console.error("YAML load failed:", e);
    }
} else {
    console.log("File does NOT exist.");
}
