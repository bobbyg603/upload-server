const uploadFile = require("../middleware/upload");
const fs = require("fs/promises");
const baseUrl = "http://localhost:8080/files/";

const upload = async (req, res) => {
  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file?.originalname,
    });
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(400).send({
        message: "File size cannot be larger than 100MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file?.originalname}. ${err}`,
    });
  }
};

const getListFiles = async (req, res) => {
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  try {
    const files = await fs.readdir(directoryPath);
    const fileInfoPromises = files.map(async (file) => {
      const filePath = `${directoryPath}${file}`;
      const stat = await fs.stat(filePath);
      return {
        name: file,
        url: baseUrl + file,
        size: stat.size,
        created: stat.birthtime
      };
    });
    const fileInfos = await Promise.all(fileInfoPromises);

    res.status(200).send(fileInfos);
  } catch(err) {
    res.status(500).send({
      message: "Unable to scan files!",
    });
  }
};

const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

module.exports = {
  upload,
  getListFiles,
  download,
};
