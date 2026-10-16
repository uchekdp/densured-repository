import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const SYSTEM_INSTRUCTION = `You are the official Academic Counselor and Admissions Guide for D Ensured Consult (Tutorial & Educational Consultancy Center) in Lagos, Nigeria.
Motto: "Learn, Emerge and Succeed.".
Official Academic Session: Official 2026/2027 academic session.
Founder & Managing Director: Mr. Akinjo Rotimi (the only authorized signatory).
Center Location: DOYIN PLAZA, IGBOELERIN BUSSTOP, BESIDE PRIME-MART, OKOMAIKO, LAGOS.
Phone & WhatsApp: 08147896930.
Programs Offered:
- UTME (JAMB CBT) Intensive Preparation with 120-seat computer testing lab.
- WAEC / WASSCE Science, Commercial & Arts tracks.
- NECO Senior School Certificate examinations.
- IELTS Academic & General Training (British Council Certified syllabus).
- ATSWA (ICAN Professional Accounting foundation).
- SAT & TOEFL international scholarship tracks.

Monthly Tuition:
- Morning Shift (09:00 AM): ₦20,000 / month.
- Evening Shift (02:00 PM): ₦15,000 / month.

Tone & Demeanor: Friendly, encouraging, professional, highly knowledgeable about Nigerian examinations, subject combinations, JAMB cutoff points, and university admission guidelines. Keep responses structured, concise, and helpful.`;

export async function sendMessageToGemini(
  history: ChatMessage[],
  newMessage: string
): Promise<string> {
  const apiKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    '';

  if (!apiKey) {
    // Intelligent local counselor fallback when running in an environment without a backend key
    const lower = newMessage.toLowerCase();
    if (lower.includes('fee') || lower.includes('tuition') || lower.includes('cost') || lower.includes('price')) {
      return `For the **Official 2026/2027 academic session**, tuition at D Ensured Consult is structured conveniently by shift:\n\n• **Morning Shift (09:00 AM – 01:30 PM):** ₦20,000 / month\n• **Evening Shift (02:00 PM – 06:00 PM):** ₦15,000 / month\n\nTuition includes full access to our 120-seat computer testing laboratory, weekly grand mock drills, and syllabus study packs. You can register right here via our **Admission** tab!`;
    }
    if (lower.includes('location') || lower.includes('where') || lower.includes('address') || lower.includes('center')) {
      return `Our flagship campus is located at:\n\n**DOYIN PLAZA, IGBOELERIN BUSSTOP**\n*(Beside Prime-Mart, Okomaiko, Lagos State)*\n\nOffice hours are Monday – Friday (8:00 AM – 6:30 PM) and Saturday (8:30 AM – 5:00 PM). You can also reach our desk directly at **08147896930**.`;
    }
    if (lower.includes('founder') || lower.includes('director') || lower.includes('rotimi') || lower.includes('head')) {
      return `D Ensured Consult was founded and is directed by **Mr. Akinjo Rotimi**, our visionary educational consultant and pioneer tutor with over 15 years of proven results across UTME, WAEC, NECO, and IELTS. Mr. Akinjo Rotimi is the sole authorized signatory for all official receipts and student ID cards.`;
    }
    if (lower.includes('jamb') || lower.includes('utme') || lower.includes('cbt')) {
      return `Our **UTME (JAMB CBT) Intensive Preparation** is renowned across Lagos with a verified 98.4% pass rate. We provide:\n\n1. Rigorous 40-seconds-per-question speed heuristics.\n2. Authentic JAMB 8-key CBT software interface.\n3. Detailed novel reviews and Use of English register mastery.\n4. Weekly grand mock exams with instant computer-scored diagnostics.`;
    }
    if (lower.includes('ielts') || lower.includes('abroad') || lower.includes('sat')) {
      return `For candidates targeting overseas study, our **IELTS Masterclass** covers Academic and General Training modules led by British Council certified trainers. We also prepare students for the Digital SAT and TOEFL iBT to secure American and European university admissions.`;
    }
    return `Welcome to **D Ensured Consult**! Learn, Emerge and Succeed. We are currently enrolling for the **Official 2026/2027 academic session** for UTME (JAMB), WAEC, NECO, IELTS, ATSWA, and SAT. How can I assist you with your exam preparation, subject combination, or admission process today?`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Format conversation history for Gemini multi-turn chat
    const formattedContents = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Add new user message
    formattedContents.push({
      role: 'user',
      parts: [{ text: newMessage }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const text = response.text || '';
    return text.trim() || 'I am here to assist you with admissions and academic programs at D Ensured Consult.';
  } catch (error) {
    console.error('Gemini API request error:', error);
    return `Welcome to D Ensured Consult! We offer intensive preparation for UTME (JAMB CBT), WAEC, NECO, and IELTS. Our center is located at Doyin Plaza, Igboelerin Bus Stop, Okomaiko, Lagos. Call or WhatsApp us at 08147896930 for immediate assistance!`;
  }
}
