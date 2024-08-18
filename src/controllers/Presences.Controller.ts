import {
  Request,
  Response,
} from 'express';

import { PrismaClient } from '@prisma/client';

import CalculHeures from '../core/config/calculHeuresMois';
import { HttpCode } from '../core/constants';
import { myerrors } from './Employe.Controllers';

const prisma = new PrismaClient()
  const PresenceController = {
  
    checkInt: async (req: Request, res: Response) => {
      try {
        const { employeID } = req.body;
        const HeureArrive = new Date(Date.now());
        //ajuster l'heure d'arrivé en fonction de mon fuseau horaire
        const localTime = new Date(HeureArrive.getTime() - HeureArrive.getTimezoneOffset() * 60000)
        // Heure normale de début du travail et ajustement de l'heure normal de fin 
        const heureNormalA: Date = new Date();
        heureNormalA.setHours(8, 30, 0, 0);
        const localHeureNormalA = new Date(heureNormalA.getTime() - heureNormalA.getTimezoneOffset() * 60000);
  
        const heureFin = new Date();
        heureFin.setHours(20, 0, 0, 0); // Heure normale de fin de travail
        const localHeureFin = new Date(heureFin.getTime() - heureFin.getTimezoneOffset() * 60000)
  
        let heuresAbsence: number = 0;
        const Datejour: Date = new Date(Date.now());
        Datejour.setHours(0, 0, 0, 0)
        // mettre l'heure sur mon fuseau horaire
        const localDate = new Date(Datejour.getTime() - Datejour.getTimezoneOffset() * 60000);
        console.log(localDate);
  
        if (employeID) {
          const employe = await prisma.employes.findUnique({
            where: { employeID },
          });
  
          if (!employe) {
            return res.status(HttpCode.NOT_FOUND).json({ msg: myerrors.USER_NOT_FOUND });
          }
  
          // Vérifier si une présence existe déjà pour l'employé ce jour-là
          const existPresence = await prisma.presences.findFirst({
            where: {
              employeIDs: { has: employeID },
              date: localDate,
            },
          });
  
          if (existPresence) {
            // Mise à jour de la présence existante
            const presenceUpdate = await prisma.presences.update({
              where: { presenceID: existPresence.presenceID },
              data: {
                heureDebut: localTime,
                estpresent: true,
              },
            });
            console.log(localTime)
            // Si l'employé est en retard
            if (localTime > localHeureNormalA) {
              const retardArrivee: number = (localTime.getTime() - localHeureNormalA.getTime()) / (1000 * 60 * 60);
              heuresAbsence += retardArrivee;
              console.log(heuresAbsence);
              // Vérifier s'il existe déjà une absence pour ce jour
              const existAbsence = await prisma.absences.findFirst({
                where: {
                  employeIDs: { has: employeID },
                  date: localDate,
                },
              });
  
              if (!existAbsence) {
                await prisma.absences.create({
                  data: {
                    employeIDs: [employeID],
                    date: localDate,
                    heureAbsences: heuresAbsence,
                  },
                });
                console.log('Absence créée');
              } else {
                await prisma.absences.update({
                  where: { absencesID: existAbsence.absencesID },
                  data: {
                    heureAbsences: existAbsence.heureAbsences + heuresAbsence,
                  },
                });
                console.log('Absence mise à jour');
              }
            }
  
            return res.status(HttpCode.OK).json(presenceUpdate);
          }
          else {
            // Créer une nouvelle présence si aucune n'est enregistrée
            const newPresence = await prisma.presences.create({
              data: {
                date: localDate,
                heureDebut: localTime, // Heure actuelle comme heure de début
                employeIDs: [employeID],
                estpresent: true,
              },
            });
            console.log(localTime)
            // Vérifier les retards et les absences pour la nouvelle présence
            if (localTime > localHeureNormalA) {
              const retardArrivee = (localTime.getTime() - localHeureNormalA.getTime()) / (1000 * 60 * 60);
              heuresAbsence += retardArrivee;
              await prisma.absences.create({
                data: {
                  employeIDs: [employeID],
                  date: localDate,
                  heureAbsences: heuresAbsence,
                },
              });
              console.log("en retard")
            }
            console.log("nouvelle présence créée")
            return res.status(HttpCode.CREATED).json(newPresence);
          }
        } else {
          if (localHeureFin) {
  
            const heuresAbsence: number = 8
            await prisma.absences.create({
              data: {
                employeIDs: [employeID],
                date: localDate,
                heureAbsences: heuresAbsence,
              },
            })
          }
        }
      } catch (error) {
        console.error(error);
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: myerrors.INTERNAL_SERVER_ERROR });
      }
    },
    checkOut: async (req: Request, res: Response) => {
      try {
        const { employeID } = req.body;
        const heureFin = new Date();
        heureFin.setHours(20, 0, 0, 0); // Heure normale de fin de travail
        const localHeureFin = new Date(heureFin.getTime() - heureFin.getTimezoneOffset() * 60000)
        const currentTime = new Date();
        const jour = new Date(Date.now())
        jour.setHours(0, 0, 0, 0)
  
        const localDate = new Date(jour.getTime() - jour.getTimezoneOffset() * 60000)
        // Vérifier si une présence existe pour l'employé ce jour-là
        const existingPresence = await prisma.presences.findFirst({
          where: {
            employeIDs: { has: employeID as string },
            date: localDate
          }
        });
  
        if (!existingPresence) {
          return res.status(HttpCode.NOT_FOUND).json({ msg: `Aucune présence enregistrée pour cet employé aujourd'hui` });
        } else {
          // Mise à jour de la présence existante
          const presenceUpdate = await prisma.presences.update({
            where: { presenceID: existingPresence.presenceID },
            data: {
              heureFin: currentTime, // Heure actuelle comme heure de fin
              estpresent: false,
            },
          });
  
          // Si l'employé quitte avant l'heure normale de fin
          if (currentTime < localHeureFin) {
            const partiAvant = (localHeureFin.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
  
            const existAbsence = await prisma.absences.findFirst({
              where: {
                employeIDs: { has: employeID },
                date: localDate,
              },
            });
            console.log(existAbsence)
            if (!existAbsence) {
              await prisma.absences.create({
                data: {
                  employeIDs: [employeID],
                  date: localDate,
                  heureAbsences: partiAvant,
                },
              });
              console.log('ddddd')
  
            } else {
              await prisma.absences.update({
                where: { absencesID: existAbsence.absencesID },
                data: {
                  heureAbsences: existAbsence.heureAbsences + partiAvant,
                },
              });
            }
            console.log(`partie avant`);
          }
          console.log('partie');
          return res.status(HttpCode.OK).json(presenceUpdate);
        }
      } catch (error) {
        console.error(error);
        return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: myerrors.INTERNAL_SERVER_ERROR });
      }
    }
    ,
    getAttendances: async (req: Request, res: Response) => {
      try {
        const { employeID } = req.body;
  
        let attendances;
  
        if (employeID) {
  
          attendances = await prisma.presences.findMany({
            where: {
              employeIDs: { has: employeID as string }
            },
            orderBy: {
              date: 'desc'
            }
          });
  
        }
        else {
          attendances = await prisma.presences.findMany({
            orderBy: {
              date: 'desc'
            }
          });
        }
  
        if (!attendances) {
          return res.status(HttpCode.NOT_FOUND).json({ msg: 'Aucune présence trouvée.' });
        }
  
        return res.status(HttpCode.OK).json(attendances);
  
      } catch (error) {
        console.error(error);
        return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: myerrors.INTERNAL_SERVER_ERROR });
      }
    },
    CalculHeures: async (req: Request, res: Response)=> { 
      try {
        const { employeID } = req.params;
        const totalHeuresAbsence= await CalculHeures(employeID)
        res.json(totalHeuresAbsence).status(HttpCode.OK)
      } catch (error) {
        console.error(error);
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: myerrors.INTERNAL_SERVER_ERROR });
      }
    },
    
  }
  export default PresenceController