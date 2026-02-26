
import * as fs from 'fs';
import * as path from 'path';

export const useFileUtils = () => {

/**
 * Interface for our recursive folder structure.
 */
interface FolderStructure {
  name: string;
  files: (string | FolderStructure)[];
}

/**
 * Recursively reads a directory and returns its contents as a JSON object.
 * @param dirPath - The absolute or relative path to the folder.
 * @returns A FolderStructure object.
 */
function getFolderContents(dirPath: string): FolderStructure {
  const folderName = path.basename(dirPath);
  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  const files = items.map((item) => {
    const fullPath = path.join(dirPath, item.name);
    
    // If it's a directory, recurse; otherwise, return the filename.
    if (item.isDirectory()) {
      return getFolderContents(fullPath);
    } else {
      return item.name;
    }
  });

  return {
    name: folderName,
    files: files
  };
}

return {getFolderContents}

// --- Usage ---
const targetFolder = './your-folder-path'; // Update this to your folder
const result = getFolderContents(targetFolder);

console.log(JSON.stringify(result, null, 2));

}