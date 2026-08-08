import express from 'express';

const router = express.Router();

let connectionState: 'open' | 'close' = 'open';

// Mocked WhatsApp Message Sender for Serverless Environments (Vercel)
// Real integration should use Twilio API, WhatsApp Cloud API, or Z-API.
export async function sendWhatsAppMessage(phone: string, message: string) {
    if (connectionState !== 'open') {
        console.warn(`[WhatsApp - MOCK] Não foi possível enviar para ${phone}: API inativa.`);
        return false;
    }
    
    try {
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10 || cleanPhone.length === 11) {
            cleanPhone = '55' + cleanPhone;
        }
        
        const maskedPhone = cleanPhone.slice(0, 4) + '****' + cleanPhone.slice(-4);
        console.log(`[WhatsApp - SERVERLESS MOCK] SMS Gerado para ${maskedPhone} (mensagem ocultada por privacidade)`);
        // To implement real sending, replace with Axios call to Twilio or WhatsApp Cloud API
        // e.g. await axios.post('https://graph.facebook.com/v17.0/.../messages', { ... });
        return true;
    } catch (err) {
        console.error(`[WhatsApp - MOCK] Erro simulado:`, err);
        return false;
    }
}

// API Endpoints para o Frontend
router.get('/status', (req, res) => {
    res.json({
        state: connectionState,
        qrCodeUrl: null, // No QR code in serverless mock
        message: 'Mock do WhatsApp rodando em modo Serverless.'
    });
});

router.post('/reconnect', (req, res) => {
    connectionState = 'open';
    res.json({ success: true, message: 'Reconectado ao mock com sucesso.' });
});

router.post('/logout', (req, res) => {
    connectionState = 'close';
    res.json({ success: true, message: 'Mock desconectado.' });
});

export default router;
