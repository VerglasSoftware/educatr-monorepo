import { useEffect } from 'react';
import { Auth } from 'aws-amplify';

const Callback = () => {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have the tokens in the URL fragment
        const hash = window.location.hash;
        if (hash) {
          const tokens: any = hash
            .substring(1)
            .split('&')
            .reduce((acc: any, item) => {
              const [key, value] = item.split('=');
              acc[key] = decodeURIComponent(value);
              return acc;
            }, {});

          // If we have the tokens, manually federate the user
          if (tokens.id_token && tokens.access_token) {
            await Auth.federatedSignIn(
              'EntraID', // Custom provider name
              { token: tokens.id_token, expires_at: Date.now() + 3600 * 1000 },
              { name: 'John Doe' }
            );
          }
        }

        // After federatedSignIn, attempt to get the authenticated user
        const user = await Auth.currentAuthenticatedUser();
        console.log('Authenticated user:', user);
      } catch (error) {
        console.error('Error during authentication:', error);
      }
    };

    handleCallback();
  }, []);

  return <div>Processing your login...</div>;
};

export default Callback;