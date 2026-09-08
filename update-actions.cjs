const fs = require('fs');
let css = fs.readFileSync('src/styles/globals.css', 'utf8');

css = css.replace(
  /\.col-actions {\n  width: 100px;\n  text-align: right;\n  padding-right: 16px !important;\n}/,
  `.col-actions {\n  width: 100px;\n  min-width: 100px;\n  white-space: nowrap;\n  text-align: right;\n  padding-right: 16px !important;\n}`
);
fs.writeFileSync('src/styles/globals.css', css);
