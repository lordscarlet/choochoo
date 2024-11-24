
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { environment } from "./environment";

const algorithm = 'aes-256-gcm';
const key = Buffer.from(environment.cryptoSecret);

const ivLength = 12;
const authTagLength = 16;

export function encrypt(message: string): string {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(
    algorithm, key, iv,
    { authTagLength });
  let encryptedMessage = cipher.update(Buffer.from(message, 'utf8'));
  return Buffer.concat([iv, encryptedMessage, cipher.final(), cipher.getAuthTag()]).toString('hex');
}

export function decrypt(message: string): string {
  const authTag = Buffer.from(message.substring(message.length - authTagLength * 2), 'hex');
  const iv = Buffer.from(message.substring(0, ivLength * 2), 'hex');
  const encryptedMessage = Buffer.from(message.substring(ivLength * 2, message.length - authTagLength * 2), 'hex');
  const decipher = createDecipheriv(
    algorithm, key, iv,
    { authTagLength });
  decipher.setAuthTag(authTag);
  const messagetext = Buffer.concat([decipher.update(encryptedMessage), decipher.final()]);
  return messagetext.toString('utf8');
}