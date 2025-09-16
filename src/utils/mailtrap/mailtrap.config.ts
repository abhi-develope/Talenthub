import { MailtrapClient } from "mailtrap";
import * as dotenv from "dotenv";
dotenv.config();  

const TOKEN = process.env.MAILTRAP_TOKEN;
// console.log(TOKEN);

if (!TOKEN) {
  throw new Error('MAILTRAP_TOKEN environment variable is required');
}

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email:"mailtrap@demomailtrap.com",
  name: "Mailtrap Test",
};


