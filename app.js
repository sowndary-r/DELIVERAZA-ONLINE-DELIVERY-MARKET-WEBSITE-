var express = require('express');
var ejs = require('ejs');
let dbo = require('./dbConnection');
let ObjectID = dbo.ObjectID;
var app = express();
const bodyparser = require('body-parser');
app.use(express.static('public'));
var LocalStorage= require('node-localstorage').LocalStorage,
localstorage = new LocalStorage('./scratch');




app.set('view engine','ejs');

app.use(bodyparser.urlencoded({extended:true}));

app.get('/',(req,res)=>{
  res.render('pages/signin');
})
app.get('/admin',(req,res)=>{
  res.render('pages/admin');
})
app.post('/admindashboard', async (req,res)=>{
  let database= await dbo.getdatabase();
  const collection = database.collection('admin');
  let user = req.body.username;
  let pass = req.body.password;
  let admininfo = await collection.findOne({username:user});
 // console.log(admininfo);
 let username = admininfo.username;
 let password = admininfo.password;
 let message='';
 if((username === user && password === pass))
 {
  res.redirect('/dashboard');
 }
  else
  {
    message = 'please enter correct password';
   res.render('pages/admin');
  }
  
})

app.use('/index',async (req,res)=>{

  let database = await dbo.getdatabase();
  let collection = database.collection('fruits');
  let usercollection = database.collection('users');
  var newuser;
  if(req.query.signin)
  {
       localstorage.setItem('name',req.body.name);
       localstorage.setItem('address',req.body.address);
       localstorage.setItem('phone',req.body.phone);
       
      return res.redirect('/index');
  }
  
  
  const cursor = collection.find({}); 
    let item = await cursor.toArray();
  res.render('pages/index',{item});
})

app.get('/dashboard',async (req,res)=>{

  let database= await dbo.getdatabase();
  const collection = database.collection('fruits');
  let ordercollection = database.collection('orders');
  const cursor = collection.find({}); //retrieving all the data
    let products = await cursor.toArray();
    const ordercursor = ordercollection.find({}); //retrieving all the data
    let orders = await ordercursor.toArray();
    let delivereditem;
  let edit_id,edit_product;
   if(req.query.delete_id)
   {
    await collection.deleteOne({item:req.query.delete_id});
   return res.redirect('/dashboard');
   }

   if(req.query.edit_id)
   {
    edit_id=req.query.edit_id;
    edit_product = await collection.findOne({item:edit_id});
   
   }
  
   if(req.query.delivered_id)
   {
        delivereditem = req.query.delivered_id;
        await ordercollection.deleteOne({_id:new ObjectID(delivereditem)});
        return res.redirect('/dashboard'); 
   }
  
 
  res.render('pages/dashboard',{
    products,
    edit_product,
    orders
  })
})
app.post('/update',async (req,res)=>{
  let database=await dbo.getdatabase();
  
  const collection = database.collection('fruits');
  let newitem = {
    item : req.body.item,
    cost : req.body.cost,
    quantity : req.body.quantity,
    stock : req.body.stock
  }

  await collection.updateOne({item:req.body.item},{$set:newitem});
  return res.redirect('/dashboard');
 
})
app.get('/orderdetails',async(req,res)=>{
  let database=await dbo.getdatabase();
  const itemcollection = database.collection('fruits');
  let details = localstorage.getItem('ordereditems');
  
  
  res.render('pages/order',{details});
})

app.post('/order',async(req,res)=>{
  let database=await dbo.getdatabase();
  
  const collection = database.collection('orders');
  const itemcollection = database.collection('fruits');

  let product_name = req.query.order_id;
  let quantity = req.body.quantity;
 
  let itemdetails = await itemcollection.findOne({item:product_name});
  let stock = Number(itemdetails.stock);
  let currstock = stock - Number(quantity);
  
  await itemcollection.updateOne({item:product_name},{$set:{stock:currstock}});
   itemdetails = await itemcollection.findOne({item:product_name});
  
  let item = {
    product : product_name,
    quantity : quantity,
    name : localstorage.getItem('name'),
    address :  localstorage.getItem('address')

  };

 
  await collection.insertOne(item);
  res.redirect('/index');
 
 
})
app.post('/dashboard',async(req,res)=>{

  let database=await dbo.getdatabase();
  
  const collection = database.collection('fruits');

 
  let newitem = {
    item : req.body.item,
    cost : req.body.cost,
    quantity : req.body.quantity,
    stock : req.body.stock
  }

  await collection.insertOne(newitem);

    return res.redirect('/dashboard?status=1');
})
app.listen(4080);