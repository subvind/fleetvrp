/*
write a node.js script that creates a markdown file named PROMPT.md 
within this .md file we have merged together serveral files
from throughout the codebase and it is formatted in a way that ai
will understand with file names, types, and content.

such as:
- ./cli.js
- ./tests/hello-world.bs
- ./RULES.md
- ./RUN_TESTS.md
- ./EXAMPLE_SYNTAX.md
- ./AI_CALL.md
- ./CURRENT_ERROR.md
- ./TODO.md

this node.js script should be named prompt.js
code should be written in module syntax

be sure default content is set to something like:
// Please follow the instructions within ./TODO.md! Thank you :)\n

that way my main instructions will be place most prominantly...
*/

import fs from 'fs/promises';
import path from 'path';

// List of files to be merged into PROMPT.md
// const filesToMerge = [
//   './src/app.controller.ts',
//   './src/app.module.ts',
//   './src/app.service.ts',
//   './src/main.ts',
//   './views/index.ejs',
//   './CURRENT_ERROR.md',
//   './TODO.md'
// ];

const filesToMerge = [
  // './src/auth/auth.module.ts',
  // './src/auth/cookie.strategy.ts',
  // './src/types/express.d.ts',
  './src/modules/owner/manager.entity.ts',
  './src/modules/owner/manager.service.ts',
  './src/modules/owner/owner.controller.ts',
  './src/modules/owner/owner.module.ts',
  './src/app.controller.ts',
  './src/app.module.ts',
  './src/app.service.ts',
  './src/navigation.ts',
  './src/user.model.ts',
  './src/user.service.ts',
  // './src/auth.service.ts',
  // './src/main.ts',
  // './src/user.model.ts',
  // './views/modules/head.ejs',
  './views/modules/owner/managers/create.ejs',
  './views/modules/owner/managers/edit.ejs',
  './views/modules/owner/managers/index.ejs',
  './views/modules/owner/managers/list.ejs',
  './views/modules/owner/managers/view.ejs',
  './views/modules/owner/index.ejs',
  './CURRENT_ERROR.md',
  './TODO.md'
];

// Helper function to get file extension
const getFileType = (filePath) => {
  return path.extname(filePath).substring(1); // Remove the dot from the extension
};

// Main function to create PROMPT.md
const createPromptFile = async () => {
  let content = 'Please follow the instructions within ./TODO.md! Thank you :)\n';

  for (const file of filesToMerge) {
    try {
      const fileContent = await fs.readFile(file, 'utf8');
      const fileType = getFileType(file);
      content += `### ${file}\n\`\`\`${fileType}\n${fileContent}\n\`\`\`\n\n`;
    } catch (err) {
      console.error(`Error reading file ${file}:`, err);
    }
  }

  try {
    await fs.writeFile('PROMPT.md', content, 'utf8');
    console.log('PROMPT.md has been created successfully.');
  } catch (err) {
    console.error('Error writing PROMPT.md:', err);
  }
};

createPromptFile();
