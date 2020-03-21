// npm run ocr
//

import BPromise from 'bluebird'
import {recognize} from 'tesseractocr'
import Tesseract from 'tesseract.js'
import {createReadStream} from 'fs'

import {exec, spawn} from 'child_process'
const execAsync = BPromise.promisify(exec, { multiArgs: true })

// const FILE = '/Users/phuongdle/MyProjects/public/nodejs-app/src/crop.jpg'
const FILE = '/Users/phuongdle/MyProjects/public/nodejs-app/src/crop.jpg'
const OUTPUT = '/Users/phuongdle/MyProjects/public/nodejs-app/src/'

async function execTesseract(imagePath) {
  // await execAsync(`/usr/local/bin/tesseract ${FILE} out -l eng --psm 12 tsv`)

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
      readStream = createReadStream(imagePath)
      tesseract = spawn(
        'tesseract',
        // ['stdin', 'stdout', '--psm', 12, 'box', 'makebox'],
        ['stdin', 'stdout', '--psm', 12, 'tsv'],
        {}
      )

      transform = readStream.pipe(tesseract.stdin)
      readStream && readStream.on('error', onError)
      transform && transform.on('error', onError)

      tesseract.stdout.on('data', (chunk) => stdout += chunk)
      tesseract.stderr.on('data', (chunk) => stderr += chunk)
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

async function extractText_tessseractorc() {
  try {
    // tesseract /Users/phuongdle/MyProjects/public/nodejs-app/src/crop.jpg ./output -l eng --psm 12 'tsv' && cat output.tsv
    let ocrText = await recognize(FILE)
    // ocrText = ocrText.toLowerCase().trim().replace(/\s\s+/g, ' ')
    return ocrText && ocrText.trim()
  }
  catch (err) {
    console.log(err)
    return null
  }
}

async function main() {
  try {
    // const text = await extractText()
    const {stdout, stderr} = await execTesseract(FILE)

    console.log(`tesseract stdout: ${stdout}`)

    const line = /(d+)\s(d+)/

    // console.log(`tesseract stderr: ${stderr}`)
    const lines = stdout.split('\n')
    // console.log(JSON.stringify(lines))
  }
  catch(err) {
    console.log(err)
  }

}

main()
// extractText_js()
