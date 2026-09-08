const fs = require('fs');

// Read globals.css
let css = fs.readFileSync('src/styles/globals.css', 'utf8');

// Add anti-aliasing to body
css = css.replace('body {', 'body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;');

// Reduce heavy font weights in CSS
css = css.replace(/font-weight:\s*800/g, 'font-weight: 600');
css = css.replace(/font-weight:\s*760/g, 'font-weight: 600');
css = css.replace(/font-weight:\s*750/g, 'font-weight: 500');
css = css.replace(/font-weight:\s*730/g, 'font-weight: 600');
css = css.replace(/font-weight:\s*720/g, 'font-weight: 600');
css = css.replace(/font-weight:\s*700/g, 'font-weight: 600');
css = css.replace(/font-weight:\s*680/g, 'font-weight: 500');
css = css.replace(/font-weight:\s*670/g, 'font-weight: 500');
css = css.replace(/font-weight:\s*650/g, 'font-weight: 500');
css = css.replace(/font-weight:\s*640/g, 'font-weight: 500');
css = css.replace(/font-weight:\s*620/g, 'font-weight: 500');
css = css.replace(/font-weight:\s*550/g, 'font-weight: 400');
css = css.replace(/font-weight:\s*500/g, 'font-weight: 400'); // Make base semibold lighter if we want

fs.writeFileSync('src/styles/globals.css', css);

// Now search for all inline style fontWeights in all tsx files and reduce them
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // We want to reduce inline fontWeights
    // fontWeight: 700 -> 600
    // fontWeight: 600 -> 500
    // fontWeight: 500 -> 400
    
    if (content.includes('fontWeight: 700')) {
      content = content.replace(/fontWeight:\s*700/g, 'fontWeight: 500');
      changed = true;
    }
    if (content.includes('fontWeight: 600')) {
      content = content.replace(/fontWeight:\s*600/g, 'fontWeight: 500');
      changed = true;
    }
    if (content.includes('fontWeight: 500')) {
      content = content.replace(/fontWeight:\s*500/g, 'fontWeight: 400');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
    }
  }
});
