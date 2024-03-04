import CryptoJS from "crypto-js";

export const encryptFileContent = (fileContent, key) => {
  const encryptedContent = CryptoJS.AES.encrypt(fileContent, key).toString();
  return encryptedContent;
};
