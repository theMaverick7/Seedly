import express from 'express'
// import { generateImage, generateURL } from './imgGen.js'
// import smallVer from './imgResize.js'
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__dirname); // Logs the directory path
console.log(__filename); // Logs the file path


const app = express()
const PORT = process.env.PORT || 7070;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.static('productImages'));
app.use(express.json({limit: '16kb'}));
app.use(cookieParser());

// class Product{
//     constructor(id, productName, productQuality, productPrice){
//         this.id = id;
//         this.productName = productName;
//         this.productQuality = productQuality;
//         this.productPrice = productPrice;
//     }
// }

// a fake auth middleware
// app.use((req, res, next) => {
//     let key = 'damn'
//     console.log(`A request has been made: ${req.path}`);
//     if (req.query.q === key) {
//         next();
//     } else {
//         throw new Error('Key not matched')
//     }
// })

// app.get('/', (req,res) => {
//     res.send(`<a href="/products">Click here</a>`)
// })

// app.get('/products', (req, res) => {
//     res.render('products', { products });
// })

// app.get('/products/:id', (req, res) => {
//     const id = req.params.id;
//     let thisProduct = products.find((prod) => prod.id === parseInt(id))
//     console.log(thisProduct);
//     res.render('item', { thisProduct });
// })

// app.get('/create', (req, res) => {
//     res.render('create');
// })

// app.post('/create', async (req, res) => {
//     try {
//         const { productName, productQuality, productPrice, productDesc } = req.body;
//         const URL = generateURL(productName);
//         const img = await generateImage(URL, productName);
//         const smallImg = await smallVer(img, productName);
//         console.log(smallImg);
//         idNum++;
//         products.push({
//             id: idNum,
//             productName: productName,
//             productQuality: productQuality,
//             productPrice: productPrice,
//             productDescription: productDesc,
//             productImg: `/${productName}[productsPage].png`
//         })
//         console.log(products);
//         res.redirect('/products');
//     } catch (error) {
//         console.log(error)
//     }
// })

// app.post('/products/:id/delete', (req, res) => {
//     const id = req.params.id;
//     let indexed = products.findIndex((prod) => prod.id === parseInt(id))
//     //products.remove(indexed);
//     products.splice(indexed, 1);
//     console.log(products);
//     res.redirect('/products');
// })

// app.get('/products/:id/edit', (req, res) => {
//     const id = req.params.id;
//     const qlty = ['poor', 'good', 'excellent'];
//     let thisProduct = products.find((prod) => prod.id === parseInt(id));
//     res.render('edit', { thisProduct, qlty });
// })

// app.post('/products/:id/edit', (req, res) => {
//     const { productName, productQuality, productPrice, productDesc } = req.body;
//     const id = parseInt(req.params.id);
//     let thisProduct = products.find((prod) => prod.id === parseInt(id));
//     products[products.indexOf(thisProduct)] = {
//         'id': id,
//         'productName': productName,
//         'productQuality': productQuality,
//         'productPrice': productPrice,
//         'productDescription': productDesc
//     };
//     console.log(products);
//     res.redirect(`/products/${id}`);
// })

// app.listen(PORT, () => {
//     console.log(`Server now listening for request on port: ${PORT}`)
// });


// let idNum = 1003;

// const products = [
//     {
//         id: 1001,
//         productName: 'Wheat',
//         productQuality: 'excellent',
//         productPrice: 100,
//         productDescription: "Healthy food. I will recommend this to everyone",
//         productImg: `/Wheat[productsPage].png`
//     },
//     {
//         id: 1002,
//         productName: 'Rice',
//         productQuality: 'good',
//         productPrice: 200,
//         productDescription: "High in calories but very filling",
//         productImg: `/Rice[productsPage].png`
//     },
//     {
//         id: 1003,
//         productName: 'Lentils',
//         productQuality: 'poor',
//         productPrice: 50,
//         productDescription: "A good source of protein",
//         productImg: `/Lentils[productsPage].png`
//     },
// ]


// Array.prototype.remove = function (from, to) {
//     let rest = this.slice((to || from) + 1 || this.length);
//     this.length = from < 0 ? this.length + from : from;
//     return this.push.apply(this, rest);
// };

import farmownerRouter from '../src/routes/farmowner.routes.js'

app.use('/api/v1/farmowner', farmownerRouter);

import userRouter from '../src/routes/user.routes.js'

app.use('/api/v1/user', userRouter);

import farmRouter from '../src/routes/farm.routes.js'

app.use('/api/v1/farmowner/farm', farmRouter);







export {app};