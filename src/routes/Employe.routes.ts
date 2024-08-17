import { Router } from 'express';

import EmployeController from '../controllers/Employe.Controllers';
import validateInputUser from '../core/middleware/validate.middleware';
import verifyEmploye from '../core/middleware/verify.middleware';

const routeEmploye = Router();

routeEmploye.post('/',validateInputUser.validation ,EmployeController.CreateEmploye)
routeEmploye.post('/login', EmployeController.LoginEmploye);
routeEmploye.post('/logout', 
    verifyEmploye.verifyAccessToken, 
    verifyEmploye.verifyRefreshToken,
     EmployeController.LogOut);

routeEmploye.get('/profile',
    verifyEmploye.verifyAccessToken,
    EmployeController.Getemploye);

routeEmploye.put('/profile',
    verifyEmploye.verifyAccessToken,
    verifyEmploye.verifyRefreshToken,
    validateInputUser.validation,
    EmployeController.PutEmployé);
    
routeEmploye.delete('/profile', verifyEmploye.verifyAccessToken, verifyEmploye.verifyRefreshToken,EmployeController.DeleteEmploye)



export default routeEmploye;