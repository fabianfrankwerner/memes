// memeOrganizer.ts
import fs from 'fs/promises';
import path from 'path';

interface MemeInfo {
  originalName: string;
  newName: string;
  dateAdded: Date;
}

async function organizeMemes() {
  const MEMES_DIR = './memes';
  const README_PATH = './README.md';

  try {
    // Read all files in the memes directory
    const files = await fs.readdir(MEMES_DIR);

    // Filter for image files and get their stats
    const memeFiles = await Promise.all(
      files
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(async file => {
          const stats = await fs.stat(path.join(MEMES_DIR, file));
          return {
            originalName: file,
            newName: '',
            dateAdded: stats.birthtime
          } as MemeInfo;
        })
    );

    // Sort by date added (newest first)
    memeFiles.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());

    // Generate new names and rename files
    for (let i = 0; i < memeFiles.length; i++) {
      const file = memeFiles[i];
      const ext = path.extname(file.originalName);
      const newName = `meme-${i + 1}${ext}`;
      file.newName = newName;

      // Rename the file
      const oldPath = path.join(MEMES_DIR, file.originalName);
      const newPath = path.join(MEMES_DIR, newName);

      if (file.originalName !== newName) {
        await fs.rename(oldPath, newPath);
      }
    }

    // Generate README content
    const readmeContent = `# Meme Collection

A collection of ${memeFiles.length} memes, sorted from newest to oldest.

## Memes

${memeFiles
  .map(
    file => `![Meme](memes/${file.newName})`
  )
  .join('\n\n')}

## How to Contribute

1. Clone this repository
2. Add your memes to the \`memes\` directory
3. Run \`npm start\` to organize memes and update README
4. Commit and push your changes

## License

This repository is for educational and entertainment purposes only.
All images may be subject to copyright by their respective owners.
`;

    // Write README
    await fs.writeFile(README_PATH, readmeContent);

    console.log(`✅ Successfully organized ${memeFiles.length} memes!`);

  } catch (error) {
    console.error('Error organizing memes:', error);
  }
}

organizeMemes().catch(console.error);
