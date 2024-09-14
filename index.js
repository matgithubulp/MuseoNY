const expres = require("express");
const app = expres();
const port = 3000;
const paht = require("path");
const publico = paht.join(__dirname, "publico");

app.use(expres.static(publico));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
    
});


app.listen(port, () => {
    console.log(`Ejemplo de puerto ${port}`);
})




