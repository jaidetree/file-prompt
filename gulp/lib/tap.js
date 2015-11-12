import through2 from 'through2';

export default (callback, context) => {
  return through2.obj((file, enc, next) => {
    callback.call(context || this, file);
    next(null, file);
  });
};
