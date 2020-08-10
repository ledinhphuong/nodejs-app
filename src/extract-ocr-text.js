// npm run ocr
//

import BPromise from 'bluebird'
import {recognize} from 'tesseractocr'
import Tesseract from 'tesseract.js'
import cv from 'opencv4nodejs'

const fs = BPromise.promisifyAll(require('fs'))

import {exec, spawn} from 'child_process'
const execAsync = BPromise.promisify(exec, { multiArgs: true })

const FILE = './Meembar-S9.png'
const OUTPUT = '/Users/phuongle/MyProjects/public/nodejs-app/src/'

async function execTesseractByBinary() {
  // tesseract 4.1.1
  // tesseract ./gray.png out -l eng --psm 12 --dpi 72 -c tessedit_create_tsv=1 && cat out.tsv

  // tesseract 4.0.0-beta.1
  // tesseract ./gray.png out --psm 12 -c tessedit_create_tsv=1 && cat out.tsv
  await execAsync(`/usr/local/bin/tesseract ${FILE} out -l eng --psm 12 --dpi 72 -c tessedit_create_tsv=1`)
  await execAsync('cat /Users/phuongle/MyProjects/public/nodejs-app/out.tsv')
}

async function execTesseract(imagePath) {
  return new BPromise((resolve, reject) => {
    let readStream, transform, tesseract
    let stdout = ''
    let stderr = ''

    const destroy = () => {
      readStream && readStream.destroy()
      transform && transform.destroy()
    }

    const onError = () => {
      destroy()
      reject()
    }

    try {
      readStream = fs.createReadStream(imagePath)
      tesseract = spawn(
        'tesseract',
        ['stdin', 'stdout', '-c', 'tessedit_create_tsv=1', '--psm', 12],
        {}
      )

      transform = readStream.pipe(tesseract.stdin)
      readStream && readStream.on('error', onError)
      transform && transform.on('error', onError)

      tesseract.stdout.on('data', (chunk) => stdout += chunk.toString('utf-8'))
      tesseract.stderr.on('data', (chunk) => stderr += chunk.toString('utf-8'))
      tesseract
        .on('error', onError)
        .on('exit', (code) => {
          destroy()

          if (code !== 0) {
            reject()
          }

          resolve({stdout, stderr})
        })
    }
    catch (err) {
      console.log(err)
      onError()
    }
  })
}

function extractText_tesseractjs() {
  console.log(`Recognizing ${FILE}`);

  Tesseract.recognize(FILE, 'eng', {psm: 12})
    .then(({data}) => {
      console.log(JSON.stringify(data));
    });
}

// tesseract /Users/phuongle/MyProjects/public/nodejs-app/gray.png out --psm 12 -c tessedit_create_tsv=1 && cat out.tsv
async function extractText_tessseractorc() {
  try {
    const imageData = await fs.readFileAsync(FILE, 'base64')
    const imageBuffer = Buffer.from(imageData, 'base64')

    const image = await cv.imdecodeAsync(imageBuffer)
    const scaleRatio = 640 / image.sizes[1]
    const scaledImage = await image.rescale(scaleRatio, cv.INTER_AREA)

    const grayImage = await scaledImage.cvtColorAsync(cv.COLOR_BGR2GRAY)
    const grayImageBuffer = await cv.imencodeAsync('.png', grayImage)
    // await fs.writeFileAsync('./gray.png', grayImageBuffer)

    let ocrText = await recognize(grayImageBuffer, { c: 'tessedit_create_tsv=1', psm: 12 })
    return ocrText && ocrText.toString('utf-8').trim()
  }
  catch (err) {
    console.log(err)
    return null
  }
}

function parseTesseractOutput(tesseractOcrOutput) {
  const lines = tesseractOcrOutput.split('\n')
  let data = {
    left: [],
    top: [],
    width: [],
    height: [],
    text: []
  }

  for (let lineCount = 1; lineCount < lines.length - 1; lineCount++) {
    const line = lines[lineCount]
    const params = line.split('\t')
    console.log(JSON.stringify(params))

    data.left.push(parseInt(params[6]))
    data.top.push(parseInt(params[7]))
    data.width.push(parseInt(params[8]))
    data.height.push(parseInt(params[9]))
    data.text.push(params[11])
  }

  if (data.text.length === 0) {
    return null
  }

  return data
}

async function main() {
  try {
    // const text = await execTesseractByBinary()

    // const {stdout, stderr} = await execTesseract(FILE)
    // // console.log(`tesseract stdout: ${stdout}`)
    // console.log(`tesseract stderr: ${stderr}`)
    // const output = parseTesseractOutput(stdout)
    // console.log(JSON.stringify(output))

    let result = await extractText_tessseractorc()
    result = parseTesseractOutput(result)
    console.log(JSON.stringify(result))
  }
  catch(err) {
    console.log(err)
  }
}

main()
