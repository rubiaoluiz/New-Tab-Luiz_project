const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = 5500; // Use a porta 5500, conforme sua configuração

// Configuração para onde os arquivos serão armazenados (pasta 'imagens' dentro do backend)
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'imagens'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// Middleware para lidar com CORS (permite requisições de diferentes origens - útil durante o desenvolvimento)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Ou especifique seu domínio
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Rota para receber o upload da imagem (POST para /upload)
app.post('/upload', upload.single('wallpaper'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }
    const imageUrl = `/imagens/${req.file.filename}`; // URL para acessar a imagem
    res.json({ imageUrl: imageUrl });
});

// Rota para servir os arquivos da pasta 'imagens' (acessível via /imagens/nome-do-arquivo.jpg)
app.use('/imagens', express.static(path.join(__dirname, 'imagens')));

// **Nova linha para servir a pasta raiz como arquivos estáticos**
app.use('/', express.static(path.join(__dirname, '../'))); // Ajuste o caminho se necessário

// Rota para servir o seu index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html')); // Ajuste o caminho se necessário
});

app.listen(port, () => {
    console.log(`Servidor Node.js rodando na porta ${port}`);
});

// Crie a pasta 'imagens' se ela não existir
const imagensPath = path.join(__dirname, 'imagens');
fs.access(imagensPath)
    .catch(() => fs.mkdir(imagensPath, { recursive: true }));