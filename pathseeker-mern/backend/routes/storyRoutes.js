import {Router} from 'express'; import {list,mine,create,pending,updateStatus} from '../controllers/storyController.js'; import {protect,adminOnly} from '../middleware/auth.js';
const r=Router(); r.get('/',list); r.get('/mine',protect,mine); r.post('/',protect,create); r.get('/pending',protect,adminOnly,pending); r.put('/:id/status',protect,adminOnly,updateStatus); export default r;
