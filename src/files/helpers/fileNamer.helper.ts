import { v4 as uuid } from 'uuid';
export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error, filename: string) => void,
) => {
  if (!file) return callback(new Error('file is EMpty'), '');
  const fileExtention = file.mimetype.split('/')[1];
  //   const fileName = `${file.originalname}.${fileExtention}`;
  const fileName = `${uuid()}.${fileExtention}`;

  callback(null, fileName);
};
