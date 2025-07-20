import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, ExternalLink, Phone } from 'lucide-react';

const WhatsAppMessenger: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const formatPhoneNumber = (number: string) => {
    // Remove all non-digit characters
    const cleaned = number.replace(/\D/g, '');
    
    // If it starts with 0, replace with country code (assuming +91 for India)
    if (cleaned.startsWith('0')) {
      return cleaned.substring(1);
    }
    
    // If it's 10 digits, assume it's an Indian number
    if (cleaned.length === 10) {
      return cleaned;
    }
    
    // If it already has country code, return as is
    if (cleaned.length > 10) {
      return cleaned;
    }
    
    return cleaned;
  };

  const generateWhatsAppLink = () => {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    return `https://wa.me/${formattedNumber}`;
  };

  const handleSendMessage = () => {
    if (!phoneNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }
    
    const whatsappLink = generateWhatsAppLink();
    window.open(whatsappLink, '_blank');
  };

  const isValidPhoneNumber = phoneNumber.trim().length > 0;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
          <MessageCircle className="h-6 w-6 text-green-500" />
        </div>
        <CardTitle>WhatsApp Messenger</CardTitle>
        <CardDescription>
          Send a message to any number without saving the contact
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter phone number (e.g., 9876543210)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Enter with or without country code. For India, you can enter 10 digits starting with 6-9.
          </p>
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={!isValidPhoneNumber}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open WhatsApp
        </Button>

        {isValidPhoneNumber && (
          <div className="text-xs text-muted-foreground text-center">
            This will open WhatsApp with the number: {formatPhoneNumber(phoneNumber)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessenger; 