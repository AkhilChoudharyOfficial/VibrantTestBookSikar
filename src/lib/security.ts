// Obfuscation helpers for encrypting/decrypting sensitive localStorage values

export const obfuscate = (data: string): string => {
  try {
    return btoa(encodeURIComponent(data).split('').map((char, index) => {
      return String.fromCharCode(char.charCodeAt(0) ^ (13 + (index % 5)));
    }).join(''));
  } catch (e) {
    return data;
  }
};

export const deobfuscate = (obfuscated: string): string => {
  try {
    const XORed = atob(obfuscated);
    return decodeURIComponent(XORed.split('').map((char, index) => {
      return String.fromCharCode(char.charCodeAt(0) ^ (13 + (index % 5)));
    }).join(''));
  } catch (e) {
    return obfuscated;
  }
};

export const loadSecureKey = <T>(key: string, defaultValue: T): T => {
  try {
    const value = localStorage.getItem(key);
    if (value) {
      if (value.startsWith('obf:')) {
        const raw = deobfuscate(value.substring(4));
        return JSON.parse(raw);
      }
      return JSON.parse(value);
    }
  } catch (e) {
    console.error('Error loading secure key: ' + key, e);
  }
  return defaultValue;
};

export const saveSecureKey = <T>(key: string, value: T): void => {
  try {
    const serialized = JSON.stringify(value);
    const obfuscated = 'obf:' + obfuscate(serialized);
    localStorage.setItem(key, obfuscated);
  } catch (e) {
    console.error('Error saving secure key: ' + key, e);
  }
};
