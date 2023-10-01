const express = require('express'); // Express.js web framework, create http server
const multer = require('multer');   // multer middleware used for file upload handling
const path = require('path');       // built in Node.js module helps with working with file paths
const fs = require('fs');           //  module for interacting with file system

// create an express application
var app = express();
const port = 3000;

// define a object for fonts
var fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  }
};

// Creat PDFMake Object to create PDF
var PdfPrinter = require('pdfmake');
var printer = new PdfPrinter(fonts)

// configure multer storage
const storage = multer.diskStorage({ // configure multer middleware using diskStorage, specifies how files should be stored on the server
  destination: (req, file, callback) => {
    callback(null, 'uploads/'); // Save uploaded files in the 'uploads' directory
  },
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    // This function determines the name of the saved file, get the custom file name from the form input (if provided)
    let customFileName = req.body.imageName || 'untitled';

    // Remove any file extension (if it exists) from the customFileName
    customFileName = path.parse(customFileName).name;

    // Append the original file extension to the customFileName
    customFileName += ext;

    callback(null, customFileName);
  },
});

const upload = multer({ storage }); //create an instance of multer
// This instance (upload) is used to handle file uploads in the routes

// define a route for the URL, used to get the data
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// use post to define a route for the image to be saved
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  return res.send('File uploaded successfully.');
});

app.listen(port, () => { // start the Express.js server and have it listen on port 3000
  console.log(`Server is running on http://localhost:${port}`);
});

// function to create a PDF document 
function CreatePDF(filename) {
  // define the fonts
  var fonts = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
  };
  // Create PDF Document Contents, set parameters
  var docDefinition = {
    content: [
      {
        fontSize: 11,
        defaultStyle: {
          font: 'Roboto'
        },
        table: {
          widths: ['50%', '50%'],
          body: [
            [{ text: filename, border: [false, false, false, true], margin: [-5, 0, 0, 10] }]
          ]
        }
      }
    ]
  };

  // Create PDF using PDFMake, create document pdf file
  var pdfDoc = printer.createPdfKitDocument(docDefinition, null, fonts);
  pdfDoc.pipe(fs.createWriteStream('document.pdf'));
  pdfDoc.end();
};

async function start() {
  // Imports the Google Cloud client library and PDF Library
  const vision = require('@google-cloud/vision');
  var PdfPrinter = require('pdfmake')
  var printer = new PdfPrinter()
  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  fileName = './uploads/test.png'
  // Read a local image as a text document
  const [result] = await client.documentTextDetection(fileName);

  const fullTextAnnotation = result.fullTextAnnotation;
  console.log(`Full text: ${fullTextAnnotation.text}`);
  fullTextAnnotation.pages.forEach(page => {
    page.blocks.forEach(block => {
      console.log(`Block confidence: ${block.confidence}`);
      block.paragraphs.forEach(paragraph => {
        console.log(`Paragraph confidence: ${paragraph.confidence}`);
        paragraph.words.forEach(word => {
          const wordText = word.symbols.map(s => s.text).join('');
          console.log(`Word text: ${wordText}`);
          console.log(`Word confidence: ${word.confidence}`);
          word.symbols.forEach(symbol => {
            console.log(`Symbol text: ${symbol.text}`);
            console.log(`Symbol confidence: ${symbol.confidence}`);
          });
        });
      });
    });
  });

  // Resolve Promise, access text generated through Google Vision
  promise1 = Promise.resolve(result);
  var PDFText = result.fullTextAnnotation.text;
  console.log(PDFText);
  CreatePDF(PDFText); // create a PDF file from the extracted text
}

start(); // start the application
console.log('PDF Created')