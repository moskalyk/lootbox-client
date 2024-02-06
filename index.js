import express from 'express'
import path, {dirname} from 'path'
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 8080; // You can choose the port

const __filename = fileURLToPath(import.meta.url);

// Get the directory name of the current module
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
