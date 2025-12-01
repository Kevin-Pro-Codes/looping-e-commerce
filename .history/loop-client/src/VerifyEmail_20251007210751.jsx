import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      alert("Invalid verification link");
      navigate('/');
      return;
    }

    fetch(`http://localhost:8000/api/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        navigate('/login');
      })
      .catch(err => {
        console.error(err);
        alert("Verification failed");
        navigate('/');
      });
  }, []);

  return <div>Verifying your email...</div>;
}
