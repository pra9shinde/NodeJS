const fs = require('fs');

const requestHandler = (req,res) => {
    const url = req.url;
    const method = req.method;

    if (url === '/') {
        res.write('<html>');
        res.write('<head><title>Server</title></head>');
        res.write('<body>');
        res.write('<form action="/message" method="POST">');
        res.write('<input type="text" name="txtmessage"><button type="submit">Submit</button>');
        res.write('</form>');
        res.write('</body></html>');//Send html to user
        return res.end();
    }
    
    if (url === '/message' && method === 'POST') {
        const body = [];
        //Node recieves form data in chunks hence we are creating event listner of data and pushing the fetched data in an array
        req.on('data', (chunk) => {
            //console.log(chunk);
            body.push(chunk);
        });
    
        //Once all data is fetched we process it. for dat we need to create a listener which will fire. 
        return req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();//Chunks gives us raw data which we cannot read hence we store it in a buffer with string format
            //console.log(parsedBody);
            const message = parsedBody.split('=')[1]; //Parsed Body returns txtmessage=TEXTFIELD DATA hence we do a split and get the data
    
            //Create a new text file & Write
            fs.writeFile('message.txt', message, (err) => {
                res.statusCode = 302;//302 is redirection statuscode and set header data
                res.setHeader('Location', '/');//redirect to base page. 
                return res.end();
            });
        });
    }
     
    //console.log(req.method, req.url, req.headers);
    res.setHeader('Content-Type', 'text/html');//Sets writing format
    res.write('<html><head><title>Server</title></head><body><h1>Hello from Node JS Server</h1></body></html>');//Send html to user
    res.end();//end the response
};

//Export the mdoule
module.exports = requestHandler;

