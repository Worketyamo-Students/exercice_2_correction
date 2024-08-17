import {
  NextFunction,
  Request,
  Response,
} from 'express';
import {
  body,
  validationResult,
} from 'express-validator';

import { HttpCode } from '../constants';

const validateInputUser={
    
    
      validation : [
  
        //vérification du nom 
        body('nom')
        .notEmpty()
        .withMessage('Veuillez entrer un nom')
        .isString()
        .withMessage('Le nom doit être une chaîne de caractères')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Le nom ne doit pas contenir de caractères spéciaux'),
  
        //validation de l'adresse email
        body('email')
          .isEmail()
          .withMessage('Veuillez entrer une adresse email valide'),
          
          //validation du password 
        body('password')
          .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1
          })
          .withMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'),
        (req: Request, res: Response, next: NextFunction) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(HttpCode.BAD_REQUEST).json({ errors: errors.array() });
          }
          next();
        }
      ]
    }
      
    export default validateInputUser