// Server lokal untuk development: npm run dev
import app from './api/_app.js';

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API siap di http://localhost:${PORT}`));
