const express = require('express')
const async = require('async')
const app = express()
const port = 3005

const PROTO_PATH = './app/grpc/protos/hitung_streaming_luas.proto'
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    long: String,
    enum: String,
    defaults: true,
    oneofs: true,
});

let luas_proto = grpc.loadPackageDefinition(packageDefinition).hitungluas;

const grpc_client = new luas_proto.HitungLuas('localhost:50051', grpc.credentials.createInsecure());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/luas-persegi-panjang', (req, res) => {
    grpc_client.LuasPersegiPanjang({panjang: 10, lebar: 5}, function (err, response) {
        console.log('message: ', response.message);
        console.log('luas: ', response.luas);
        console.log('------------------------------');
        res.send('luas: ' + response.luas)
    })
})

function runRouteCountWebOpened(callback) {
    let call = grpc_client.CountWebOpened();
    call.on('data', function (serverReply) {
        console.log('total: ' + serverReply.total.toString());
    });
    call.on('end', function () {
        console.log('end')
        call.end();
    })
    call.write({id: port})
}

async.series([
    runRouteCountWebOpened
]);

app.listen(port, () => {
    console.log(`app listening on http://127.0.0.1:3000`)
});
