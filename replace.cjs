const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/Devendra/Desktop/SIH/src/components';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('setActivePage')) {
        let changed = false;
        
        // Ensure useNavigate is imported
        if (!content.includes('useNavigate')) {
            content = "import { useNavigate } from 'react-router-dom';\n" + content;
            changed = true;
        }

        // Add navigate instance if missing inside the component function
        // Find the main component function signature
        const funcMatch = content.match(/export default function ([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{/);
        if (funcMatch && !content.includes('const navigate = useNavigate()')) {
            content = content.replace(funcMatch[0], funcMatch[0] + "\n  const navigate = useNavigate();");
            changed = true;
        }

        // Remove setActivePage from props
        if (content.match(/\{\s*setActivePage\s*,?/)) {
            content = content.replace(/\{\s*setActivePage\s*,?\s*/, '{ ');
            changed = true;
        } else if (content.match(/,\s*setActivePage\b/)) {
            content = content.replace(/,\s*setActivePage\b/, '');
            changed = true;
        }

        // Replace setActivePage('route') with navigate('/route') or navigate('/') for landing
        if (content.includes('setActivePage')) {
            content = content.replace(/setActivePage\('([^']+)'\)/g, (match, route) => {
                if (route === 'landing') return "navigate('/')";
                return 
avigate('/ + route + ');
            });
            content = content.replace(/setActivePage/g, 'navigate'); // fallback for prop passing
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(file, content);
            console.log('Updated', file);
        }
    }
});
