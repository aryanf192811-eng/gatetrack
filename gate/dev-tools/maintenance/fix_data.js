const fs = require('fs');
const path = require('path');
const dataFile = path.join(__dirname, '..', '..', 'data', 'data.js');

try {
  let fileData = fs.readFileSync(dataFile, 'utf8');

  // Find the point where the regex injection broke.
  // The injection added `};` at the end of the new map, but because
  // the original string had `...};"`, the file now contains `};"`
  const badStartToken = '};"\r\n    },\r\n    {\r\n      "q"'; // Check for CRLF
  const badStartTokenLF = '};"\n    },\n    {\n      "q"';

  let splitIndex = fileData.indexOf(badStartToken);
  if (splitIndex === -1) {
    splitIndex = fileData.indexOf(badStartTokenLF);
  }

  // Find the true end of the old block (which stops before RC=...)
  const targetEndToken = '\r\n// ═══ REVISION CONTENT DATA ═══';
  const targetEndTokenLF = '\n// ═══ REVISION CONTENT DATA ═══';

  let endIndex = fileData.indexOf(targetEndToken, splitIndex);
  if (endIndex === -1) {
      endIndex = fileData.indexOf(targetEndTokenLF, splitIndex);
  }

  if (splitIndex !== -1 && endIndex !== -1) {
    // Keep everything up to the broken `;""`
    let before = fileData.substring(0, splitIndex + 2); // keeps the `};`
    let after = fileData.substring(endIndex); // Keeps the newline and the RC= comment onwards

    fs.writeFileSync(dataFile, before + after);
    console.log('Successfully repaired data.js!');
  } else {
    console.log('Could not find the start/end markers!');
    console.log('badStartToken found:', splitIndex !== -1);
    console.log('endIndex found:', endIndex !== -1);
  }
} catch (e) {
  console.error('Error during repair:', e);
}
