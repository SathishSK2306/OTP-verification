import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');

  const sendOtp = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/v1/auth/login/send-otp', { mobile });
      setGeneratedOtp(res.data.otp);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/v1/auth/login/verify-otp', { otp });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Verification failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h2>OTP Login</h2>
      {step === 1 && (
        <>
          <input
            type="text"
            placeholder="Enter Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <br /><br />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <p>OTP sent: <strong>{generatedOtp}</strong></p>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <br /><br />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
