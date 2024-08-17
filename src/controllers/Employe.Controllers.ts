import bcrypt from 'bcrypt';
import {
  Request,
  Response,
} from 'express';

import { PrismaClient } from '@prisma/client';

import { HasherLePass } from '../core/config/fonctionHashage';
import mytokens from '../core/config/tokens';
import { HttpCode } from '../core/constants';
import { CustumRequest } from '../core/middleware/verify.middleware';

const prisma = new PrismaClient()
export const myerrors = {
  USER_NOT_FOUND: "Aucun utilisateur trouvé",
  INTERNAL_SERVER_ERROR: "Une Erreure est survenue lors du traitement de votre requete"
}

const EmployeController = {
  CreateEmploye: async (req: Request, res: Response) => {
    try {
      const { nom, email, password, poste, salaire } = req.body;
      const salaireInt: number = parseInt(salaire)
      const hashedpass: string = await HasherLePass(password)
      const newEmploye = await prisma.employes.create({
        data: {
          nom,
          email,
          password: hashedpass,
          poste,
          salaire: salaireInt
        }
      });
      res.status(HttpCode.CREATED).json(newEmploye);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: myerrors.INTERNAL_SERVER_ERROR });
    }
  },
  LoginEmploye: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body
      const employé = await prisma.employes.findUnique({
        where: {
          email
        }
      })
      if (employé) {
        const comparePass = await bcrypt.compare(password, employé.password)
        //génération des tokens
        if (!comparePass) {
          res.status(HttpCode.UNAUTHORIZED).json({ msg: "veillez entrer un mot de passe valide!!!" })
        }
        const AccessToken = mytokens.generateAccessToken(employé)
        const RefreshToken = mytokens.generateRefreshToken(employé)

        res.cookie("cook_emp_xyz", RefreshToken, { httpOnly: true, secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 })
        res.header('Authorization', AccessToken)
        res.json({ msg: "connection reussie" })
        console.log(AccessToken)
      }
      else {
        res.status(HttpCode.FORBIDDEN).json({ msg: "adresse mail invalide !" })
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: myerrors.INTERNAL_SERVER_ERROR });
    }
  },
  RefreshAtokens: async (req: CustumRequest, res: Response) => {
    try {
      //recupération de l'objet employé a l'aide de notre requette custumisée
      const employe = req.employe
      const payload = { ...employe };
      //suppression de la date d'expiration du payload
      delete payload.exp
      //creation du noveau cookie
      res.cookie("cook_emp_xyz", payload, {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
      const newAccessToken = await mytokens.generateAccessToken(payload)
      res.status(HttpCode.OK).json(newAccessToken);
    } catch (error) {
      console.error(error);

    }
  },
  LogOut: async (req: Request, res: Response) => {

    try {
        // Supprimer le cookie de refresh token
        res.clearCookie("cook_emp_xyz", {
            httpOnly: true,
            secure: true,
        });
        res.status(HttpCode.OK).json({ message: "Vous êtes déconnecté" });
    } catch (error) {
        console.error(error);
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
            msg: myerrors.INTERNAL_SERVER_ERROR,
        });
    }
},
//obtenir la liste des employés 
Getemploye: async (req: CustumRequest, res: Response) => {
    try {
        const employe = req.employe
        console.log(employe)
        const employeID: string = employe.payload.employeID
        const employes = await prisma.employes.findUnique({
            where: {
                
                employeID: employeID
            },
            select: {
                employeID: true,
                nom: true,
                email: true,
                poste: true,
                salaire: true,
            }
        });
        res.status(HttpCode.OK).json(employes)
    } catch (error) {
        console.error(error);
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: myerrors.INTERNAL_SERVER_ERROR })
    }
},
//mise a jour de l'empoyé connecté 
PutEmployé: async (req: CustumRequest, res: Response) => {
    try {
        const { nom, email, password, poste, salaire } = req.body;
        const salaireInt: number = parseInt(salaire)
        const hashedpass: string = await HasherLePass(password)
        const employe = req.employe
        const employeID = employe.payload.employeID
        const newEmploye = await prisma.employes.update({
            where: {
                employeID
            },
            data: {
                nom,
                email,
                password: hashedpass,
                poste,
                salaire: salaireInt
            },
            select: {
                employeID: true,
                nom: true,
                email: true,
                poste: true,
                salaire: true
            }
        })
        res.status(HttpCode.OK).json(newEmploye)

    } catch (error) {
        console.error(error)
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: myerrors.INTERNAL_SERVER_ERROR })
    }
},
//supression de l'employé connecté
DeleteEmploye: async (req: CustumRequest, res: Response) => {
    try {
        const employe = req.employe
        const employeID = employe.payload.employeID
        await prisma.employes.delete({
            where: {
                employeID
            }
        })
        res.status(HttpCode.OK).json({ msg: "le compte a été supprimé" })
    } catch (error) {
        console.error(error)
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: myerrors.INTERNAL_SERVER_ERROR })
    }
}
}
export default EmployeController;