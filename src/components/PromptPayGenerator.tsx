import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Smartphone, CreditCard, Download, Share2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCodeCanvas from "@/components/QRCodeCanvas";
import { validateThaiID, validatePhoneNumber, generatePromptPayQR } from "@/utils/promptpay";

const PromptPayGenerator = () => {
  const [identifier, setIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [inputType, setInputType] = useState<'phone' | 'id' | 'unknown'>('unknown');
  const qrRef = useRef<HTMLCanvasElement>(null);
  const qrSectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const validateInput = (value: string) => {
    const cleanValue = value.replace(/\s+/g, '');
    
    if (cleanValue.length === 0) {
      setIsValid(null);
      setInputType('unknown');
      return;
    }

    if (validatePhoneNumber(cleanValue)) {
      setIsValid(true);
      setInputType('phone');
    } else if (validateThaiID(cleanValue)) {
      setIsValid(true);
      setInputType('id');
    } else {
      setIsValid(false);
      setInputType('unknown');
    }
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdentifier(value);
    validateInput(value);
  };

  const scrollToQRCode = () => {
    if (qrSectionRef.current) {
      qrSectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  const generateQR = () => {
    if (!isValid || !identifier) {
      toast({
        title: "ข้อมูลไม่ถูกต้อง",
        description: "กรุณากรอกเบอร์โทรศัพท์หรือเลขบัตรประชาชนที่ถูกต้อง",
        variant: "destructive",
      });
      return;
    }

    const cleanIdentifier = identifier.replace(/\s+/g, '');
    const amountValue = amount ? parseFloat(amount) : undefined;
    
    if (amount && (isNaN(amountValue!) || amountValue! <= 0)) {
      toast({
        title: "จำนวนเงินไม่ถูกต้อง",
        description: "กรุณากรอกจำนวนเงินที่ถูกต้อง",
        variant: "destructive",
      });
      return;
    }

    try {
      const qrData = generatePromptPayQR(cleanIdentifier, amountValue);
      setQrCode(qrData);
      toast({
        title: "สร้าง QR Code สำเร็จ",
        description: "QR Code PromptPay ถูกสร้างเรียบร้อยแล้ว",
      });
      
      // Scroll to QR code section after a brief delay to ensure it's rendered
      setTimeout(() => {
        scrollToQRCode();
      }, 100);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้าง QR Code ได้",
        variant: "destructive",
      });
    }
  };

  const saveQRCode = async () => {
    if (!qrRef.current || !qrCode) return;

    const canvas = qrRef.current;
    const fileName = `promptpay-${identifier.replace(/\s+/g, '')}.png`;

    // Check if Web Share API is supported (primarily mobile devices)
    if (navigator.share && navigator.canShare) {
      try {
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          
          const file = new File([blob], fileName, { type: 'image/png' });
          
          // Check if we can share files
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'PromptPay QR Code',
                text: 'QR Code สำหรับการโอนเงินผ่าน PromptPay'
              });
              
              toast({
                title: "แชร์สำเร็จ",
                description: "สามารถบันทึกรูปจากหน้าต่างแชร์ได้",
              });
            } catch (error) {
              // If sharing fails, fall back to download
              downloadQRFallback(canvas, fileName);
            }
          } else {
            // If can't share files, fall back to download
            downloadQRFallback(canvas, fileName);
          }
        }, 'image/png');
      } catch (error) {
        downloadQRFallback(canvas, fileName);
      }
    } else {
      // Fall back to traditional download for desktop
      downloadQRFallback(canvas, fileName);
    }
  };

  const downloadQRFallback = (canvas: HTMLCanvasElement, fileName: string) => {
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "ดาวน์โหลดสำเร็จ",
      description: "QR Code ถูกดาวน์โหลดเรียบร้อยแล้ว",
    });
  };

  const getInputIcon = () => {
    if (inputType === 'phone') return <Smartphone className="h-4 w-4 text-green-500" />;
    if (inputType === 'id') return <CreditCard className="h-4 w-4 text-blue-500" />;
    return null;
  };

  const getValidationIcon = () => {
    if (isValid === true) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isValid === false) return <AlertCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Input Form */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              ข้อมูล PromptPay
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                เบอร์โทรศัพท์หรือเลขบัตรประชาชน
              </Label>
              <div className="relative">
                <Input
                  id="identifier"
                  type="text"
                  placeholder="เช่น 0812345678 หรือ 1234567890123"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  className={`pr-20 text-base ${
                    isValid === true 
                      ? 'border-green-500 focus:border-green-500' 
                      : isValid === false 
                      ? 'border-red-500 focus:border-red-500' 
                      : ''
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {getInputIcon()}
                  {getValidationIcon()}
                </div>
              </div>
              {identifier && (
                <p className={`text-xs ${
                  isValid === true 
                    ? 'text-green-600' 
                    : isValid === false 
                    ? 'text-red-600' 
                    : 'text-gray-500'
                }`}>
                  {isValid === true 
                    ? `ตรวจพบ: ${inputType === 'phone' ? 'เบอร์โทรศัพท์' : 'เลขบัตรประชาชน'} ที่ถูกต้อง`
                    : isValid === false 
                    ? 'รูปแบบไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
                    : 'กรุณากรอกเบอร์โทรศัพท์ (10 หลัก) หรือเลขบัตรประชาชน (13 หลัก)'
                  }
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                จำนวนเงิน (บาท) - ไม่บังคับ
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="เช่น 100.50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                className="text-base"
              />
              <p className="text-xs text-gray-500">
                หากไม่ระบุจำนวน ผู้จ่ายสามารถกรอกจำนวนเงินเองได้
              </p>
            </div>

            <Button 
              onClick={generateQR} 
              disabled={!isValid}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 text-base"
            >
              สร้าง QR Code
            </Button>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <Card ref={qrSectionRef} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-lg lg:text-xl">QR Code PromptPay</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            {qrCode ? (
              <div className="text-center space-y-4">
                <div className="bg-white p-3 lg:p-4 rounded-lg shadow-inner inline-block">
                  <QRCodeCanvas ref={qrRef} value={qrCode} size={220} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 break-all">
                    {inputType === 'phone' ? 'เบอร์โทร' : 'เลขบัตรประชาชน'}: {identifier}
                  </p>
                  {amount && (
                    <p className="text-sm text-gray-600 font-medium">
                      จำนวนเงิน: ฿{parseFloat(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={saveQRCode}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-base w-full sm:w-auto"
                >
                  {isMobile ? (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      บันทึก/แชร์ QR Code
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      ดาวน์โหลด QR Code
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 lg:py-12 text-gray-400">
                <div className="text-4xl lg:text-6xl mb-4">📱</div>
                <p className="text-sm lg:text-base">กรอกข้อมูลและกดสร้าง QR Code</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromptPayGenerator;
