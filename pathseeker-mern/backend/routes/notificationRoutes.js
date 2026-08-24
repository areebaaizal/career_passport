import {Router} from 'express'; import {list,read,readAll,remove} from '../controllers/notificationController.js'; import {protect} from '../middleware/auth.js';
const r=Router(); r.use(protect); r.get('/',list); r.put('/:id/read',read); r.put('/read-all',readAll); r.delete('/:id',remove); export default r;
