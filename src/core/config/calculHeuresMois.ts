import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()
const CalculHeures= async (employeID:string):Promise<number>=>{
    let totalHeuresAbsence = 0;
    const today = new Date(Date.now());
    const an: number = today.getFullYear();
    const mois: number = today.getMonth() + 1;
    console.log(mois);
    const utcdebutMois = new Date(an, mois-1, 1)
    console.log(utcdebutMois);
    const debutMois = new Date(utcdebutMois.getTime() - utcdebutMois.getTimezoneOffset() * 60000)
    console.log(debutMois);
    const utcFinMois = new Date(an, mois, 0, 23, 59, 59);
    const FinMois = new Date(utcFinMois.getTime() - utcFinMois.getTimezoneOffset() * 60000)
    console.log(FinMois);
    // Récupérer les absences de l'employé pour le mois en cours
    const absences = await prisma.absences.findMany({
      where: {
        employeIDs: { has: employeID },
        date: {
          gte: debutMois,
          lte: FinMois,
        },
      },
    });
    //calcul des heures d'absence
   
    absences.forEach((absence) => {
      totalHeuresAbsence += absence.heureAbsences;
    });

 return totalHeuresAbsence
}
export default CalculHeures