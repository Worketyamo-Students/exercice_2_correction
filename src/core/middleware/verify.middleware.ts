import {
  NextFunction,
  Request,
  Response,
} from 'express';

import { myerrors } from '../../controllers/Employe.Controllers';
import mytokens from '../config/tokens';
import { HttpCode } from '../constants';

export interface CustumRequest extends Request {

    employe?: any;
}

const verifyEmploye = {


    //verifier si le token d'acces est encore valide 

    verifyAccessToken: async (req: CustumRequest, res: Response, next: NextFunction) => {

        try {
            const AccessToken = req.headers.authorization;

            if (!AccessToken) {

                res.status(HttpCode.UNAUTHORIZED).json({ msg: `aucun jeton d'acces valide!!!` })
            }
            const AccessTokenverify = await mytokens.verifyAccessToken(AccessToken);
            req.employe= AccessTokenverify
            const datetoken = req.employe.exp
            // if (Date.now() >= datetoken) {
            //     res.status(HttpCode.FORBIDDEN).json({ msg: `le jeton d'access a expiré!!!` })
            // }
            next();

        }
        catch (error) {

            console.error(error)
            res.json({ msg: myerrors.INTERNAL_SERVER_ERROR }).status(HttpCode.INTERNAL_SERVER_ERROR)
        }

    },
    verifyRefreshToken: async (req: CustumRequest, res: Response, next: NextFunction) => {

        try {
            const RefreshToken = req.cookies.cook_emp_xyz
            if (!RefreshToken) {
                res.status(HttpCode.UNAUTHORIZED).json({ msg: `aucun jeton de rafraichissement valide!!!` })
            }
            const decodeRefresh = await mytokens.decodeRefreshToken(RefreshToken)
            if (!decodeRefresh) {
                res.status(HttpCode.UNAUTHORIZED).json({ msg: `jeton de rafrechissement invalide` })
            }

            req.employe = decodeRefresh

            next()

        } catch (error) {
            console.error(error)
            res.json({ msg: myerrors.INTERNAL_SERVER_ERROR }).status(HttpCode.INTERNAL_SERVER_ERROR)
        }
    }

}

export default verifyEmploye