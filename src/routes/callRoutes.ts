import express, { Request, Response } from 'express';
import { handleIncomingCall, initiateRecording } from '../controllers/callController';

const router = express.Router();

const RETRY_DELAY = 5000; // Retry after 5 seconds
const MAX_RETRIES = 5; // Max retry attempts

const tryStartRecording = async (CallSid: string, attempt: number = 1) => {
  try {
    await initiateRecording(CallSid);
    console.log('Recording started successfully');
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      console.log(`Retrying to start recording (Attempt ${attempt})...`);
      setTimeout(() => tryStartRecording(CallSid, attempt + 1), RETRY_DELAY);
    } else {
      console.error('Unable to start recording after multiple attempts:', error);
    }
  }
};

router.post('/incoming-call', async (req: Request, res: Response) => {
  try {
    const callDetails = await handleIncomingCall(req.body);
    res.type('text/xml');
    console.log('Incoming call', callDetails);
    res.status(200).send(callDetails);

    // Attempt to start recording with a retry mechanism
    tryStartRecording(req.body.CallSid);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process incoming call' });
  }

});

export default router;
