import crypto from "crypto";

const ENCRYPTION_ALGORITHM = "aes-256-cbc";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const ENCODING = {
  INPUT: "utf8",
  OUTPUT: "hex",
  FINAL: "base64url",
} as const;

const deriveKey = (secret: string): Buffer => {
  return Buffer.from(
    crypto
      .createHash("sha256")
      .update(secret)
      .digest("base64")
      .substring(0, KEY_LENGTH),
  );
};

export const encryptObject = <T extends object>(data: T, secret: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(secret);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  let encrypted = cipher.update(
    JSON.stringify(data),
    ENCODING.INPUT,
    ENCODING.OUTPUT,
  );
  encrypted += cipher.final(ENCODING.OUTPUT);

  return Buffer.from(
    iv.toString(ENCODING.OUTPUT) + encrypted,
    ENCODING.OUTPUT,
  ).toString(ENCODING.FINAL);
};

export const decryptText = <T extends object>(
  encryptedText: string,
  secretKey: string,
): T => {
  const buffer = Buffer.from(encryptedText, ENCODING.FINAL).toString(
    ENCODING.OUTPUT,
  );
  const iv = Buffer.from(buffer.substring(0, IV_LENGTH * 2), ENCODING.OUTPUT);
  const encrypted = buffer.substring(IV_LENGTH * 2);
  const key = deriveKey(secretKey);

  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);

  let decrypted = decipher.update(encrypted, ENCODING.OUTPUT, ENCODING.INPUT);
  decrypted += decipher.final(ENCODING.INPUT);

  return JSON.parse(decrypted) as T;
};
