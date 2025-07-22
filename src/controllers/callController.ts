import { CallDetails } from '../types';
import { config } from '../config';
import { Twilio } from 'twilio';

// Twilio client
const client = new Twilio(config.twilio.accountSid, config.twilio.authToken);

export async function handleIncomingCall(callData: CallDetails): Promise<string> {
  // Validate and process incoming call
  if (!callData) {
    throw new Error('Invalid call data');
  }

  // Refer the ConversationRelay docs for a complete list of attributes - https://www.twilio.com/docs/voice/twiml/connect/conversationrelay#conversationrelay-attributes
  return `<?xml version="1.0" encoding="UTF-8"?>
          <Response>
              <Start>
                <Transcription intelligenceService="${config.twilio.voiceIntelligenceSid}"
                  languageCode="es-MX" 
                  inboundTrackLabel="OpenAI Assistant"
                  outboundTrackLabel="Customer"
                  statusCallbackUrl="https://events.hookdeck.com/e/src_su8VnSes9EUDvIpR3fV01ywb/transcriptions"/> 
              </Start>   
              <Connect action="https://${config.ngrok.domain}/api/action">
                    <ConversationRelay url="wss://${config.ngrok.domain}" dtmfDetection="true" interruptible="true"
                      welcomeGreeting="${config.twilio.welcomeGreeting}"
                      ttsProvider="${config.languages.spanish.ttsProvider}"
                      ttsLanguage="${config.languages.spanish.locale_code}"
                      voice="${config.languages.spanish.voice}"
                      transcriptionProvider="${config.languages.spanish.transcriptionProvider}"
                      transcriptionLanguage="${config.languages.spanish.transcriptionLanguage}"
                      elevenlabsTextNormalization="on"
                      > 
                    </ConversationRelay>
              </Connect>
          </Response>`;
}

export async function initiateRecording(callSid: string): Promise<void> {
  try {
    await client.calls(callSid).recordings.create({
      recordingStatusCallback: 'https://events.hookdeck.com/e/src_su8VnSes9EUDvIpR3fV01ywb/recordings',
      recordingStatusCallbackMethod: 'POST',
      recordingChannels: 'dual',
      recordingTrack: 'both'
    });
    console.log(`Recording started for Call SID: ${callSid}`);
  } catch (error) {
    console.error('Failed to initiate recording:', error);
    throw error;
  }
}