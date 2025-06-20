
import PromptPayGenerator from "@/components/PromptPayGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            PromptPay QR Code Generator
          </h1>
          <p className="text-lg text-gray-600">
            สร้าง QR Code สำหรับรับเงินผ่าน PromptPay ง่ายๆ
          </p>
        </div>
        <PromptPayGenerator />
      </div>
    </div>
  );
};

export default Index;
