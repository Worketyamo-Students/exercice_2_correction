import { Router } from 'express';

import SalaireController from '../controllers/Absences.Controller';

const routeSalaire=  Router ()

 routeSalaire.get('/:employeeID', SalaireController.AjusterSalaire);

export default routeSalaire