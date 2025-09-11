import "dotenv/config"; // Carrega o .env primeiro
import { app } from "./server";

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🔥 Server is running on http://localhost:${PORT}`);
});
