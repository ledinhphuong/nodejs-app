#!/bin/bash

os_name=$(node -e "console.log(process.platform)")

opencv4nodejsDir="$HOME/.cache/opencv4nodejs"
opencv4nodejsFile="opencv4nodejs-4.13.0-nodev8.10.0.tar.bz2"

if [ "$os_name" = "darwin" ]; then
  opencv4nodejsFile="opencv4nodejs-4.13.0-nodev8.11.4.tar.bz2"
fi

downloadedFile="$opencv4nodejsDir/$opencv4nodejsFile"

if [ -e "$downloadedFile" ]; then
  echo "Cache $opencv4nodejsFile file exists"
else
  echo "Cache $opencv4nodejsFile file not exists, downloading a new one..."

  # This command just create the target directory if not exists (-p param)
  mkdir -p $opencv4nodejsDir

  echo "Downloading https://kobiton-devvn.s3.amazonaws.com/downloads/$opencv4nodejsFile file"
  curl -o $downloadedFile https://kobiton-devvn.s3.amazonaws.com/downloads/$opencv4nodejsFile
fi

echo "Extracting $opencv4nodejsFile ..."
tar -jxf $downloadedFile -C node_modules/
