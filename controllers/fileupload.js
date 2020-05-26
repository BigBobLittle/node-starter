
const skipTryCatch = require('@bigboblittle/skiptrycatch').skipTryCatch;

exports.saveImage = skipTryCatch(async(req,res) => {
  res.send(req.file);
})

