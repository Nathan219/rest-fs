// fsDriver
// use fs engine to server files
var fs = require('fs');
var findit = require('findit');
var path = require('path');
var mv = require('mv');
var rm = require('rimraf');

var listAll = function(reqDir, onlyDir, cb) {
/* returns array of files and dir in format :
[
  {
    name: base,
    path: path.dirname(file),
    dir: false
  },
  ...
]
*/
  var finder = findit(reqDir);
  var files = [];

  finder.on('directory', function (dir, stat, stop) {
    files.push({
      name: path.basename(dir),
      path: path.dirname(dir),
      dir: true
    });
  });

  if (!onlyDir) {
    finder.on('file', function (file, stat) {
      files.push({
        name: path.basename(file),
        path: path.dirname(file),
        dir: false
      });
    });
  }

  finder.on('end', function () {
    cb(null, files);
  });
};

var list = function(reqDir, cb) {
/* returns array of files and dir in format :
[
  {
    name: base, // file or dir name
    path: path.dirname(file), // path to file
    dir: false
  },
  ...
]
*/
  var filesList = [];
  var cnt = 0;
  fs.readdir(reqDir, function (err, files) {
    if (err) {
      return cb(err);
    }
    if (files.length === 0) {
      return cb(null, []);
    }
    var formatFileList = function(index) {
      return function (err, stat) {
        if (err) {
          cb(err);
          return;
        }
        filesList.push({
          name: files[index],
          path: reqDir,
          isDir: stat.isDirectory()
        });
        cnt++;
        if (cnt === files.length) {
          return cb(null, filesList);
        }
      };
    };
    for (var i = 0; i < files.length; i++) {
      fs.stat(path.join(reqDir, files[i]), formatFileList(i));
    }
  });
};

/*
  read file from filepath
*/
var readFile = function(filePath, encoding, cb) { 
  fs.readFile(filePath, encoding, cb);
};

/*
  mkdir
*/
var mkdir = function(dirPath, mode, cb)  {
  fs.mkdir(dirPath, mode, cb);
};

/*
  rename
*/
var rename = function(oldPath, newPath, cb)  {
  fs.rename(oldPath, newPath, cb);
};

/*
  delete directory
*/
var rmdir = function(dirPath, cb)  {
  fs.rmdir(dirPath, cb);
};

/*
  writeFile
*/
var writeFile = function(filename, data, options, cb)  {
  fs.writeFile(filename, data, options, cb);
};

/*
  delete file
*/
var unlink = function(filename, cb)  {
  fs.unlink(filename, cb);
};

/*
  move file
*/
var move = function (oldPath, newPath, opts, cb) {
  // have to remove trailing slaches
  if(oldPath.substr(-1) == '/') {
        oldPath = oldPath.substr(0, oldPath.length - 1);
  }
  if(newPath.substr(-1) == '/') {
        newPath = newPath.substr(0, newPath.length - 1);
  }

  // also work around bug for clobber in dir
  if (opts.clobber) {
    rm(newPath, function(err) {
      if (err) {
        return cb(err);
      }
      return mv(oldPath, newPath, opts, cb);
    });
  } else {
    return mv(oldPath, newPath, opts, cb);
  }
};

module.exports.listAll = listAll;
module.exports.list = list;
module.exports.readFile = readFile;
module.exports.mkdir = mkdir;
module.exports.rename = rename;
module.exports.rmdir = rmdir;
module.exports.writeFile = writeFile;
module.exports.unlink = unlink;
module.exports.move = move;