import jwt from 'jsonwebtoken';

import { envs } from './env';

const mytokens = {
    // Générer un jeton d'accès
    generateAccessToken: (payload:any) => {
        try {
            return jwt.sign({ payload}, envs.JWT_ACCESS_TOKEN, { expiresIn: '30min' });
        } catch (error) {
            console.error( error);
        }
    
    },
    //verifier le jeton d'acces

    verifyAccessToken: (token:any) => {
      try {
        return jwt.verify(token, envs.JWT_ACCESS_TOKEN as string);
      } catch (error) {
        console.error( error);
      }
    },
    // décoder le jeton d'acces

    decodeAccessToken: (token: any) => {
      try {
        return jwt.decode(token) as { user: string };
      } catch (error) {
        console.error(error);
      
      }
    },
   // generer le refresh token 
    generateRefreshToken: (payload:any) => {

          try {
            return jwt.sign({ payload }, envs.JWT_REFRESH_TOKEN, { expiresIn: '30d' });
          } catch (error) {
            console.error(error);
          }
   
    },
  // verifier 

    verifyRefreshToken: (token: string) => {
      try {
        return jwt.verify(token, envs.JWT_REFRESH_TOKEN as string);
      } catch (error) {
        console.error(error);
      }
    },
  // décoder 

    decodeRefreshToken: (token: string) => {
      try {
        return jwt.decode(token) as { user: string };
      } catch (error) {
        console.error(error);
      }
    }
  };

export default mytokens