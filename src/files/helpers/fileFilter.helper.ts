export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error, acceptFile: boolean) => void,
) => {
  if (!file) return callback(new Error('file is EMpty'), false);
  const fileExtention = file.mimetype.split('/')[1];
  const validExtention = ['jpeg', 'jpg', 'png', 'gif'];
  if (validExtention.includes(fileExtention)) {
    return callback(null, true);
  }
  console.log(file);
  callback(null, false);
};
