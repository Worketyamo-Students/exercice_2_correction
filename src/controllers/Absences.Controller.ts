import {
  Request,
  Response,
} from 'express';

import { PrismaClient } from '@prisma/client';

import CalculHeures from '../core/config/calculHeuresMois';
import { HttpCode } from '../core/constants';
import { myerrors } from './Employe.Controllers';

const prisma = new PrismaClient()


const SalaireController = {

    AjusterSalaire: async (req: Request, res: Response) => {
try {
  
  const { employeID } = req.params;
    
  const employe = await prisma.employes.findFirst({
    where: {
      employeID
    },
  })

  if (!employe) {
    
    return res.status(HttpCode.NOT_FOUND).json(myerrors.USER_NOT_FOUND)
    
  } 
    const salaire: number = employe.salaire
    const salairejours = salaire / 22
    console.log(salairejours)
    const salaireheures = salairejours / 8
    console.log(salaireheures)
    const heuresAbsences = await CalculHeures(employe.employeID)
    console.log(heuresAbsences)
    const salairefinal = salaire-(heuresAbsences*salaireheures)
    res.json({msg:`le salaire reduit est de ${salairefinal}`})
  


} catch (error) {
    console.error(error)
}
}
}
export default SalaireController
