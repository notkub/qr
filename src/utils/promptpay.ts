
export const validateThaiID = (id: string): boolean => {
  if (!id || id.length !== 13) return false;
  
  const digits = id.split('').map(Number);
  if (digits.some(isNaN)) return false;
  
  // Checksum validation for Thai National ID
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (13 - i);
  }
  
  const checksum = (11 - (sum % 11)) % 10;
  return checksum === digits[12];
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Check if it's 10 digits starting with 0
  if (!/^0\d{9}$/.test(cleanPhone)) return false;
  
  // Check if it starts with valid mobile prefixes
  const validPrefixes = ['08', '09', '06'];
  return validPrefixes.some(prefix => cleanPhone.startsWith(prefix));
};

const formatLength = (length: number): string => {
  return length.toString().padStart(2, '0');
};

const formatTag = (tag: string, value: string): string => {
  return tag + formatLength(value.length) + value;
};

export const generatePromptPayQR = (identifier: string, amount?: number): string => {
  let qrString = '';
  
  // 00: Payload Format Indicator
  qrString += formatTag('00', '01');
  
  // 01: Point of Initiation Method
  qrString += formatTag('01', '11');
  
  // 29: Merchant Account Information
  let merchantAccount = '';
  merchantAccount += formatTag('00', 'A000000677010111');
  
  // Format identifier for PromptPay
  let formattedIdentifier = identifier.replace(/[\s-]/g, '');
  
  // For phone numbers, remove leading 0 and add country code
  if (validatePhoneNumber(identifier)) {
    formattedIdentifier = '0066' + formattedIdentifier.substring(1);
  }
  
  merchantAccount += formatTag('01', formattedIdentifier);
  qrString += formatTag('29', merchantAccount);
  
  // 52: Merchant Category Code
  qrString += formatTag('52', '0000');
  
  // 53: Transaction Currency (THB = 764)
  qrString += formatTag('53', '764');
  
  // 54: Transaction Amount (if specified)
  if (amount && amount > 0) {
    const amountStr = amount.toFixed(2);
    qrString += formatTag('54', amountStr);
  }
  
  // 58: Country Code
  qrString += formatTag('58', 'TH');
  
  // 63: CRC (placeholder, will be calculated)
  qrString += '6304';
  
  // Calculate CRC16-CCITT
  const crc = calculateCRC16CCITT(qrString);
  qrString += crc.toString(16).toUpperCase().padStart(4, '0');
  
  return qrString;
};

const calculateCRC16CCITT = (data: string): number => {
  let crc = 0xFFFF;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }
  
  return crc;
};
