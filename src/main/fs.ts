import * as fs from 'node:fs';
import * as path from 'node:path';
import { ImgObject } from '../common/imgObject';
import { fileTypeFromBuffer, type MimeType } from 'file-type';
import { log } from '../common/share/logs';

// TODO: add callback for vue app show warning for failure
export const readDirectory = async (localPath: string[], allow_mine: MimeType[]): Promise<ImgObject[]> => {
  log.debug(allow_mine);
  const filePromises: Promise<ImgObject[]>[] = [];
  for (const singlePath of localPath) {
    const stats = await fs.promises.stat(singlePath);
    if (stats.isDirectory()) {
      const entries = await fs.promises.readdir(singlePath, { withFileTypes: true });
      const dirPaths = entries.map((entry: fs.Dirent) => path.join(singlePath, entry.name));
      filePromises.push(readDirectory(dirPaths, allow_mine));
    } else {
      const content = await fs.promises.readFile(singlePath);
      const type = await fileTypeFromBuffer(content);
      if (type?.mime && allow_mine.includes(type?.mime)) {
        filePromises.push(
          Promise.resolve([
            new ImgObject(
              path.basename(singlePath),
              path.extname(singlePath).substring(1),
              new Uint8Array(content).buffer,
              singlePath
            )
          ])
        );
      } else {
        log.debug('File type not allowed:', JSON.stringify(type), singlePath, allow_mine);
      }
    }
  }
  const filesArrays = await Promise.all(filePromises);
  return filesArrays.flat();
};
