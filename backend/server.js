import express from 'express';
const app=express();
// app.get('/',(req,res)=>{
//     res.send('Server is ready ');
// });
app.use(express.static('dist'));
//now if i do some changes in react then i need to make dist again and delete last dist folder from backend folder and need to adding new dist folder in backend folder and then run the server.js file to see the changes in react app. To avoid this we can use proxy in package.json file of react app. so that we can see the changes in react app without making dist folder again and again.
app.get('/api/jokes',(req,res)=>{
    const jokes=[
        {
            id:1,
            title:"A joke",
            content:"this is a joke"
        },
        {
            id:2,
            title:"Another joke",
            content:"this is another joke"
        },
        {
            id:3,
            title:"a third joke",
            content:"this is a third joke"
        },
        {
            id:4,
            title:"a fourth joke",
            content:"this is a fourth joke"
        },
        {
            id:5,
            title:"a fifth joke",
            content:"this is a fifth joke"
        }
    ];
    res.send(jokes);
});

const port=process.env.PORT || 3000;
app.listen(port,()=>{   
    console.log(`Server is running at http://localhost:${port}`);   
});

