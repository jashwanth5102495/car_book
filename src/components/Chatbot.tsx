import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your RentCar assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const predefinedResponses: { [key: string]: string } = {
    'hello': 'Hello! Welcome to RentCar. How can I assist you today?',
    'hi': 'Hi there! I\'m here to help with your car rental needs.',
    'hey': 'Hey! How can I help you with your car rental today?',
    'good morning': 'Good morning! Ready to find your perfect rental car?',
    'good afternoon': 'Good afternoon! How can I assist with your car rental needs?',
    'good evening': 'Good evening! Looking for a car rental? I\'m here to help!',
    'help': 'I can help you with:\n• Finding available cars\n• Booking information\n• Pricing details\n• Rental policies\n• Account support\n\nWhat would you like to know?',
    'booking': 'To book a car:\n1. Browse available cars on our homepage\n2. Select your preferred vehicle\n3. Choose your rental dates\n4. Complete the booking form\n5. Make payment\n\nNeed help with any specific step?',
    'book': 'Ready to book? Simply browse our available cars, select one you like, choose your dates, and follow the booking process. Need help finding a specific type of car?',
    'reserve': 'To reserve a car, browse our available vehicles and click "Book Now" on your preferred car. You can filter by location, price, and car type to find the perfect match!',
    'price': 'Our car rental prices vary by:\n• Vehicle type and model\n• Rental duration\n• Season and demand\n• Location\n\nYou can see exact prices on each car listing. Longer rentals often get better daily rates!',
    'cost': 'Car rental costs depend on the vehicle type and rental duration. Our prices start from ₹2,900/day for economy cars. Premium and luxury vehicles cost more. Check individual car listings for exact pricing!',
    'cheap': 'Looking for budget-friendly options? Try our economy cars like the Toyota Prius starting at ₹2,905/day or Honda Civic at ₹3,320/day. Filter by price to see the most affordable options!',
    'expensive': 'Our premium vehicles include BMW X5 (₹6,225/day) and Tesla Model 3 (₹7,055/day). These offer luxury features and superior performance for a premium experience.',
    'cancel': 'To cancel your booking:\n• Log into your account\n• Go to "My Bookings"\n• Select the booking to cancel\n• Follow the cancellation process\n\nCancellation policies vary by booking type and timing.',
    'refund': 'Refund policies depend on when you cancel:\n• 24+ hours before: Full refund\n• 12-24 hours: 50% refund\n• Less than 12 hours: No refund\n\nProcessing takes 3-5 business days.',
    'payment': 'We accept:\n• Credit cards (Visa, MasterCard, American Express)\n• Debit cards\n• Digital wallets (PayPal, Google Pay)\n• UPI payments\n\nAll payments are processed securely with 256-bit encryption.',
    'pay': 'Payment is easy! We accept all major credit/debit cards and digital wallets. Payment is processed securely during the booking confirmation step.',
    'contact': 'You can reach us:\n• Through this chat (24/7)\n• Email: support@rentcar.com\n• Phone: +91-1234567890\n• Emergency roadside: +91-9876543210',
    'location': 'We have cars available in major cities across India including Mumbai, Delhi, Bangalore, Chennai, Hyderabad, and Pune. Use our search to find cars in your preferred location.',
    'city': 'We operate in major Indian cities: Mumbai, Delhi, Bangalore, Chennai, Hyderabad, and Pune. Which city are you looking to rent a car in?',
    'mumbai': 'Great choice! We have excellent car options in Mumbai including Toyota Camry and other vehicles. Check our Mumbai listings for availability and pricing.',
    'delhi': 'Delhi has great car rental options! We have Honda Civic and other vehicles available. Browse our Delhi section for current availability.',
    'bangalore': 'Bangalore is perfect for car rentals! We have Tesla Model 3 and other premium options. Check our Bangalore listings.',
    'chennai': 'Chennai offers great rental options including BMW X5 and other vehicles. Browse our Chennai section for availability.',
    'hyderabad': 'Hyderabad has excellent cars available including Ford Mustang and others. Check our Hyderabad listings.',
    'pune': 'Pune offers great value rentals including Toyota Prius and other efficient vehicles. Browse our Pune section.',
    'requirements': 'To rent a car you need:\n• Valid driving license (minimum 1 year old)\n• Government ID proof (Aadhaar/Passport)\n• Credit/debit card\n• Minimum age: 21 years\n• Clean driving record\n• Security deposit',
    'age': 'Minimum age for car rental is 21 years. Drivers under 25 may have additional fees. You need a valid driving license that\'s at least 1 year old.',
    'license': 'You need a valid driving license that\'s at least 1 year old. International visitors need an International Driving Permit along with their home country license.',
    'documents': 'Required documents:\n• Valid driving license\n• Government photo ID (Aadhaar/Passport/Voter ID)\n• Credit/debit card for payment\n• Address proof (if different from ID)',
    'insurance': 'All our rentals include:\n• Basic insurance coverage\n• Third-party liability\n• Theft protection\n• 24/7 roadside assistance\n\nOptional comprehensive coverage available for extra protection.',
    'accident': 'In case of an accident:\n1. Ensure everyone\'s safety\n2. Call emergency services if needed\n3. Contact our 24/7 helpline: +91-9876543210\n4. Take photos of the scene\n5. Get a police report if required\n\nOur insurance covers most scenarios.',
    'fuel': 'Fuel policy:\n• Cars are provided with full tank\n• Return with full tank to avoid charges\n• Fuel stations near return locations\n• Fuel charges: ₹100/liter if returned with less fuel',
    'petrol': 'Most of our cars run on petrol. We also have hybrid (Toyota Prius) and electric (Tesla Model 3) options for eco-friendly driving.',
    'electric': 'We have Tesla Model 3 available for electric car enthusiasts! It offers zero emissions and advanced features. Charging stations are available in major cities.',
    'automatic': 'We have many automatic transmission cars including Toyota Camry, BMW X5, Tesla Model 3, and Toyota Prius. Perfect for comfortable city driving!',
    'manual': 'Manual transmission options include Honda Civic and Ford Mustang. Great for driving enthusiasts who prefer more control!',
    'luxury': 'Our luxury options include BMW X5 and Tesla Model 3. These offer premium features, superior comfort, and advanced technology.',
    'economy': 'Economy options include Toyota Prius and Honda Civic. These are fuel-efficient and budget-friendly while still being reliable and comfortable.',
    'suv': 'Our SUV option is the BMW X5 - a premium 7-seater with excellent space and luxury features. Perfect for family trips or group travel.',
    'sedan': 'We have excellent sedans like Toyota Camry and Honda Civic. These offer comfort, efficiency, and reliability for city and highway driving.',
    'sports': 'For sports car enthusiasts, we have the Ford Mustang! It offers thrilling performance and classic American muscle car experience.',
    'family': 'For families, I recommend the BMW X5 (7-seater SUV) or Toyota Camry (spacious sedan). Both offer safety, comfort, and ample space.',
    'business': 'For business travel, consider the Toyota Camry or BMW X5. Both offer professional appearance, comfort, and reliability.',
    'weekend': 'For weekend trips, any of our cars work great! Consider the Ford Mustang for fun, Tesla Model 3 for tech, or BMW X5 for family trips.',
    'long trip': 'For long trips, I recommend Toyota Camry or BMW X5 for comfort, or Toyota Prius for fuel efficiency. All include unlimited mileage!',
    'airport': 'We can arrange airport pickup/drop-off for most of our locations. Mention this during booking or contact us for special arrangements.',
    'delivery': 'Car delivery to your location may be available for an additional fee. Contact us during booking to check availability in your area.',
    'extension': 'To extend your rental:\n• Contact us before your return date\n• Subject to car availability\n• Additional charges apply\n• We\'ll update your booking confirmation',
    'early return': 'Early returns are accepted but rental charges for the minimum booked period still apply. No refund for unused days unless cancelled according to policy.',
    'damage': 'Minor damages are covered by insurance. Major damages may require additional charges. Always report any damage immediately to avoid complications.',
    'breakdown': 'In case of breakdown:\n1. Pull over safely\n2. Call our 24/7 roadside assistance: +91-9876543210\n3. We\'ll arrange repair or replacement\n4. Service is included in your rental',
    'traffic': 'Traffic fines and violations are the renter\'s responsibility. We\'ll forward any tickets received to the renter\'s address.',
    'gps': 'GPS navigation is available in most of our cars. Tesla Model 3 and BMW X5 have built-in navigation systems.',
    'bluetooth': 'Most of our cars have Bluetooth connectivity for hands-free calling and music streaming. Check individual car features.',
    'ac': 'All our cars come with air conditioning for your comfort during the journey.',
    'music': 'Our cars have music systems with Bluetooth, USB, and AUX connectivity. Some premium cars have premium sound systems.',
    'wifi': 'WiFi hotspot is available in select premium vehicles like BMW X5 and Tesla Model 3. Check car features for availability.',
    'default': 'I\'m here to help with car rentals! I can assist with booking, pricing, locations, car features, policies, and more. What specific information do you need about our car rental services?'
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();
    
    // Direct keyword matches (highest priority)
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (key !== 'default' && message.includes(key)) {
        return response;
      }
    }
    
    // Additional keyword mappings for better matching
    const keywordMappings: { [key: string]: string[] } = {
      'hello': ['hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
      'help': ['assist', 'support', 'guide', 'information', 'what can you do'],
      'booking': ['book', 'reserve', 'rent', 'hire', 'reservation'],
      'price': ['cost', 'rate', 'fee', 'charge', 'expensive', 'cheap', 'affordable', 'budget'],
      'cancel': ['cancellation', 'refund', 'return money'],
      'payment': ['pay', 'card', 'visa', 'mastercard', 'upi', 'wallet'],
      'location': ['city', 'where', 'mumbai', 'delhi', 'bangalore', 'chennai', 'hyderabad', 'pune'],
      'requirements': ['need', 'document', 'license', 'age', 'eligibility'],
      'insurance': ['accident', 'damage', 'coverage', 'protection'],
      'fuel': ['petrol', 'diesel', 'electric', 'gas', 'mileage'],
      'automatic': ['auto', 'gear', 'transmission'],
      'luxury': ['premium', 'bmw', 'tesla', 'expensive car'],
      'economy': ['cheap car', 'budget car', 'affordable car', 'prius'],
      'family': ['kids', 'children', 'large group', 'spacious'],
      'business': ['corporate', 'office', 'professional', 'work'],
      'breakdown': ['emergency', 'problem', 'issue', 'not working'],
      'extension': ['extend', 'longer', 'more days', 'extra time'],
      'delivery': ['home delivery', 'pickup', 'doorstep']
    };
    
    // Check keyword mappings
    for (const [responseKey, keywords] of Object.entries(keywordMappings)) {
      for (const keyword of keywords) {
        if (message.includes(keyword)) {
          return predefinedResponses[responseKey] || predefinedResponses.default;
        }
      }
    }
    
    // Pattern-based responses for common question formats
    if (message.includes('how') && (message.includes('book') || message.includes('rent'))) {
      return predefinedResponses.booking;
    }
    
    if (message.includes('what') && (message.includes('price') || message.includes('cost'))) {
      return predefinedResponses.price;
    }
    
    if (message.includes('where') && (message.includes('available') || message.includes('location'))) {
      return predefinedResponses.location;
    }
    
    if (message.includes('can i') || message.includes('is it possible')) {
      return 'Yes, most likely! Could you be more specific about what you\'d like to do? I can help with booking, cancellations, extensions, delivery, and more.';
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return 'You\'re welcome! Is there anything else I can help you with regarding your car rental needs?';
    }
    
    if (message.includes('bye') || message.includes('goodbye')) {
      return 'Goodbye! Feel free to chat with me anytime you need help with car rentals. Have a great day!';
    }
    
    // If no match found, provide a more helpful default response
    return predefinedResponses.default;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-blue-500 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">RentCar Support</h3>
            <p className="text-sm opacity-90">We're here to help!</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <Bot size={16} className="mt-1 flex-shrink-0" />
                    )}
                    {message.sender === 'user' && (
                      <User size={16} className="mt-1 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 max-w-xs px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot size={16} />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;