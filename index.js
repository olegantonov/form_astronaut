// index.js
const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure o Cloud Storage
const storageClient = new Storage();
const bucketName = 'formsastronauts-uploads';

// Configure o multer para armazenar arquivos na memória
const upload = multer({ storage: multer.memoryStorage() });

// Serve o formulário estático (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para receber o formulário com arquivos
app.post('/upload', upload.fields([
  { name: 'photo1' }, { name: 'photo2' }, { name: 'photo3' }, { name: 'photo4' }, { name: 'photo5' },
  { name: 'audioFile1' }, { name: 'audioFile2' }, { name: 'audioFile3' }, { name: 'audioFile4' }, { name: 'audioFile5' }
]), async (req, res) => {
  try {
    // Dados textuais do formulário
    const fullName = req.body.fullName || 'Unknown';
    const nationality = req.body.nationality || '';
    const contactEmail = req.body.contactEmail || '';
    const phoneNumber = req.body.phoneNumber || '';
    const currentOccupation = req.body.currentOccupation || '';
    
    // Informações adicionais (ex.: legendas e músicas para as fotos)
    const photo1Caption = req.body.photo1Caption || '';
    const photo1Music = req.body.photo1Music || '';
    const photo2Caption = req.body.photo2Caption || '';
    const photo2Music = req.body.photo2Music || '';
    const photo3Caption = req.body.photo3Caption || '';
    const photo3Music = req.body.photo3Music || '';
    const photo4Caption = req.body.photo4Caption || '';
    const photo4Music = req.body.photo4Music || '';
    const photo5Caption = req.body.photo5Caption || '';
    const photo5Music = req.body.photo5Music || '';
    
    // Dados de áudio
    const composer1 = req.body.composer1 || '';
    const musicLink1 = req.body.musicLink1 || '';
    const composer2 = req.body.composer2 || '';
    const musicLink2 = req.body.musicLink2 || '';
    const composer3 = req.body.composer3 || '';
    const musicLink3 = req.body.musicLink3 || '';
    const composer4 = req.body.composer4 || '';
    const musicLink4 = req.body.musicLink4 || '';
    const composer5 = req.body.composer5 || '';
    const musicLink5 = req.body.musicLink5 || '';
    
    const feedback = req.body.feedback || '';
    const whatsapp = req.body.whatsapp || '';
    const privacyPolicy = req.body.privacyPolicy || '';
    
    if (!fullName || !contactEmail || privacyPolicy !== 'accepted') {
      return res.status(400).send('Please fill in all required fields and accept the Privacy Policy.');
    }
    
    // Função auxiliar para salvar arquivos no bucket e retornar a URL
    async function saveFile(file, prefix) {
      if (!file) return "";
      const originalName = file.originalname;
      const timestamp = Date.now();
      const standardizedName = `${prefix}_${originalName.replace(/ /g, "_")}_${timestamp}`;
      const bucket = storageClient.bucket(bucketName);
      const blob = bucket.file(standardizedName);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });
      
      await new Promise((resolve, reject) => {
        blobStream.on('finish', resolve);
        blobStream.on('error', reject);
        blobStream.end(file.buffer);
      });
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(standardizedName)}`;
      return publicUrl;
    }
    
    // Processa uploads de fotos
    const files = req.files;
    const photo1Url = files.photo1 ? await saveFile(files.photo1[0], 'Photo1') : "";
    const photo2Url = files.photo2 ? await saveFile(files.photo2[0], 'Photo2') : "";
    const photo3Url = files.photo3 ? await saveFile(files.photo3[0], 'Photo3') : "";
    const photo4Url = files.photo4 ? await saveFile(files.photo4[0], 'Photo4') : "";
    const photo5Url = files.photo5 ? await saveFile(files.photo5[0], 'Photo5') : "";
    
    // Processa uploads de áudio
    const audioFile1Url = files.audioFile1 ? await saveFile(files.audioFile1[0], 'Audio1') : "";
    const audioFile2Url = files.audioFile2 ? await saveFile(files.audioFile2[0], 'Audio2') : "";
    const audioFile3Url = files.audioFile3 ? await saveFile(files.audioFile3[0], 'Audio3') : "";
    const audioFile4Url = files.audioFile4 ? await saveFile(files.audioFile4[0], 'Audio4') : "";
    const audioFile5Url = files.audioFile5 ? await saveFile(files.audioFile5[0], 'Audio5') : "";
    
    // Aqui, você pode armazenar os dados em um banco de dados ou planilha.
    // Neste exemplo, vamos retornar um JSON com os dados recebidos.
    const responseData = {
      personalData: { fullName, nationality, contactEmail, phoneNumber, currentOccupation },
      photos: [
        { url: photo1Url, caption: photo1Caption, music: photo1Music },
        { url: photo2Url, caption: photo2Caption, music: photo2Music },
        { url: photo3Url, caption: photo3Caption, music: photo3Music },
        { url: photo4Url, caption: photo4Caption, music: photo4Music },
        { url: photo5Url, caption: photo5Caption, music: photo5Music }
      ],
      audios: [
        { url: audioFile1Url, composer: composer1, musicLink: musicLink1 },
        { url: audioFile2Url, composer: composer2, musicLink: musicLink2 },
        { url: audioFile3Url, composer: composer3, musicLink: musicLink3 },
        { url: audioFile4Url, composer: composer4, musicLink: musicLink4 },
        { url: audioFile5Url, composer: composer5, musicLink: musicLink5 }
      ],
      feedback,
      whatsapp,
      privacyPolicy,
      timestamp: new Date().toISOString()
    };
    
    Logger.log("Upload realizado com sucesso: " + JSON.stringify(responseData));
    res.status(200).json({
      message: "Upload successful",
      data: responseData
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ error: error.toString() });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

// Para o Cloud Run, exporte o app
module.exports = app;
